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

describe('foam.Function', function() {
  describe('memoize1', function() {
    it("doesn't memoize non functions", function() {
      expect(function() {
        foam.Function.memoize1({});
      }).toThrow();
    });

    it('accepts various arguments and memoizes properly', function() {
      var called = {};
      var f = foam.Function.memoize1(function(arg) {
        if ( called[arg] ) {
          throw new Error('Function was not memoized for ' + arg);
        }

        called[arg] = true;
        return arg;
      });

      var r = f(null);
      expect(f(null)).toBe(r);

      r = f(undefined);
      expect(f(undefined)).toBe(r);

      r = f('hello');
      expect(f('hello')).toBe(r);

      r = f(123);
      expect(f(123)).toBe(123);

      r = f({});
      expect(f({})).toBe(r);

      r = f({ toString: function() { return 'foo'; } });
      expect(f('foo')).toBe(r);
    });

    it('Memoized function only accepts one argument', function() {
      var f = foam.Function.memoize1(function(arg) { return arg; });

      expect(function() { f(1, 2); }).toThrow();
    });
  });

  describe('setName', function() {
    it('sets the name and is configurable', function() {
      var called = false;
      var f = function() { called = true; };

      var ret = foam.Function.setName(f, 'hello');

      expect(f.name).toBe('hello');

      // Check that it returns a function which calls through to the
      // original argument.
      ret();
      expect(called).toBe(true);

      foam.Function.setName(f, 'world');

      expect(f.name).toBe('world');
    });
  });
});

describe('foam.String', function() {
  it('constantize', function() {
    expect(foam.String.constantize('camelCase')).toEqual('CAMEL_CASE');
  });

  it("doesn't constantize non-strings", function() {
    expect(function() {
      foam.String.constantize({});
    }).toThrow();
  });
});
