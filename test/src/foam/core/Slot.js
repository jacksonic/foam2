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
describe('PropertySlot', function() {
  it('basics', function() {
    foam.CLASS({
      name: 'Abc',
      properties: [
        'a'
      ]
    });

    var obj = Abc.create({ a: 1 });
    var slot = obj.a$;

    expect(slot.get()).toBe(1);

    slot.set(12);

    expect(slot.get()).toBe(12);
    expect(obj.a).toBe(12);

    expect(slot.isDefined()).toBe(true);
    slot.clear();
    expect(slot.isDefined()).toBe(false);

    expect(slot.toString()).toBe('PropertySlot(Abc.a)');
  });

  it('supports follow()', function() {
    foam.CLASS({
      name: 'Abc',
      properties: [
        'a'
      ]
    });

    var obj1 = Abc.create({ a: 1 });
    var slot1 = obj1.a$;
    var obj2 = Abc.create({ a: 2 });
    var slot2 = obj2.a$;

    expect(slot1.get()).toBe(1);
    expect(slot2.get()).toBe(2);

    slot2.follow(slot1);
    expect(slot2.get()).toBe(1);

    slot1.set(3);
    expect(slot2.get()).toBe(3);

    // But it's one-way.
    slot2.set(6);
    expect(slot2.get()).toBe(6);
    expect(slot1.get()).toBe(3);

    // Follow fails if passed a non-Slot.
    expect(function() {
      slot2.follow(null);
    }).toThrow();
    expect(function() {
      slot2.follow(Abc.A);
    }).toThrow();
  });

  it('supports linkFrom()', function() {
    foam.CLASS({
      name: 'Abc',
      properties: [
        'a'
      ]
    });

    var obj1 = Abc.create({ a: 1 });
    var slot1 = obj1.a$;
    var obj2 = Abc.create({ a: 2 });
    var slot2 = obj2.a$;

    expect(slot1.get()).toBe(1);
    expect(slot2.get()).toBe(2);

    slot2.linkFrom(slot1);
    expect(slot2.get()).toBe(1);

    slot1.set(3);
    expect(slot2.get()).toBe(3);

    slot2.set(6);
    expect(slot2.get()).toBe(6);
    expect(slot1.get()).toBe(6);

    // linkFrom fails if passed a non-Slot.
    expect(function() {
      slot2.linkFrom(null);
    }).toThrow();
    expect(function() {
      slot2.linkFrom(Abc.A);
    }).toThrow();
  });

  it('supports linkTo()', function() {
    foam.CLASS({
      name: 'Abc',
      properties: [
        'a'
      ]
    });

    var obj1 = Abc.create({ a: 1 });
    var slot1 = obj1.a$;
    var obj2 = Abc.create({ a: 2 });
    var slot2 = obj2.a$;


    expect(slot1.get()).toBe(1);
    expect(slot2.get()).toBe(2);

    slot2.linkTo(slot1);
    expect(slot2.get()).toBe(2);
    expect(slot1.get()).toBe(2);

    slot1.set(3);
    expect(slot2.get()).toBe(3);

    slot2.set(6);
    expect(slot2.get()).toBe(6);
    expect(slot1.get()).toBe(6);

    // linkTo fails if passed a non-Slot.
    expect(function() {
      slot2.linkTo(null);
    }).toThrow();
    expect(function() {
      slot2.linkTo(Abc.A);
    }).toThrow();
  });

  it('supports mapFrom() and mapTo()', function() {
    foam.CLASS({
      name: 'Abc',
      properties: [
        'a'
      ]
    });

    var obj1 = Abc.create({ a: 1 });
    var slot1 = obj1.a$;
    var obj2 = Abc.create({ a: 2 });
    var slot2 = obj2.a$;
    var obj3 = Abc.create({ a: 3 });
    var slot3 = obj3.a$;

    expect(slot1.get()).toBe(1);
    expect(slot2.get()).toBe(2);
    expect(slot3.get()).toBe(3);

    slot2.mapFrom(slot1, function(x) { return -x; });
    expect(slot1.get()).toBe(1);
    expect(slot2.get()).toBe(-1);

    slot1.set(5);
    expect(slot1.get()).toBe(5);
    expect(slot2.get()).toBe(-5);

    // Check one-way.
    slot2.set(3);
    expect(slot2.get()).toBe(3);
    expect(slot1.get()).toBe(5); // Hasn't changed.


    // Trying the other way with mapTo().
    slot1.mapTo(slot3, function(x) { return 4 * x; });
    expect(slot1.get()).toBe(5);
    expect(slot3.get()).toBe(20);

    slot1.set(3);
    expect(slot1.get()).toBe(3);
    expect(slot3.get()).toBe(12);

    // But it's one-way.
    slot3.set(6);
    expect(slot3.get()).toBe(6);
    expect(slot1.get()).toBe(3);

    // mapFrom fails if passed a non-Slot, or non-function
    expect(function() { slot2.mapFrom(null); }).toThrow();
    expect(function() { slot2.mapFrom(Abc.A); }).toThrow();
    expect(function() { slot2.mapFrom(slot3); }).toThrow();
    expect(function() { slot2.mapFrom(slot3, 7); }).toThrow();
    // mapTo fails if passed a non-Slot, or non-function
    expect(function() { slot2.mapTo(null); }).toThrow();
    expect(function() { slot2.mapTo(Abc.A); }).toThrow();
    expect(function() { slot2.mapTo(slot3); }).toThrow();
    expect(function() { slot2.mapTo(slot3, 7); }).toThrow();
  });

  it('supports relateFrom() and relateTo()', function() {
    foam.CLASS({
      name: 'Abc',
      properties: [
        'a'
      ]
    });

    var obj1 = Abc.create({ a: 1 });
    var slot1 = obj1.a$;
    var obj2 = Abc.create({ a: 2 });
    var slot2 = obj2.a$;
    var obj3 = Abc.create({ a: 3 });
    var slot3 = obj3.a$;

    expect(slot1.get()).toBe(1);
    expect(slot2.get()).toBe(2);
    expect(slot3.get()).toBe(3);

    slot2.relateFrom(slot1, function(x) { return -x; },
        function(x) { return -x; });
    expect(slot1.get()).toBe(1);
    expect(slot2.get()).toBe(-1);

    slot1.set(5);
    expect(slot1.get()).toBe(5);
    expect(slot2.get()).toBe(-5);

    // Check two-way.
    slot2.set(3);
    expect(slot2.get()).toBe(3);
    expect(slot1.get()).toBe(-3);

    // Trying the other way with relateTo().
    slot1.relateTo(slot3, function(x) { return 4 * x; },
        function(x) { return x / 4; });
    expect(slot1.get()).toBe(-3);
    expect(slot3.get()).toBe(-12);

    slot1.set(6);
    expect(slot1.get()).toBe(6);
    expect(slot3.get()).toBe(24);

    // And it's two-way.
    slot3.set(6);
    expect(slot3.get()).toBe(6);
    expect(slot1.get()).toBe(1.5);

    // relateFrom fails if passed a non-Slot, or non-functions
    expect(function() { slot2.relateFrom(null); }).toThrow();
    expect(function() { slot2.relateFrom(Abc.A); }).toThrow();
    expect(function() { slot2.relateFrom(slot3); }).toThrow();
    expect(function() { slot2.relateFrom(slot3, 7); }).toThrow();
    expect(function() {
      slot2.relateFrom(slot3, function(x) { return x; }, 7);
    }).toThrow();

    // relateTo fails if passed a non-Slot, or non-function
    expect(function() { slot2.relateTo(null); }).toThrow();
    expect(function() { slot2.relateTo(Abc.A); }).toThrow();
    expect(function() { slot2.relateTo(slot3); }).toThrow();
    expect(function() { slot2.relateTo(slot3, 7); }).toThrow();
    expect(function() {
      slot2.relateTo(slot3, function(x) { return x; }, 7);
    }).toThrow();
  });

  it('prevents feedback in relateTo/From', function() {
    foam.CLASS({
      name: 'Abc',
      properties: [
        'a'
      ]
    });

    // Divergence should be caught.
    expect(function() {
      var obj1 = Abc.create({ a: 1 });
      var obj2 = Abc.create({ a: 2 });
      obj1.a$.relateTo(obj2.a$, function(x) { return x + 1; },
          function(x) { return x + 1; });
      obj1.a = 5;
    }).toThrow('relateTo: Unexpected divergence.');

    // In both directions.
    expect(function() {
      var obj1 = Abc.create({ a: 1 });
      var obj2 = Abc.create({ a: 2 });
      obj1.a$.relateFrom(obj2.a$, function(x) { return x + 1; },
          function(x) { return x + 1; });
      obj2.a = 4;
    }).toThrow('relateTo: Unexpected divergence.');

    // Setting expectUnstable should stop any feedback.
    expect(function() {
      var obj1 = Abc.create({ a: 1 });
      var obj2 = Abc.create({ a: 2 });
      obj1.a$.relateTo(obj2.a$, function(x) { return x + 1; },
          function(x) { return x; }, true);
      obj1.a = 3;
      expect(obj2.a).toBe(4);
    }).not.toThrow();

    // And in reverse.
    expect(function() {
      var obj1 = Abc.create({ a: 1 });
      var obj2 = Abc.create({ a: 2 });
      obj1.a$.relateTo(obj2.a$, function(x) { return x + 1; },
          function(x) { return x + 1; }, true);
      obj2.a = 5;
      expect(obj1.a).toBe(6);
    }).not.toThrow();
  });

  it('supports destroy()', function() {
    foam.CLASS({
      name: 'Abc',
      properties: [
        'a'
      ]
    });

    var obj1 = Abc.create({ a: 1 });
    var slot1 = obj1.a$;
    var obj2 = Abc.create({ a: 2 });
    var slot2 = obj2.a$;

    expect(slot1.get()).toBe(1);
    expect(slot2.get()).toBe(2);

    var sub = slot2.linkFrom(slot1);
    expect(slot2.get()).toBe(1);

    slot1.set(3);
    expect(slot2.get()).toBe(3);

    // Now if I destroy it, it stops binding.
    sub.destroy();
    slot2.set(6);
    expect(slot2.get()).toBe(6);
    expect(slot1.get()).toBe(3);
  });

  it('prevents feedback', function() {
    foam.CLASS({
      name: 'Abc',
      properties: [
        'a'
      ]
    });

    foam.CLASS({
      name: 'Def',
      properties: [
        { name: 'b', adapt: function(old, nu) { return Math.ceil(nu); } }
      ]
    });

    var obj1 = Abc.create({ a: 1 });
    var slot1 = obj1.a$;
    var obj2 = Def.create({ b: 2 });
    var slot2 = obj2.b$;

    expect(slot1.get()).toBe(1);
    expect(slot2.get()).toBe(2);

    var sub = slot2.linkFrom(slot1);

    expect(slot1.get()).toBe(1);
    expect(slot2.get()).toBe(1);

    slot1.set(3.5);
    expect(slot1.get()).toBe(4);
    expect(slot2.get()).toBe(4);
  });

  it('correctly handles adapts overriding the value', function() {
    foam.CLASS({
      name: 'Abc',
      properties: [
        'a'
      ]
    });

    foam.CLASS({
      name: 'Def',
      properties: [
        { name: 'b', adapt: function(old, nu) { return nu > 20 ? 20 : nu; } }
      ]
    });

    var obj1 = Abc.create({ a: 1 });
    var slot1 = obj1.a$;
    var obj2 = Def.create({ b: 2 });
    var slot2 = obj2.b$;

    expect(slot1.get()).toBe(1);
    expect(slot2.get()).toBe(2);

    var sub = slot1.linkTo(slot2);
    expect(slot1.get()).toBe(1);
    expect(slot2.get()).toBe(1);

    slot1.set(200);
    expect(slot1.get()).toBe(20);
    expect(slot2.get()).toBe(20);

    slot1.set(400);
    expect(slot1.get()).toBe(20);
    expect(slot2.get()).toBe(20);

    sub.destroy();

    slot2.linkTo(slot1);

    slot1.set(200);
    expect(slot1.get()).toBe(20);
    expect(slot2.get()).toBe(20);

    slot1.set(400);
    expect(slot1.get()).toBe(20);
    expect(slot2.get()).toBe(20);
  });

  it('handles follow() when the values are identical', function() {
    foam.CLASS({
      name: 'Abc',
      properties: [
        'a'
      ]
    });

    var obj1 = Abc.create({ a: 1 });
    var slot1 = obj1.a$;
    var obj2 = Abc.create({ a: 1 });
    var slot2 = obj2.a$;

    expect(slot1.get()).toBe(1);
    expect(slot2.get()).toBe(1);

    slot1.follow(slot2);

    expect(slot1.get()).toBe(1);
    expect(slot2.get()).toBe(1);
  });
});
