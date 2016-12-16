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

/* globals test */
describe('Unsafe properties', function() {
  it('get installed on the class, but not the prototype', function() {
    foam.CLASS({
      package: 'test',
      name: 'UnsafeTest',
      properties: [
        {
          class: 'Unsafe',
          name: 'foo'
        }
      ]
    });

    expect(test.UnsafeTest.FOO).toBeDefined();
  });

  it('can be treated like basic properties', function() {
    foam.CLASS({
      package: 'test',
      name: 'UnsafeTest',
      properties: [
        {
          class: 'Unsafe',
          name: 'foo'
        }
      ]
    });

    var t = test.UnsafeTest.create();
    expect(t.foo).toBeUndefined();
    t.foo = 7;
    expect(t.foo).toBe(7);
  });
});
