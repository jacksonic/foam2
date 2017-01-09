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

/**
 * Stores a FOAM Class.
 *
 * <p>You can assign a string value to this type of property, and it will
 * look up the class you have referenced when first accessed. When this
 * property serializes itself, it writes out the string ID of the class,
 * not the entire instance of the class.
 *
 * <pre><code>
 * foam.CLASS({
 *   name:'MyClass',
 *   properties:[
 *     { class: 'Class', name: 'clsProp' }
 *   ]
 * });
 * var mc = MyClass.create({ clsProp: 'foam.core.Method' });
 * // the Method class is looked up automatically:
 * mc.clsProp.create({ name: 'myMethod' });
 * </code></pre>
 */
foam.CLASS({
  package: 'foam.core.property',
  name: 'Class',
  extends: 'Property',

  imports: [ 'lookup?' ],

  properties: [
    {
      /**
       * This special getter performs a lookup when required. If you
       * define your own getter this functionality is lost.
       */
      name: 'getter',
      value: function(prop) {
        var c = this.instance_[prop.name];

        // Implement value and factory support.
        if ( ! c ) {
          if ( prop.value ) {
            c = prop.value;
          } else if ( prop.factory ) {
            c = this.instance_[prop.name] = prop.factory.call(this, prop);
          }
        }

        // Upgrade Strings to actual classes, if available.
        if ( foam.String.isInstance(c) ) {
          // if a lookup override had to be added, use it, otherwise
          // just use normal lookup() if the user imported it.
          c = ( this.class_lookup__ || this.lookup )(c, true);
          if ( c ) this.instance_[prop.name] = c;
        }

        return c;
      }
    },
    {
      name: 'toJSON',
      value: function(value) { return value.id; }
    }
  ],

  methods: [
    function installInClass(cls) {
      /**
       * Ensures that a 'lookup' import is available in the host class.
       * If not, adds one named class_lookup__ to avoid conflicts.
       *
       * @param {any} cls A FOAM Class, during load.
       */
      var existingAx = cls.getAxiomByName('lookup');
      if ( ! existingAx || existingAx.key !== 'lookup' ) {
        cls.installAxiom(foam.core.Import.create({
          key: 'lookup',
          name: 'class_lookup__'
        }));
      }
    }
  ]

});
