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

// jshint undef:false
describe('Listener', function() {
  it('Name is set', function() {
    foam.CLASS({
      name: 'SomeClass',
      listeners: [
        {
          name: 'foo',
          code: function() { }
        }
      ]
    });

    var obj = SomeClass.create();
    expect(function() {
      obj.foo();
    }).not.toThrow();
  });

  it('Are bound to the object', function() {
    foam.CLASS({
      name: 'SomeClass',
      properties: [
        'a'
      ],
      listeners: [
        function foo() {
          this.a = 12;
        }
      ]
    });

    var obj = SomeClass.create();
    var foo = obj.foo;

    expect(obj.a).toBe(undefined);

    // Calling a listener like this should still retain the proper 'this'
    foo();

    expect(obj.a).toBe(12);
  });

  it('merged', function(done) {
    var called;

    foam.CLASS({
      name: 'SomeClass',
      properties: [
        'a'
      ],
      listeners: [
        {
          name: 'foo',
          isMerged: true,
          code: function() {
            this.a = 12;
            called();
          }
        }
      ]
    });

    var obj = SomeClass.create();
    var wasCalled = 0;

    called = function() {
      wasCalled++;

      // Should only be called once.
      expect(wasCalled).toBe(1);

      expect(obj.a).toBe(12);
      done();
    };

    // Merged listener is only called once for all notifications
    // within the given merged delay.
    obj.foo();
    obj.foo();
    obj.foo();
    obj.foo();

    expect(obj.a).toBe(undefined);
  });

  it('mergeDelay', function(done) {
    var start;
    foam.CLASS({
      name: 'SomeObject',
      properties: [
        'calledAt'
      ],
      listeners: [
        {
          name: 'listener',
          isMerged: true,
          mergeDelay: 100,
          code: function() {
            // Should only be called once in this test, since
            // all calls to listener() happen within the merge delay.

            expect(this.calledAt).toBe(undefined);
            this.calledAt = Date.now();

            // The listener should be delayed by at lest 100ms which is
            // the requested merge delay.
            expect((this.calledAt - start) >= 100).toBe(true);

            done();
          }
        }
      ]
    });

    var obj = SomeObject.create();
    start = Date.now();

    obj.listener();
    obj.listener();
    obj.listener();
    obj.listener();
  });

  it('Cannot override non-listener, even if its a method.', function() {
    foam.CLASS({
      name: 'Parent',
      methods: [
        function foo() {}
      ]
    });

    // Suppress warnings; there's a warning for changing the axiom's type from
    // Method to Listener.
    var cap = global.captureWarn();
    expect(function() {
      foam.CLASS({
        name: 'Child',
        extends: 'Parent',
        listeners: [
          function foo() {}
        ]
      });
    }).toThrow();

    // Restore warnings.
    cap();
  });

  it('Can use SUPER', function() {
    var parentCalled = false;

    foam.CLASS({
      name: 'Parent',
      listeners: [
        function foo() {
          parentCalled = true;
        }
      ]
    });

    var childCalled = false;

    foam.CLASS({
      name: 'Child',
      extends: 'Parent',
      listeners: [
        function foo() {
          this.SUPER();
          childCalled = true;
        }
      ]
    });

    Child.create().foo();

    expect(parentCalled).toBe(true);
    expect(childCalled).toBe(true);
  });
});
