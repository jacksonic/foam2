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
<p>
  Methods are only installed on the prototype.
  If the method is overriding a method from a parent class,
  then SUPER support is added.

<p>
  Ex.
<pre>
  foam.CLASS({
    name: 'Parent',
    methods: [
      // short-form
      function sayHello() { console.log('hello'); },

      // long-form
      {
        name: 'sayGoodbye',
        code: function() { console.log('goodbye'); }
      }
    ]
  });

  // Create a subclass of Parent and override the 'sayHello' method.
  // The parent classes 'sayHello' methold is called with 'this.SUPER()'
  foam.CLASS({
    name: 'Child',
    extends: 'Parent',
    methods: [
      function sayHello() { this.SUPER(); console.log('world'); }
    ]
  });

  Child.create().sayHello();
  >> hello
  >> world
</pre>
*/
foam.CLASS({
  package: 'foam.core',
  name: 'AbstractMethod',
  extends: 'FObject',

  properties: [
    // FUTURE(braden): Tag these as required: true once that's supported.
    'name',
    'code',
    {
      name: 'usesSuper',
      factory: function() {
        return this.code.toString().indexOf('SUPER') >= 0;
      }
    }
  ],

  methods: [
    {
      name: 'override_',
      usesSuper: false,
      code: function override_(proto, method) {
        /**
         * Decorates a method so that it can call the method it overrides with
         * this.SUPER().
         * @param {foam.Object} proto
         * @param {foam.Function} method
         */
        // Not using SUPER, so just return the original method.
        if ( ! this.usesSuper ) return method;

        var superMethod_ = proto.cls_.__proto__.getAxiomByName(this.name);
        var super_;

        if ( ! superMethod_ ) {
          throw 'Attempted to use SUPER() in ' + this.name + ' on ' +
              proto.cls_.id + ' but no parent method exists. If the method ' +
              'does not actually call this.SUPER(), set usesSuper: false on ' +
              'the Method.';
        } else {
          foam.assert(foam.core.AbstractMethod.isInstance(superMethod_),
            'Attempt to override non-method', this.name, 'on', proto.cls_.id);

          // Fetch the super method from the proto, as the super method axiom
          // may have decorated the code before installing it.
          super_ = proto.__proto__[this.name];
        }

        function SUPER() { return super_.apply(this, arguments); }

        var f = function superWrapper() {
          var oldSuper = this.SUPER;
          this.SUPER = SUPER;

          try {
            return method.apply(this, arguments);
          } finally {
            this.SUPER = oldSuper;
          }
        };

        foam.Function.setName(f, this.name);
        f.toString = function() { return method.toString(); };

        return f;
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.core',
  name: 'Method',
  extends: 'foam.core.AbstractMethod',

  methods: [
    function installInProto(proto) {
      /** @param {any} proto */

      proto[this.name] = this.override_(proto, this.code);
    },

    function exportAs(obj) {
      /**
       * Bind the method to 'this' when exported so that it still works.
       * @param {foam.Object} obj The object to which to bind.
       */
      var m = obj[this.name];
      return function exportedMethod() { return m.apply(obj, arguments); };
    }
  ]
});
