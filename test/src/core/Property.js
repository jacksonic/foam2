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
describe('Property', function() {
  it('flyweight get/set', function() {
    foam.CLASS({
      name: 'Abc',
      properties: [
        'camelCaseName'
      ]
    });

    var obj = Abc.create({ camelCaseName: 1 });

    expect(Abc.CAMEL_CASE_NAME.get(obj)).toBe(1);

    Abc.CAMEL_CASE_NAME.set(obj, 2);

    expect(obj.camelCaseName).toBe(2);
  });

  it('toString', function() {
    foam.CLASS({
      name: 'Abc',
      properties: [
        'prop'
      ]
    });

    expect(Abc.PROP.toString()).toBe('prop');
  });

  it('validate', function() {
    expect(function() {
      var prop = foam.core.Property.create({
        name: ''
      });

      prop.validate();
    }).toThrow();
  });
});
