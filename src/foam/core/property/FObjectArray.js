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
 * A Property which contains an array of FObjects, whose class goes in 'of'.
 *
 * Automatically upgrades the array elements with adaptArrayElement.
 */
foam.CLASS({
  package: 'foam.core.property',
  name: 'FObjectArray',
  extends: 'Property',

  properties: [
    {
      /** The name of the class of the array elements. */
      name: 'of',
      required: true
    },

    {
      /** FObjectArrays default to empty arrays if not set. */
      name: 'factory',
      value: function() { return []; }
    },

    {
      /**
       * All elements are converted by adaptArrayElement when this property is
       * set.
       */
      name: 'adapt',
      value: function(_, a, prop) {
        if ( ! a ) return [];
        // If not an array, allow assertValue to assert the type-check.
        if ( ! Array.isArray(a) ) return a;

        var b = new Array(a.length);
        for ( var i = 0 ; i < a.length ; i++ ) {
          b[i] = prop.adaptArrayElement(a[i], this);
        }
        return b;
      }
    },

    {
      /** This property can only be set to an array. */
      name: 'assertValue',
      value: function(v, prop) {
        foam.assert(Array.isArray(v), prop.name,
            'Attempt to set array property to non-array value', v);
      }
    },

    {
      /**
       * Each array element is converted to an instance of the class whose name
       * is in "of", if it's not one already.
       */
      name: 'adaptArrayElement',
      value: function(o, obj) {
        var cls = this.__subContext__.lookup(this.of);
        foam.assert(cls, 'Unknown array "of": ', this.of);
        return cls.isInstance(o) ? o : cls.create(o, obj);
      }
    }
  ]
});
