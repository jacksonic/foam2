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
      var hasValue    = typeof value !== 'undefined';

      // Define Property getter and setter based on Property properties.
      // By default, getter and setter stores instance value for property
      // in this.instance_[<name of property>],
      // unless the user provides custom getter and setter methods.

      // Getter
      // Call 'getter' if provided, else return value from instance_ if set.
      // If not set, return value from 'factory' or (default) 'value', if
      // provided.
      var getter =
        prop.getter ? prop.getter :
        factory ? function factoryGetter() {
          return this.hasOwnProperty(name) ?
            this.instance_[name] :
            this[name] = factory.call(this) ;
        } :
        hasValue ? function valueGetter() {
          var v = this.instance_[name];
          return typeof v !== 'undefined' ? v : value ;
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
          var oldValue =
            factory  ? ( this.hasOwnProperty(name) ? this[name] : undefined ) :
            this[name] ;

          if ( adapt )  newValue = adapt.call(this, oldValue, newValue, prop);

          if ( preSet ) newValue = preSet.call(this, oldValue, newValue, prop);

          if ( assertValue ) assertValue.call(this, newValue, prop);

          this.instance_[name] = newValue;

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
