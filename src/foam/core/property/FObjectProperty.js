/**
 * @license
 * Copyright 2017 Google Inc. All Rights Reserved.
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
 * A Property which contains an FObject, of the type specifed in 'of'.
 *
 * Automatically upgrades plain maps to an instance of the given
 * type of FObject. If you set a plain map with 'class' specified,
 * that type is used.
 *
 * <pre><code>
 * foam.CLASS({
 *   name: 'ClassA',
 *   properties: [ {
 *     class: 'FObjectProperty',
 *     name: 'fobj',
 *     of: 'MyOtherClass'
 *   } ]
 * });
 * var a = ClassA.create();
 *
 * a.fobj = { a: 4 }; // is converted to MyOtherClass
 * MyOtherClass.isInstance(a.fobj) === true;
 * </code></pre>
 */
foam.CLASS({
  package: 'foam.core.property',
  name: 'FObjectProperty',
  extends: 'Property',

  properties: [
    {
      name: 'of',
      value: 'foam.core.FObject'
    },
    {
      name: 'adapt',
      value: function(old, v, prop) {
        var of = foam.lookup(prop.of);

        return of.isInstance(v) ?
            v :
            ( v.class ?
                foam.lookup(v.class) :
                of ).create(v, this.__subContext__);
      }
    }
  ]
});

