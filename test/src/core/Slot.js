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

    var slot = foam.core.internal.PropertySlot.create();
    slot.obj = obj;
    slot.prop = Abc.A;

    expect(slot.get()).toBe(1);

    slot.set(12);

    expect(slot.get()).toBe(12);
    expect(obj.a).toBe(12);

    expect(slot.isDefined()).toBe(true);
    slot.clear();
    expect(slot.isDefined()).toBe(false);


    expect(slot.toString()).toBe('PropertySlot(Abc.a)');
  });
});
