/*
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
  A Property is a high-level instance variable.

  Properties contain more information than typical variable declarations.
  Such as: label, help text, pre/post-set callbacks, default value,
  value factory, units, etc.

  When setting a Propery's value, the callback order is:
    1. adapt()
    2. preSet()
    3. assertValue()
       value updated
       property change event fired
    4. postSet()

   Unless the user has provided a customer 'setter', in which case the order is
     1. setter()

  A sub-class or refinement can include a partial Property definition which
  will override or add meta-information to the Property.
**/
foam.CLASS({
  package: 'foam.core',
  name: 'Property',
  extends: 'FObject',

  properties: [
    /**
      The name of this property.  The name corresponds to the key used to
      read/write this property on objects which are instances of a Class
      on which this property exists.

      There are currently no naming rules enforced for property names.
      Certain names (such as those with spaces) will require using square
      bracket syntax ( ex. obj['property name'] = 'foo'; ), as opposed to dot
      style syntax ( ex. obj.property = 'foo'; ) for reading/writing the
      property.
     */
    {
      name: 'name',
      required: true
    },

    /* User-level help. Could/should appear in GUI's as online help. */
    'help',

    /**
      The default-value of this property.
      A property which has never been set or has been cleared
      by setting it to 'undefined' or cleared with clearProperty()
      will have the default value.
    */
    'value',

    /**
      A factory is a function which initializes the property value
      when accessed for the first time, if not already set.
    */
    'factory',

    /**
      A function of the form:
        Object function(oldValue, newValue, property)
      adapt is called whenever the property is set. It's intended
      to adapt the value to the appropriate type if required.
      Adapt must return a value. It can return newValue unchanged
      if it was already the appropriate type.
      If you attempt to set a property to "undefined" as in
      "obj.a = undefined;", that is equivalent to calling
      obj.clearProperty('a'); which does not trigger adapt nor preSet.
    */
    'adapt',

    /**
      A function of the form:
        Object function(oldValue, newValue, property)
      preSet is called before the propery's value is updated.
      It can veto the value change by returning a different newValue
      (including returning oldValue to leave the property unchanged).
      If you attempt to set a property to "undefined" as in
      "obj.a = undefined;", that is equivalent to calling
      obj.clearProperty('a'); which does not trigger adapt nor preSet.
    */
    'preSet',

    /**
      A function of the form:
        void function(newValue, property) throws Exception
      assertValue can validate newValue and throw an exception if it's an
      invalid value.
    */
    'assertValue',

    /**
      A function of the form:
        void function(oldValue, newValue, property)
      postSet is called after the Property's value has been updated.
    */
    'postSet',

    /**
     * A dynamic function which defines this Property's value.
     * Similar to a 'factory', except that the function takes arguments which
     * are named the same as other properties of this object.
     *
     * Whenever the values of any of the argument properties change, the value
     * of this Property is invalidated. Like a regular factory, an invalidated
     * property will be recalculated by calling the provided expression function
     * when accessed. This makes expressions very efficient, because their
     * values are only recomputed on demand.
     */
    'expression',

    /**
      A getter function which completely replaces the normal
      Property getter process. Whenever the property is accessed, getter is
      called and its value is returned.
    */
    'getter',

    /**
      A setter function which completely replaces the normal
      Property setter process. Whenever the property is set, setter is
      called.
      A function of the form:
        void function(newValue)
    */
    'setter',

    /**
      A required Property can not be set to null, undefined, 0 or "".
     */
    'required',
  ],

  methods: [
    /**
      Handle overriding of Property definition from parent class by
      copying undefined values from parent Property, if it exists.
    */
    function installInClass(c) {
      foam.assert(
        this.name[this.name.length - 1] !== '$',
        'Property names must not end with $');

      var prop = this;
      var superProp = c.__proto__.getAxiomByName(prop.name);

      if ( superProp && foam.core.Property.isInstance(superProp) ) {
        prop = superProp.createChildProperty_(prop);
        c.axiomMap_[prop.name] = prop;
      }

      var cName = foam.String.constantize(prop.name);
      var prev = c[cName];

      // Detect constant name collisions
      if ( prev && prev.name !== prop.name ) {
        throw 'Class constant conflict: ' +
          c.id + '.' + cName + ' from: ' + prop.name + ' and ' + prev.name;
      }

      c[cName] = prop;
    },

    /**
      Install a property onto a prototype from a Property definition.
      (Property is 'this').
    */
    function installInProto(proto) {
      // Take Axiom from class rather than using 'this' directly,
      // since installInClass() may have created a modified version
      // to inherit Property Properties from a super-Property.
      var prop        = proto.cls_.getAxiomByName(this.name);
      var name        = prop.name;
      var adapt       = prop.adapt;
      var preSet      = prop.preSet;
      var assertValue = prop.assertValue;
      var postSet     = prop.postSet;
      var factory     = prop.factory;
      var value       = prop.value;
      var hasValue    = ! foam.Undefined.isInstance(value);
      var slotName    = foam.String.toSlotName(name);
      var eFactory    = this.exprFactory(prop.expression);

      // Property Slot
      // This costs us about 4% of our boot time.
      // If not in debug mode we should share implementations like in FOAM1.
      //
      // Define a PropertySlot accessor (see Slot.js) for this Property.
      // If the property is named 'name' then 'name$' will access a Slot
      // for this Property. The Slot is created when first accessed and then
      // cached.
      // If the Slot is set (to another slot) the two Slots are link()'ed
      // together, meaning they will now dynamically share the same value.
      Object.defineProperty(proto, slotName, {
        get: function propertySlotGetter() {
          return prop.toSlot(this);
        },
        set: function propertySlotSetter(slot2) {
          // TODO: Add support for linking slots here once Slots
          // have .linkTo/.linkFrom support.
          throw 'Property slot setters currently unsupported.';
        },
        configurable: true,
        enumerable: false
      });


      // Define Property getter and setter based on Property properties.
      // By default, getter and setter stores instance value for property
      // in this.instance_[<name of property>],
      // unless the user provides custom getter and setter methods.

      // Getter
      // Call 'getter' if provided, else return value from instance_ if set.
      // If not set, return value from 'factory', 'expression' or
      // (default) 'value', if provided.
      var getter =
        prop.getter ? prop.getter :
        factory ? function factoryGetter() {
          return this.hasOwnProperty(name) ?
            this.instance_[name] :
            this[name] = factory.call(this) ;
        } :
        eFactory ? function eFactoryGetter() {
          return this.hasOwnProperty(name) ? this.instance_[name] :
              this.hasOwnPrivate_(name) ? this.getPrivate_(name)  :
              this.setPrivate_(name, eFactory.call(this));
        } :
        hasValue ? function valueGetter() {
          var v = this.instance_[name];
          return foam.Undefined.isInstance(v) ? value : v;
        } :
        function simpleGetter() { return this.instance_[name]; };

      var setter = prop.setter ? prop.setter :
        function propSetter(newValue) {
          if ( newValue === undefined ) {
            this.clearProperty(name);
            return;
          }

          // Get old value but avoid triggering factory if present.
          // Factories can be expensive to generate, and if the value
          // has been explicitly set to some value, then it isn't worth
          // the expense of computing the old stale value.
          foam.assert(! this.hasOwnPrivate_(name) || eFactory,
              'hasOwnPrivate_ should only be true when there is an expression');
          var oldValue =
              this.hasOwnProperty(name) ? this[name] :
              this.hasOwnPrivate_(name) ? this[name] :
              factory || eFactory ? undefined :
              this[name];

          if ( eFactory && this.hasOwnPrivate_(name) ) {
            this.clearPrivate_(name);
          }

          if ( adapt )  newValue = adapt.call(this, oldValue, newValue, prop);

          if ( preSet ) newValue = preSet.call(this, oldValue, newValue, prop);

          if ( assertValue ) assertValue.call(this, newValue, prop);

          this.instance_[name] = newValue;

          // If this is the result of a factory setting the initial value,
          // then don't fire a property change event, since it hasn't
          // really changed.
          if ( ! factory || oldValue !== undefined ) {
            this.pubPropertyChange_(prop, oldValue, newValue);
          }

          // FUTURE: pub to a global topic to support dynamic()

          if ( postSet ) postSet.call(this, oldValue, newValue, prop);
        };

      Object.defineProperty(proto, name, {
        get: getter,
        set: setter,
        configurable: true
      });
    },

    /* Validate an object which has this Property. */
    function validateInstance(o) {
      if ( this.required && ! o[this.name] ) {
        throw 'Required property ' +
            o.cls_.id + '.' + this.name +
            ' not defined.';
      }
    },

    /**
     * Create a factory function from an expression function.
     */
    function exprFactory(e) {
      if ( ! e ) return null;
      foam.assert(foam.Function.isInstance(e),
          'Argument to exprFactory must be a function.');

      var argNames = foam.Function.formalArgs(e);
      var name = this.name;

      // FUTURE: Determine how often the value is being invalidated, and if it's
      // happening often, then don't unsubscribe.
      return function exportedFactory() {
        var self = this;
        var args = new Array(argNames.length);
        var subs = new Array(argNames.length);
        var l = function() {
          if ( ! self.hasOwnProperty(name) ) {
            var oldValue = self[name];
            self.clearPrivate_(name);

            // Avoid creating a slot and publishing the event if there are no
            // listeners.
            if ( self.hasListeners('propertyChange', name) ) {
              self.pub('propertyChange', name, self.slot(name));
            }
          }
          for ( var i = 0; i < subs.length; i++ ) subs[i].destroy();
        };

        for ( var i = 0; i < argNames.length; i++ ) {
          subs[i] = this.slot(argNames[i]).sub(l);
          args[i] = this[argNames[i]];
        }
        return e.apply(this, args);
      };
    },

    /** Returns a developer-readable description of this Property. **/
    function toString() { return this.name; },

    /** Flyweight getter for this Property. **/
    function get(o) { return o[this.name]; },

    /** Flyweight setter for this Property. **/
    function set(o, value) {
      o[this.name] = value;
      return this;
    },

    /**
     * Handles property inheritance.
     *
     * Builds a version of this property suitable for installation
     * into a child class when the child class contains a property
     * definition of the same name.
     */
    function createChildProperty_(child) {
      var prop = this.clone();

      /* istanbul ignore next */
      if ( child.cls_ !== foam.core.Property &&
           child.cls_ !== this.cls_ ) {
        console.warn('Unsupported change of property type from',
                     this.cls_.id, 'to', child.cls_.id);

        return child;
      }

      for ( var key in child.instance_ ) {
        prop.instance_[key] = child.instance_[key];
      }

      return prop;
    },

    /**
     * Converts this axiom to a slot that represents the value
     * of this slot on object "obj".  Since this axiom is a Property
     * it will be converted to a PropertySlot which represents
     * the value of the property as stored on obj.
     */
    function toSlot(obj) {
      var slotName = foam.String.toSlotName(this.name);
      var slot     = obj.getPrivate_(slotName);

      if ( ! slot ) {
        slot = foam.core.internal.PropertySlot.create();
        slot.obj  = obj;
        slot.prop = this;
        obj.setPrivate_(slotName, slot);
      }

      return slot;
    },

    function cloneProperty(
      /* any // The value to clone */         value,
      /* object // Add values to this map to
         have them installed on the clone. */ cloneMap
    ) {
      /** Override to provide special deep cloning behavior. */
      cloneMap[this.name] = ( value && value.clone ) ? value.clone() : value;
    }
  ]
});
