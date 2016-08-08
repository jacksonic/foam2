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
describe('FObject features', function() {
  it('init() method is called on creation', function() {
    foam.CLASS({
      name: 'ClassA',
      properties: [
        'wasCalled'
      ],
      methods: [
        function init() {
          expect(this.wasCalled).toBeFalsy();
          this.wasCalled = true;
        }
      ]
    });

    var obj = ClassA.create();

    expect(obj.wasCalled).toBe(true);
  });

  it('initArgs', function() {
    foam.CLASS({
      name: 'ClassA',
      properties: [
        'a',
        'b'
      ]
    });

    foam.CLASS({
      name: 'ClassB',
      properties: [
        'a',
        'c'
      ]
    });


    var objSource = ClassA.create({ a: 3, b: 4 });
    var obj2Source = ClassB.create({ a: 5, c: 6 });

    // init from plain JS object.
    var obj = ClassA.create({ a: 1, b: 2 });
    expect(obj.a).toBe(1);
    expect(obj.b).toBe(2);
  });

  it('clone', function() {
    foam.CLASS({
      name: 'ClassA',
      properties: [
        'a',
        'b'
      ]
    });

    var obj = ClassA.create({
      a: 1,
      b: ClassA.create({
        b: 3
      })
    });

    // Clone returns a deep clone of the object.
    var obj2 = obj.clone();

    expect(obj).not.toBe(obj2);

    // Plain values are copied
    expect(obj2.a).toBe(1);

    // Ensure it's deep
    expect(obj2.b).not.toBe(obj.b);
    expect(obj2.b.b).toBe(3);
  });

  it('toString', function() {
    foam.CLASS({
      name: 'ClassA'
    });

    expect(ClassA.create().toString()).toBe('ClassA');
    expect(ClassA.prototype.toString()).toBe('ClassAProto');
  });


  it('clearProperty', function() {
    foam.CLASS({
      name: 'SomeClass',
      axioms: [
        {
          name: 'nonPropertyAxiom',
          installInProto: function() {}
        }
      ],
      properties: [
        {
          name: 'a',
          value: 123
        }
      ]
    });

    var obj = SomeClass.create();
    obj.a = 12;
    expect(obj.a).toBe(12);

    // clearProperty reverts the value to its default.
    obj.clearProperty('a');
    expect(obj.a).toBe(123);

    // No errors if you clear an already cleared property.
    obj.clearProperty('a');
    expect(obj.a).toBe(123);

    // clearProperty errors on non-property axioms;
    // properties
    expect(function() {
      obj.clearProperty('nonPropertyAxiom');
    }).toThrow();

    // Also errors on unknown axioms.
    expect(function() {
      obj.clearProperty('asdfasdfasdfasdf');
    }).toThrow();
  });
});
