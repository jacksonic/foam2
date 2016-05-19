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

foam.LIB({
  name: 'foam.Function',
  methods: [
    /**
     * Decorates the function 'f' to cache the return value of 'f' when called
     * with a particular value for its first argument.
     *
     */
    function memoize1(f) {
      console.assert(
        typeof f === 'function',
        'Cannot apply memoize to something that is not a function.');

      var cache = {};
      return foam.Function.setName(
          function(key) {
            console.assert(
                arguments.length === 1,
                "Memoize1'ed functions must take exactly one argument.");

            if ( ! cache.hasOwnProperty(key) ) cache[key] = f.call(this, key);
            return cache[key];
          },
          'memoize1(' + f.name + ')');
    },

    /**
     * Set a function's name for improved debugging and profiling
     *
     * Returns the given function.
     */
    function setName(f, name) {
      Object.defineProperty(f, 'name', { value: name, configurable: true });
      return f;
    }
  ]
});

/* istanbul ignore next */
(function() {
  // Disable setName if not supported on this platform.
  try {
    foam.Function.setName(function() {}, '');
  } catch (x) {
    console.warn('foam.Function.setName is not supported on your platform. ' +
                 'Stack traces will be harder to decipher, but no ' +
                 'functionality will be lost');
    foam.LIB({
      name: 'foam.Function',
      methods: [
        function setName(f) { return f; }
      ]
    });
  }
})();

foam.LIB({
  name: 'foam.String',
  methods: [
    {
      name: 'constantize',
      code: foam.Function.memoize1(function(str) {
        console.assert(typeof str === 'string',
                       'Cannot constantize non-string values.');

        // switches from from camelCase to CAMEL_CASE
        return str.replace(/([a-z])([^0-9a-z_])/g, '$1_$2').toUpperCase();
      })
    }
  ]
});
