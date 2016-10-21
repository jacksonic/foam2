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

/** Add new Axiom types (Implements, Constants, Topics, Properties, Methods and Listeners) to Model. */
foam.CLASS({
  refines: 'foam.core.Model',

  // documentation: 'Add new Axiom types (Implements, Constants, Topics, Properties, Methods and Listeners) to Model.',

  properties: [
    {
      class: 'AxiomArray',
      of: 'Property',
      name: 'properties',
      adaptArrayElement: function(o) {
        /*
          Properties can be defined using three formats:
          1. Short-form String:  'firstName' or 'sex'

          2. Medium-form Array:  [ 'firstName', 'John' ] or [ 'sex', 'Male' ]
             The first element of the array is the name and the second is the
             default value.

          3. Long-form JSON:     { class: 'String', name: 'sex', value: 'Male' }
             The long-form will support many options, but only 'name' is
             mandatory.
         */
        if ( foam.String.isInstance(o) ) {
          var p = foam.core.Property.create();
          p.name = o;
          return p;
        }

        if ( foam.Array.isInstance(o) ) {
          // TODO(adamvy): Ensure that name is typechecked and validated
          // when model validation becomes a thing.
          var p = foam.core.Property.create();
          p.name  = o[0];
          p.value = o[1];
          return p;
        }

        if ( o.class ) {
          var m = foam.lookup(o.class);
          return m.create(o);
        }

        return foam.core.Property.isInstance(o) ?
          o : foam.core.Property.create(o);
      }
    },
    {
      class: 'AxiomArray',
      of: 'Method',
      name: 'methods',
      adaptArrayElement: function(o) {
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
             The long-form will support many options, but only 'name' and 'code'
             are mandatory.
         */
        if ( foam.Function.isInstance(o) ) {
          // TODO(adamvy): Ensure that name and code are typechecked and validated
          // when model validation becomes a thing.
          var m = foam.core.Method.create();
          m.name = o.name;
          m.code = o;
          return m;
        }
        return foam.core.Method.isInstance(o) ? o : foam.core.Method.create(o);
      }
    }
  ]
});


foam.boot.phase3();


foam.CLASS({
  refines: 'foam.core.FObject',

  // documentation: 'Upgrade FObject to fully bootstrapped form.',

  methods: [
    /**
      Called to process constructor arguments.
      Replaces simpler version defined in original FObject definition.
    */
    function initArgs(args) {
      if ( ! args ) return;

      // If args are just a simple {} map, just copy
      if ( args.__proto__ === Object.prototype || ! args.__proto__ ) {
        for ( var key in args ) {
          var a = this.cls_.getAxiomByName(key);
          if ( a && foam.core.Property.isInstance(a) ) {
            this[key] = args[key];
          } else {
            this.unknownArg(key, args[key]);
          }
        }
      }
    },

    /**
      Template method used to report an unknown argument passed
      to a constructor. Is set in debug.js.
    */
    function unknownArg(key, value) {
      // NOP
    }
  ]
});


foam.boot.end();
