/**
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

/*
  FObject is the root of FOAM's class hierarchy.

  We define FObject twice, first as a LIB to install all of
  the static/class methods in the top-level FObject class,
  then with a CLASS below to define methods on the FObject
  prototype.

  For details on how FObject fits in to the FOAM class system,
  see the documentation in the top of Boot.js
 */
foam.LIB({
  name: 'foam.core.FObject',

  constants: {
    // Each class has a prototype object which is the prototype of all
    // instances of the class. A classes prototype extends its parent
    // classes prototype.
    prototype: {},

    // Each class has a map of Axioms added to the class.
    // Map keys are the name of the axiom.
    // The classes axiomMap_'s extends its parent's axiomMap_.
    axiomMap_: {},

    // Each class has a map of "private" variables for use by
    // axioms. Storing internal data in private_ instead of on the
    // class directly avoids name conflicts with public features of
    // the class.
    private_:  { axiomCache: {} }
  },

  methods: [
    function create(args, opt_parent) {
      /**
       * Create a new instance of this class.
       * Configured from values taken from 'args', if supplifed.
       * @param {Object=} args
       * @param {any=} opt_parent
       */

      var obj = Object.create(this.prototype);

      // Increment number of objects created of this class.
      this.count_++;

      // Properties have their values stored in instance_ instead
      // of on the object directly. This lets us defineProperty on
      // the object itself so that we can add extra behaviour
      // to properties (things like preSet, postSet, firing property-
      // change events, etc.).
      obj.instance_ = {};

      // initArgs() is the standard argument extraction method.
      obj.initArgs(args, opt_parent);

      // init() is called when object is created.
      // This is where class-specific initialization code should
      // be put (not in initArgs).
      obj.init();

      return obj;
    },

    function createSubClass() {
      /**
       * Used to create a sub-class of this class.  Sets up the appropriate
       * prototype chains for the class, class.prototype and axiomMap_
       *
       * The very first "subClass" that we create will be FObject itself, when
       * we define the FObject class rather than the FObject lib that we are
       * currently defining.
       *
       * So instead of actually creating a subClass, we will just return "this"
       * and replace createSubClass() on FObject to actually create real
       * sub-classes for all subsequent uses of FObject.createSubClass()
       */
      foam.core.FObject.createSubClass = function() {
        var cls = Object.create(this);

        cls.prototype = Object.create(this.prototype);
        cls.axiomMap_ = Object.create(this.axiomMap_);
        cls.private_  = { axiomCache: {} };

        return cls;
      };

      return this;
    },

    function installAxioms(axs) {
      /**
       * Install Axioms into the class and prototype.
       * Invalidate the axiom-cache, used by getAxiomsByName().
       * @param {Array} axs
       */

      // Invalidate the axiomCache.

      this.private_.axiomCache = {};

      // We install in two passes to avoid ordering issues from Axioms which
      // need to access other axioms, like ids: and exports:.

      for ( var i = 0 ; i < axs.length ; i++ ) {
        var a = axs[i];

        foam.assert(foam.Object.isInstance(a), 'Axiom is not an object.');

        foam.assert(a.installInClass || a.installInProto,
                    'Axiom amust define one of installInClass or ' +
                    'installInProto');

        this.axiomMap_[a.name] = a;
      }

      for ( var i = 0 ; i < axs.length ; i++ ) {
        var a = axs[i];

        a.installInClass && a.installInClass(this);
        a.installInProto && a.installInProto(this.prototype);
      }
    },

    function installAxiom(a) {
      /**
       * Install a single axiom into the class and prototype.
       *
       * If you have an array of axioms to install it is better to use
       * the more efficient installAxioms() method rather than this.
       * @param {Object} a
       */
      this.installAxioms([ a ]);
    },

    function isInstance(o) {
      /**
       * Determine if an object is an instance of this class
       * or one of its sub-classes.
       * @param {any=} o
       */

      return !! ( o && o.cls_ && this.isSubClass(o.cls_) );
    },

    function isSubClass(c) {
      /**
       * Determine if a class is either this class or a sub-class.
       * @param {any=} c
       */

      if ( ! c ) return false;

      var cache = this.private_.isSubClassCache ||
        ( this.private_.isSubClassCache = {} );

      if ( cache[c.id] === undefined ) {
        cache[c.id] = ( c === this.prototype.cls_ ) ||
            (c.getAxiomByName && c.getAxiomByName('implements_' + this.id)) ||
            this.isSubClass(c.__proto__);
      }

      return cache[c.id];
    },

    function getAxiomByName(name) {
      /**
       * Find an axiom by the specified name from either this class or an
       * ancestor.
       * @param {String} name
       */
      return this.axiomMap_[name];
    },

    function getAxiomsByClass(cls) {
      /**
       * Returns all axioms defined on this class or its parent classes
       * that are instances of the specified class.
       * @param {Object} cls
       */
      // FUTURE: Add efficient support for:
      //    .where() .orderBy() .groupBy()
      var as = this.private_.axiomCache[cls.id];
      if ( ! as ) {
        as = [];
        for ( var key in this.axiomMap_ ) {
          var a = this.axiomMap_[key];
          if ( cls.isInstance(a) ) as.push(a);
        }
        this.private_.axiomCache[cls.id] = as;
      }

      return as;
    },

    function getSuperAxiomByName(name) {
      /**
       * Find an axiom by the specified name from an ancestor.
       * @param {String} name
       */
      return this.axiomMap_.__proto__[name];
    },

    function hasOwnAxiom(name) {
      /**
       * Return true if an axiom named "name" is defined on this class
       * directly, regardless of what parent classes define.
       * @param {String} name
       */
      return Object.hasOwnProperty.call(this.axiomMap_, name);
    },

    function getAxioms() {
      /**
       * Returns all axioms defined on this class or its parent classes.
       * @return {Array}
       */

      // The full axiom list is stored in the regular cache with '' as a key.
      var as = this.private_.axiomCache[''];
      if ( ! as ) {
        as = [];
        for ( var key in this.axiomMap_ ) as.push(this.axiomMap_[key]);
        this.private_.axiomCache[''] = as;
      }
      return as;
    },

    // NOP, is replaced if debug.js is loaded
    function validate() { },

    function toString() { return this.name + 'Class'; },

    function installModel(m) {
      /**
       * Temporary Bootstrap Implementation
       *
       * This is a temporary version of installModel.
       * When the bootstrap is finished, it will be replaced by a
       * version that only knows how to install axioms in Boot.js phase3().
       *
       * It is easier to start with hard-coded method and property
       * support because Axioms need methods to install themselves
       * and Property Axioms themselves have properties.
       *
       * However, once we've bootstrapped proper Property and Method
       * Axioms, we can remove this support and just install Axioms.
       * @param {Object} m
       */


      /*
        Methods can be defined using two formats.
        1. Short-form function literal:
             function foo() {
               console.log('bar');
             }

        3. Long-form JSON:
             {
               name: 'foo',
               code: function() {
                 console.log('bar');
               }
             }
           The long-form will support many options (many of which are defined
           in Method.js), but only 'name' and 'code' are mandatory.
       */
      if ( m.methods ) {
        for ( var i = 0 ; i < m.methods.length ; i++ ) {
          var a = m.methods[i];
          if ( foam.Function.isInstance(a) ) {
            m.methods[i] = a = { name: a.name, code: a };
          }
          if ( foam.core.Method ) {
            foam.assert(a.cls_ !== foam.core.Method,
              'Method', a.name, 'on', m.name,
              'has already been upgraded to a Method');

            a = foam.core.Method.create(a);
            this.installAxiom(a);
          } else {
            this.prototype[a.name] = a.code;
          }
        }
      }

      /*
        Properties can be defined using three formats:
        1. Short-form String:  'firstName' or 'sex'

        2. Medium-form Array:  [ 'firstName', 'John' ] or [ 'sex', 'Male' ]
           The first element of the array is the name and the second is the
           default value.

        3. Long-form JSON:     { class: 'String', name: 'sex', value: 'Male' }
           The long-form will support many options (many of which are defined
           in Property.js), but only 'name' is mandatory.
       */
      if ( foam.core.Property && m.properties ) {
        for ( var i = 0 ; i < m.properties.length ; i++ ) {
          var a = m.properties[i];

          if ( Array.isArray(a) ) {
            m.properties[i] = a = { name: a[0], value: a[1] };
          } else if ( foam.String.isInstance(a) ) {
            m.properties[i] = a = { name: a };
          }

          var type = foam.lookup(a.class, true) || foam.core.Property;
          foam.assert(
            type !== a.cls_,
            'Property', a.name, 'on', m.name,
            'has already been upgraded to a Property.');

          a = type.create(a);

          this.installAxiom(a);
        }
      }
    }
  ]
});

