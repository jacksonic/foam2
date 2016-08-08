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
</pre>
*/
foam.CLASS({
  package: 'foam.core',
  name: 'Method',
  extends: 'FObject',

  properties: [ 'name', 'code' ],

  methods: [
    function installInProto(proto) {
      proto[this.name] = this.code;
    }
  ]
});
