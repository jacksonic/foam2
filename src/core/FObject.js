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
  FObject is the root of FOAM's class hierarchy.

  For details on how FObject fits in to the FOAM class system,
  see the documentation in the top of Boot.js
 */
foam.LIB({
  name: 'foam.core.FObject',

  // documentation: "Root prototype for all classes.",

  constants: {
    prototype: {},

    // axiomMap_ maps axiom names to the actual axiom objects that have
    // been installed into FObject
    axiomMap_: {},

    private_:  { axiomCache: {} }
  },

  methods: [
    /**
      Create a new instance of this class.
      Configured from values taken from 'args', if supplifed.
    */
    function create(args, opt_parent) {
      var obj = Object.create(this.prototype);

      // Properties have their values stored in instance_ instead
      // of on the object directly. This lets us defineProperty on
      // the object itself so that we can add extra behaviour
      // to properties (things like preSet, postSet, firing property-
      // change events, etc.).
      obj.instance_ = {};

      // initArgs() is the standard argument extraction method.
      obj.initArgs(args, opt_parent);

      // init(), if defined, is called when object is created.
      // This is where class-specific initialization code should
      // be put (not in initArgs).
      obj.init && obj.init();

      return obj;
    },

    /**
      Used to create a sub-class of this class.  Sets up the appropriate
      prototype chains for the class, class.prototype and axiomMap_
     */
    function createSubClass() {
      /**
       * The very first "subClass" that we create will be FObject itself, when
       * we define the FObject class rather than the FObject lib that we are
       * currently defining.
       *
       * So instead of actually creating a subClass, we will just return "this"
       * and replace createSubClass on FObject to actually create create
       * sub-classes in the future.
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

    /**
      Install an Axiom into the class and prototype.
      Invalidate the axiom-cache, used by getAxiomsByName().

      FUTURE: Wait for first object to be created before creating prototype.
      Currently it installs axioms into the protoype immediately, but it should
      wait until the first object is created. This will provide
      better startup performance.
    */
    function installAxiom(a) {
      console.assert(a !== null && typeof a === 'object',
                     'Axiom is not an object.');

      console.assert(a.installInClass || a.installInProto,
                     'Axiom amust define one of installInClass or ' +
                     'installInProto');

      this.axiomMap_[a.name] = a;
      this.private_.axiomCache = {};

      a.installInClass && a.installInClass(this);
      a.installInProto && a.installInProto(this.prototype);
    },

    /**
      Determine if an object is an instance of this class
      or one of its sub-classes.
    */
    function isInstance(o) {
      return !! ( o && o.cls_ && this.isSubClass(o.cls_) );
    },

    /** Determine if a class is either this class or a sub-class. */
    function isSubClass(c) {
      if ( ! c ) return false;

      var cache = this.private_.isSubClassCache ||
        ( this.private_.isSubClassCache = {} );

      if ( cache[c.id] === undefined ) {
        cache[c.id] = ( c === this.prototype.cls_ ) ||
          this.isSubClass(c.__proto__);
      }

      return cache[c.id];
    },

    /** Find an axiom by the specified name from either this class or an ancestor. */
    function getAxiomByName(name) {
      return this.axiomMap_[name];
    },

    /**
      Returns all axioms defined on this class or its parent classes
      that are instances of the specified class.
    */
    function getAxiomsByClass(cls) {
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

    /**
      Return true if an axiom named "name" is defined on this class
      directly, regardless of what parent classes define.
    */
    function hasOwnAxiom(name) {
      return Object.hasOwnProperty.call(this.axiomMap_, name);
    },

    /** Returns all axioms defined on this class or its parent classes. */
    function getAxioms() {
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

    /**
      Temporary Bootstrap Implementation

      This is a temporary version of installModel.
      When the bootstrap is finished, it will be replaced by a
      version that only knows how to install axioms in Boot.js phase3().

      It is easier to start with hard-coded method and property
      support because Axioms need methods to install themselves
      and Property Axioms themselves have properties.

      However, once we've bootstrapped proper Property and Method
      Axioms, we can remove this support and just install Axioms.
    */
    function installModel(m) {
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
          if ( typeof a === 'function' ) {
            m.methods[i] = a = { name: a.name, code: a };
          }
          if ( foam.core.Method ) {
            console.assert(a.cls_ !== foam.core.Method,
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
          } else if ( typeof a === 'string' ) {
            m.properties[i] = a = { name: a };
          }

          var type = foam.lookup(a.class, true) || foam.core.Property;
          console.assert(
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

/** The implicit base model for the model heirarchy. If you do not
 *  explicitly extend another model, FObject is used. Most models will
 *  extend FObject and inherit its methods.
 */
foam.CLASS({
  package: 'foam.core',
  name: 'FObject',

  // documentation: 'Base model for model hierarchy.',

  methods: [
    /**
      This is a temporary version of initArgs.
      When the bootstrap is finished, it will be replaced by a version
      that knows about a classes Properties, so it can do a better job.
     */
    function initArgs(args) {
      if ( ! args ) return;

      for ( var key in args ) this[key] = args[key];
    },

    function hasOwnProperty(name) {
      return typeof this.instance_[name] !== 'undefined';
    },

    /**
      Undefine a Property's value.
      The value will revert to either the Property's 'value' or
      'expression' value, if they're defined or undefined if they aren't.
      A propertyChange event will be fired, even if the value doesn't change.
    */
    function clearProperty(name) {
      var prop = this.cls_.getAxiomByName(name);
      console.assert(prop && foam.core.Property.isInstance(prop),
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

    /**
      Private support is used to store per-object values that are not
      instance variables.  Things like listeners and topics.
    */
    function setPrivate_(name, value) {
      ( this.private_ || ( this.private_ = {} ) )[name] = value;
      return value;
    },

    function getPrivate_(name) {
      return this.private_ && this.private_[name];
    },

    function hasOwnPrivate_(name) {
      return this.private_ && typeof this.private_[name] !== 'undefined';
    },

    function clearPrivate_(name) {
      if ( this.private_ ) this.private_[name] = undefined;
    },

    function validate() {
      var as = this.cls_.getAxioms();
      for ( var i = 0 ; i < as.length ; i++ ) {
        var a = as[i];
        a.validateInstance && a.validateInstance(this);
      }
    },

    /************************************************
     * Publish and Subscribe
     ************************************************/

    /**
      This structure represents the head of a doubly-linked list of
      listeners. It contains 'next', a pointer to the first listener,
      and 'children', a map of sub-topic chains.

      Nodes in the list contain 'next' and 'prev' links, which lets
      removing subscriptions be done quickly by connecting next to prev
      and prev to next.

      Note that both the head structure and the nodes themselves have a
      'next' property. This simplifies the code because there is no
      special case for handling when the list is empty.

      Listener List Structure
      -----------------------
      next     -> {
        prev: <-,
        sub: {src: <source object>, destroy: <destructor function> },
        l: <listener>,
        next: -> },
      children -> {
          subTopic1: <same structure>,
          ...
          subTopicn: <same structure>
      }

      TODO: Move this structure to a foam.LIB, and add a benchmark
      to show why we are using plain javascript objects rather than
      modeled objects for this structure.
    */
    function createListenerList_() {
      return { next: null };
    },

    /** Return the top-level listener list, creating if necessary. */
    function listeners_() {
      return this.getPrivate_('listeners') ||
        this.setPrivate_('listeners', this.createListenerList_());
    },

    /**
      Notify all of the listeners in a listener list.
      Pass 'a' arguments to listeners.
      Returns the number of listeners notified.
    */
    function notify_(listeners, a) {
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

    function hasListeners(/* args */) {
      /** Return true iff there are listeners for the supplied message. **/
      var listeners = this.getPrivate_('listeners');

      for ( var i = 0 ; listeners ; i++ ) {
        if ( listeners.next ) return true;
        if ( i === arguments.length ) return false;
        listeners = listeners.children && listeners.children[arguments[i]];
      }

      return false;
    },

    /**
      Publish a message to all matching sub()'ed listeners.

      All sub()'ed listeners whose specified pattern match the
      pub()'ed arguments will be notified.
      Ex.:
<pre>
  var obj  = foam.core.FObject.create();
  var sub1 = obj.sub(               function(a,b,c) { console.log(a,b,c); });
  var sub2 = obj.sub('alarm',       function(a,b,c) { console.log(a,b,c); });
  var sub3 = obj.sub('alarm', 'on', function(a,b,c) { console.log(a,b,c); });

  obj.pub('alarm', 'on');  // notifies sub1, sub2 and sub3
  obj.pub('alarm', 'off'); // notifies sub1 and sub2
  obj.pub();               // only notifies sub1
  obj.pub('foobar');       // only notifies sub1
</pre>

      Note how FObjects can be used as generic pub/subs.

      Returns the number of listeners notified.
    */
    function pub(a1, a2, a3, a4, a5, a6, a7, a8) {
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
      /** Internal publish method, called by pub(). */

      // No listeners, so return.
      if ( ! this.hasOwnPrivate_('listeners') ) return 0;

      var listeners = this.listeners_();

      // Notify all global listeners.
      var count = this.notify_(listeners.next, args);

      // Walk the arguments, notifying more specific listeners.
      for ( var i = 0 ; i < args.length; i++ ) {
        var listeners = listeners.children && listeners.children[args[i]];
        if ( ! listeners ) break;
        count += this.notify_(listeners.next, args);
      }

      return count;
    },

    /**
      Subscribe to pub()'ed events.
      args - zero or more values which specify the pattern of pub()'ed
             events to match.
      <p>For example:
<pre>
   sub('propertyChange', l) will match:
   pub('propertyChange', 'age', 18, 19), but not:
   pub('stateChange', 'active');
</pre>
      <p>sub(l) will match all events.
      l - the listener to call with notifications.
       <p> The first argument supplied to the listener is the "subscription",
        which contains the "src" of the event and a destroy() method for
        cancelling the subscription.
      <p>Returns a "subscrition" which can be cancelled by calling
        its .destroy() method.
    */
    function sub() { /* args..., l */
      var l = arguments[arguments.length - 1];

      console.assert(typeof l === 'function', 'Listener must be a function');

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
      node.sub.destroy = function() {
        if ( node.next ) node.next.prev = node.prev;
        if ( node.prev ) node.prev.next = node.next;

        // Disconnect so that calling destroy more than once is harmless
        node.next = node.prev = null;
      };

      if ( listeners.next ) listeners.next.prev = node;
      listeners.next = node;

      return node.sub;
    },

    /**
      Unsub a previously sub()'ed listener.
      It is more efficient to unsubscribe by calling .destroy()
      on the subscription returned from sub() (so prefer that
      method when possible).
    */
    function unsub() { /* args..., l */
      var l         = arguments[arguments.length - 1];
      var listeners = this.getPrivate_('listeners');

      for ( var i = 0 ; i < arguments.length - 1 && listeners ; i++ ) {
        listeners = listeners.children && listeners.children[arguments[i]];
      }

      var node = listeners && listeners.next;
      while ( node ) {
        if ( node.l === l ) {
          node.sub.destroy();
          return;
        }
        node = node.next;
      }
    },

    /**
     * Publish to this.propertyChange topic if oldValue and newValue are
     * different.
     */
    function pubPropertyChange_(prop, oldValue, newValue) {
      if ( Object.is(oldValue, newValue) ) return;
      if ( ! this.hasListeners('propertyChange', prop.name) ) return;

      this.pub('propertyChange', prop.name, prop.toSlot(this), oldValue);
    },

    /** Create a deep copy of this object. **/
    function clone() {
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
