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
describe('Int', function() {
  it('', function() {
    foam.CLASS({
      name: 'SomeClass',
      properties: [
        {
          class: 'Int',
          name: 'a'
        }
      ]
    });

    var obj = SomeClass.create();

    expect(obj.a).toBe(0);

    obj.a = 123;
    expect(obj.a).toBe(123);

    // Rejects non integer values.
    expect(function() {
      obj.a = 12312.222;
    }).toThrow();

    expect(function() {
      obj.a = '123';
    }).toThrow();

    expect(function() {
      obj.a = {};
    }).toThrow();

    expect(function() {
      obj.a = [];
    }).toThrow();

    expect(function() {
      obj.a = null;
    }).toThrow();

    expect(function() {
      obj.a = true;
    }).toThrow();

    expect(function() {
      obj.a = false;
    }).toThrow();

    expect(function() {
      obj.a = new Date();
    }).toThrow();
  });
});