/**
 * The implicit base class for the FOAM class hierarchy. If you do not
 * explicitly extend another class, FObject is used.
 */
foam.CLASS({
  package: 'foam.core',
  name: 'FObject',

  methods: [
    function init() {
      /**
       * Template init() method, basic FObject this is a no-op, but classes
       * can override this to do their own per-instance initialization
       */
    },

    function initArgs(args) {
      /**
       * This is a temporary version of initArgs.
       * When the bootstrap is finished, it will be replaced by a version
       * that knows about a classes Properties, so it can do a better job.
       * @param {Object=} args
       */

      if ( ! args ) return;

      for ( var key in args ) this[key] = args[key];
    },

    function hasOwnProperty(name) {
      /**
       * Returns true if this object is storing a value for a property
       * named by the 'name' parameter.
       * @param {String} name
       */

      return ! foam.Undefined.isInstance(this.instance_[name]);
    },

    function clearProperty(name) {
      /**
       * Undefine a Property's value.
       * The value will revert to either the Property's 'value' or
       * 'expression' value, if they're defined or undefined if they aren't.
       * A propertyChange event will be fired, even if the value doesn't change.
       * @param {String} name
       */

      var prop = this.cls_.getAxiomByName(name);
      foam.assert(prop && foam.core.Property.isInstance(prop),
                    'Attempted to clear non-property', name);

      if ( this.hasOwnProperty(name) ) {
        var oldValue = this[name];
        this.instance_[name] = undefined;

        // Avoid creating slot and publishing event if nobody is listening.
        if ( this.hasListeners('propertyChange', name) ) {
          this.pub('propertyChange', name, prop.toSlot(this), oldValue);
        }
      }
    },

    function setPrivate_(name, value) {
      /**
       * Private support is used to store per-object values that are not
       * instance variables.  Things like listeners and topics.
       * @param {any=} name
       * @param {any=} value
       */
      ( this.private_ || ( this.private_ = {} ) )[name] = value;
      return value;
    },

    function getPrivate_(name) {
      /**
       * @param {any=} name
       */
      return this.private_ && this.private_[name];
    },

    function hasOwnPrivate_(name) {
      /**
       * @param {any=} name
       */
      return this.private_ && ! foam.Undefined.isInstance(this.private_[name]);
    },

    function clearPrivate_(name) {
      /**
       * @param {any=} name
       */
      if ( this.private_ ) this.private_[name] = undefined;
    },

    function validate() {
      var as = this.cls_.getAxioms();
      for ( var i = 0 ; i < as.length ; i++ ) {
        var a = as[i];
        a.validateInstance && a.validateInstance(this);
      }
    },

    //////////////////////////////////////////////////
    // Publish and Subscribe
    //////////////////////////////////////////////////

    function createListenerList_() {
      /**
       * This structure represents the head of a doubly-linked list of
       * listeners. It contains 'next', a pointer to the first listener,
       * and 'children', a map of sub-topic chains.
       *
       * Nodes in the list contain 'next' and 'prev' links, which lets
       * removing subscriptions be done quickly by connecting next to prev
       * and prev to next.
       *
       * Note that both the head structure and the nodes themselves have a
       * 'next' property. This simplifies the code because there is no
       * special case for handling when the list is empty.
       *
       * Listener List Structure
       * -----------------------
       * next     -> {
       *   prev: <-,
       *   sub: {src: <source object>, detach: <destructor function> },
       *   l: <listener>,
       *   next: -> <same structure>,
       *   children -> {
       *     subTopic1: <same structure>,
       *     ...
       *     subTopicn: <same structure>
       *   }
       * }
       *
       * TODO: Move this structure to a foam.LIB, and add a benchmark
       * to show why we are using plain javascript objects rather than
       * modeled objects for this structure.
       */
      return { next: null };
    },

    function listeners_() {
      /**
       * Return the top-level listener list, creating if necessary.
       */
      return this.getPrivate_('listeners') ||
        this.setPrivate_('listeners', this.createListenerList_());
    },

    function notify_(listeners, a) {
      /**
       * Notify all of the listeners in a listener list.
       * Pass 'a' arguments to listeners.
       * Returns the number of listeners notified.
       * @param {any=} listeners
       * @param {any=} a
       */
      var count = 0;
      while ( listeners ) {
        var l = listeners.l;
        var s = listeners.sub;

        // Update 'listeners' before notifying because the listener
        // may set next to null.
        listeners = listeners.next;

        // Like l.apply(l, [s].concat(Array.from(a))), but faster.
        // FUTURE: add benchmark to justify
        // ???: optional exception trapping, benchmark
        switch ( a.length ) {
          case 0: l(s); break;
          case 1: l(s, a[0]); break;
          case 2: l(s, a[0], a[1]); break;
          case 3: l(s, a[0], a[1], a[2]); break;
          case 4: l(s, a[0], a[1], a[2], a[3]); break;
          case 5: l(s, a[0], a[1], a[2], a[3], a[4]); break;
          case 6: l(s, a[0], a[1], a[2], a[3], a[4], a[5]); break;
          case 7: l(s, a[0], a[1], a[2], a[3], a[4], a[5], a[6]); break;
          case 8: l(s, a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7]); break;
          default: l.apply(l, [ s ].concat(Array.from(a)));
        }
        count++;
      }
      return count;
    },

    function hasListeners() {
      /**
       * Return true iff there are listeners for the supplied message.
       */

      var listeners = this.getPrivate_('listeners');

      for ( var i = 0 ; listeners ; i++ ) {
        if ( listeners.next ) return true;
        if ( i === arguments.length ) return false;
        listeners = listeners.children && listeners.children[arguments[i]];
      }

      return false;
    },

    function pub(a1, a2, a3, a4, a5, a6, a7, a8) {
      /**
       * Publish a message to all matching sub()'ed listeners.
       *
       * All sub()'ed listeners whose specified pattern match the
       * pub()'ed arguments will be notified.
       * Ex.
       * <pre>
       *   var obj  = foam.core.FObject.create();
       *   var sub1 = obj.sub(               function(a,b,c) { console.log(a,b,c); });
       *   var sub2 = obj.sub('alarm',       function(a,b,c) { console.log(a,b,c); });
       *   var sub3 = obj.sub('alarm', 'on', function(a,b,c) { console.log(a,b,c); });
       *
       *   obj.pub('alarm', 'on');  // notifies sub1, sub2 and sub3
       *   obj.pub('alarm', 'off'); // notifies sub1 and sub2
       *   obj.pub();               // only notifies sub1
       *   obj.pub('foobar');       // only notifies sub1
       * </pre>
       *
       * Note how FObjects can be used as generic pub/subs.
       *
       * Returns the number of listeners notified.
       * @param {any=} a1
       * @param {any=} a2
       * @param {any=} a3
       * @param {any=} a4
       * @param {any=} a5
       * @param {any=} a6
       * @param {any=} a7
       * @param {any=} a8
       */

      // This method prevents this function not being JIT-ed because
      // of the use of 'arguments'. Doesn't generate any garbage ([]'s
      // don't appear to be garbage in V8).
      // FUTURE: benchmark
      switch ( arguments.length ) {
        case 0:  return this.pub_([]);
        case 1:  return this.pub_([ a1 ]);
        case 2:  return this.pub_([ a1, a2 ]);
        case 3:  return this.pub_([ a1, a2, a3 ]);
        case 4:  return this.pub_([ a1, a2, a3, a4 ]);
        case 5:  return this.pub_([ a1, a2, a3, a4, a5 ]);
        case 6:  return this.pub_([ a1, a2, a3, a4, a5, a6 ]);
        case 7:  return this.pub_([ a1, a2, a3, a4, a5, a6, a7 ]);
        case 8:  return this.pub_([ a1, a2, a3, a4, a5, a6, a7, a8 ]);
        default: return this.pub_(arguments);
      }
    },

    function pub_(args) {
      /**
       * Internal publish method, called by pub().
       * @param {any=} args
       */

      // No listeners, so return.
      if ( ! this.hasOwnPrivate_('listeners') ) return 0;

      var listeners = this.listeners_();

      // Notify all global listeners.
      var count = this.notify_(listeners.next, args);

      // Walk the arguments, notifying more specific listeners.
      for ( var i = 0 ; i < args.length; i++ ) {
        listeners = listeners.children && listeners.children[args[i]];
        if ( ! listeners ) break;
        count += this.notify_(listeners.next, args);
      }

      return count;
    },

    function sub(args) {
      /**
       * Subscribe to pub()'ed events.
       * args - zero or more values which specify the pattern of pub()'ed
       * events to match.
       * <p>For example:
       * <pre>
       *   sub('propertyChange', l) will match:
       *   pub('propertyChange', 'age', 18, 19), but not:
       *   pub('stateChange', 'active');
       * </pre>
       * <p>sub(l) will match all events.
       *   l - the listener to call with notifications.
       * <p> The first argument supplied to the listener is the "subscription",
       *   which contains the "src" of the event and a detach() method for
       *   cancelling the subscription.
       * <p>Returns a "subscrition" which can be cancelled by calling
       *   its .detach() method.
       * @param {...any} args
       */

      var l = arguments[arguments.length - 1];

      foam.assert(foam.Function.isInstance(l),
          'Listener must be a function');

      var listeners = this.listeners_();

      for ( var i = 0 ; i < arguments.length - 1 ; i++ ) {
        var children = listeners.children || ( listeners.children = {} );
        listeners = children[arguments[i]] ||
            ( children[arguments[i]] = this.createListenerList_() );
      }

      var node = {
        sub:  { src: this },
        next: listeners.next,
        prev: listeners,
        l:    l
      };
      node.sub.detach = function() {
        if ( node.next ) node.next.prev = node.prev;
        if ( node.prev ) node.prev.next = node.next;

        // Disconnect so that calling detach more than once is harmless
        node.next = node.prev = null;
      };

      if ( listeners.next ) listeners.next.prev = node;
      listeners.next = node;

      return node.sub;
    },

    function pubPropertyChange_(prop, oldValue, newValue) {
      /**
       * Publish to this.propertyChange topic if oldValue and newValue are
       * different.
       * @param {any=} prop
       * @param {any=} oldValue
       * @param {any=} newValue
       */
      if ( Object.is(oldValue, newValue) ) return;
      if ( ! this.hasListeners('propertyChange', prop.name) ) return;

      this.pub('propertyChange', prop.name, prop.toSlot(this), oldValue);
    },

    function slot(obj) {
      /**
       * Creates a Slot for an Axiom.
       * @param {any=} obj
       */
      if ( typeof obj === 'function' ) {
        return foam.core.ExpressionSlot.create(
            arguments.length === 1 ?
                { code: obj, obj: this } :
                {
                  code: obj,
                  obj: this,
                  args: Array.prototype.slice.call(arguments, 1)
                });
      }

      var axiom = this.cls_.getAxiomByName(obj);
      foam.assert(axiom, 'Unknown axiom:', obj);
      foam.assert(axiom.toSlot, 'Called slot() on unslottable axiom:', obj);

      return axiom.toSlot(this);
    },

    function onDetach(d) {
      /**
       * Register a function or a detachable to be called when this object is
       * detached.
       *
       * A detachable is any object with a detach() method.
       *
       * Does nothing is the argument is falsy.
       *
       * Returns the input object, which can be useful for chaining.
       * @param {any=} d
       */
      foam.assert(! d || foam.Function.isInstance(d.detach) ||
          foam.Function.isInstance(d),
          'Argument to onDetach() must be callable or detachable.');
      if ( d ) this.sub('detach', d.detach ? d.detach.bind(d) : d);
      return d;
    },

    function detach() {
      /**
       * Detach this object. Free any referenced objects and destory
       * any registered detroyables.
       */
      if ( this.instance_.detaching_ ) return;

      // Record that we're currently detaching this object,
      // to prevent infinite recursion.
      this.instance_.detaching_ = true;
      this.pub('detach');
      this.instance_.detaching_ = false;
      this.clearPrivate_('listeners');
    },

    //////////////////////////////////////////////////
    // Utility Methods: clone, equals, compareTo etc.
    //////////////////////////////////////////////////

    function equals(other) {
      /**
       * Returns true if this object is equal to 'other'.
       * @param {any=} other
       */
      return this.compareTo(other) === 0;
    },

    function compareTo(other) {
      /**
       * Returns -1, 0 or 1 of a comparison of the properties of this object
       * with 'other'.
       *
       * If this and other are not the same type, then this does a comparison
       * of their respective class IDs.
       * @param {any=} other
       */
      if ( other === this ) return 0;
      if ( ! other ) return 1;

      // Non FObject's are considered "less than" FObjects.
      if ( ! foam.core.FObject.isInstance(other) ) return 1;

      if ( this.cls_ !== other.cls_ ) {
        return foam.util.compare(this.cls_.id, other.cls_.id);
      }

      // FUTURE: check 'id' first
      // FUTURE: order properties
      var ps = this.cls_.getAxiomsByClass(foam.core.Property);
      for ( var i = 0 ; i < ps.length ; i++ ) {
        var r = ps[i].compare(this, other);
        if ( r ) return r;
      }

      return 0;
    },

    function clone() {
      /** Create a deep copy of this object. */
      var m = {};
      for ( var key in this.instance_ ) {
        var value = this[key];
        this.cls_.getAxiomByName(key).cloneProperty(value, m);
      }
      return this.cls_.create(m);
    },

    function toString() {
      // Distinguish between prototypes and instances.
      return this.cls_.id + (
        this.cls_.prototype === this ? 'Proto' : '' );
    }
  ]
});
