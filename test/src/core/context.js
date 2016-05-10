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

describe('foam global object context additions', function() {
  it('register', function() {
    var obj = {
      id: 'test.object'
    };

    foam.register(obj);
    expect(foam.lookup('test.object')).toBe(obj);
  });
});

describe('Context object', function() {
  var context;

  beforeEach(function() {
    context = foam.createSubContext();
  });

  it('register and lookup', function() {
    var someClass = {
      id: 'com.acme.Foo'
    };

    var coreClass = {
      package: 'foam.core',
      name: 'Bar',
      id: 'foam.core.Bar'
    };

    context.register(someClass);
    context.register(coreClass);

    expect(context.lookup('com.acme.Foo')).toBe(someClass);
    expect(context.lookup('Bar')).toBe(coreClass);
    expect(context.lookup('foam.core.Bar')).toBe(coreClass);

    // Looking up an unknown class throws an exception
    expect(function() {
      context.lookup('unknown.class');
    }).toThrow();

    // unless opt_suppress is true.
    expect(function() {
      context.lookup('unknown.class', true);
    }).not.toThrow();

    // Can only replace classes in sub contexts.
    var replaceClass = {
      id: 'com.acme.Foo'
    };

    expect(function() { context.register(replaceClass); }).toThrow();

    var subContext = context.createSubContext();
    expect(function() { subContext.register(replaceClass); }).not.toThrow();
    expect(subContext.lookup('com.acme.Foo')).toBe(replaceClass);

    // Can only look up string values.
    expect(function() { context.lookup(213123); }).toThrow();
  });

  it('createSubContext', function() {
    var named = foam.createSubContext({
      foo: 1,
      bar: 2
    }, 'HELLO');
    var unNamed = named.createSubContext();

    for ( var key in named ) {
      expect(key).not.toEqual('NAME');
    }

    expect(named.foo).toBe(1);
    expect(named.bar).toBe(2);

    // Check that contexts are frozen
    named.foo = 12;
    expect(named.foo).toBe(1);

    expect(named.NAME).toEqual('HELLO');
    expect(unNamed.NAME).toEqual('HELLO');

    var foo = {
      id: 'some.packaged.Foo'
    };

    named.register(foo);

    expect(unNamed.lookup('some.packaged.Foo')).toBe(foo);
  });

  it('__context__ is frozen', function() {
    foam.__context__.foo = 'hello';
    expect(foam.__context__.foo).not.toEqual('hello');
  });
});
