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

/** An array of String values. */
foam.CLASS({
  package: 'foam.core.property',
  name: 'StringArray',
  extends: 'Property',

  label: 'List of text strings',

  properties: [
    {
      name: 'of',
      value: 'String',
      documentation: 'The FOAM sub-type of this property.'
    },
    {
      name: 'factory',
      value: function() { return []; }
    },
    {
      name: 'adapt',
      value: function(_, v, prop) {
        if ( ! foam.Array.isInstance(v) ) return v;

        var copy;
        for ( var i = 0 ; i < v.length ; i++ ) {
          // if any non-string found,
          if ( ! foam.String.isInstance(v[i]) ) {
            // create a copy of the array and coerce everything
            copy = v.slice();
            for ( var j = 0 ; j < v.length ; j++ ) {
              copy[j] = foam.String.coerce(v[j]);
            }
            break;
          }
        }

        return copy || v;
      }
    },
    {
      name: 'assertValue',
      value: function(v, prop) {
        foam.assert(foam.Array.isInstance(v),
          prop.name, 'Tried to set StringArray to non-array type.');
        for ( var i = 0 ; i < v.length ; i++ ) {
          foam.assert(foam.String.isInstance(v[i]),
            prop.name, 'Element', i, 'is not a string', v[i]);
        }
      }
    }
  ]
});

