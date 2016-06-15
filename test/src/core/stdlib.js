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

describe('foam.package', function() {
  it('registerClass', function() {
    var cls = {
      package: 'some.test.package',
      name: 'Class'
    };

    foam.package.registerClass(cls);
    expect(global.some.test.package.Class).toBe(cls);
  });

  it('registerClass validates arguments', function() {
    expect(function() {
      foam.package.registerClass(123123);
    }).toThrow();

    expect(function() {
      // Name must be non-empty
      foam.package.registerClass({
        name: '',
        package: 'foo'
      });
    }).toThrow();
  });

  it('ensurePackage returns root for null/undefined paths', function() {
    var foo = {};

    expect(foam.package.ensurePackage(foo, null)).toBe(foo);
    expect(foam.package.ensurePackage(foo, undefined)).toBe(foo);
  });

  it('ensurePackage works with empty string', function() {
    var foo = {};
    expect(foam.package.ensurePackage(foo, '')).toBe(foo);
  });

  it('ensurePackage validates path is string/null/undefined', function() {
    expect(function() {
      foam.package.ensurePackage({}, 0);
    }).toThrow();

    expect(function() {
      foam.package.ensurePackage({}, false);
    }).toThrow();

    expect(function() {
      foam.package.ensurePackage({}, new Date());
    }).toThrow();

    expect(function() {
      foam.package.ensurePackage({}, 3);
    }).toThrow();
  });

  it('registerClass overwrites previous classes', function() {
    var obj1 = {
      name: 'foo',
      package: 'some.test.package'
    };
    var obj2 = {
      name: 'foo',
      package: 'some.test.package'
    };

    foam.package.registerClass(obj1);
    expect(global.some.test.package.foo).toBe(obj1);

    foam.package.registerClass(obj2);
    expect(global.some.test.package.foo).toBe(obj2);
  });

  it('Can change package after registration', function() {
    var obj = {
      name: 'Foo',
      package: 'some.test.package'
    };

    foam.package.registerClass(obj);

    expect(global.some.test.package.Foo).toBe(obj);

    // Change the package property of a registered object
    // doesn't actually change where it appears in the package path.
    //
    // You shouldn't change the package of an object after registration.
    obj.package = 'some.other.package';

    expect(function() {
      global.some.other.package.Foo;
    }).toThrow();
  });
});
