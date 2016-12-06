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

/* global test */
describe('Constants', function() {
  var t;
  var t2;

  it('are available on classes and instances', function() {
    foam.CLASS({
      package: 'test',
      name: 'ConstantTest',
      constants: [
        {
          name: 'KEY',
          value: 'my_value'
        }
      ]
    });

    var t = test.ConstantTest.create(null, foam.__context__);
    expect(t.KEY).toBe('my_value');
    expect(test.ConstantTest.KEY).toBe('my_value');
  });

  it('accept the short map syntax', function() {
    foam.CLASS({
      package: 'test',
      name: 'ConstantTest',
      constants: {
        KEY: 'value1',
        KEY2: 'value2'
      }
    });

    var t = test.ConstantTest.create(null, foam.__context__);
    expect(t.KEY).toBe('value1');
    expect(t.KEY2).toBe('value2');
    expect(test.ConstantTest.KEY).toBe('value1');
    expect(test.ConstantTest.KEY2).toBe('value2');
  });

  it('handle a falsy value', function() {
    expect(function() {
      foam.CLASS({
        package: 'test',
        name: 'ConstantTest',
        constants: null
      });
    }).not.toThrow();
  });

  it('respects your naming and case', function() {
    expect(function() {
      foam.CLASS({
        package: 'test',
        name: 'ConstantTest',
        constants: {
          someKey: 'value1',
          SOME_KEY: 'value2'
        }
      });

      expect(test.ConstantTest.someKey).toBe('value1');
      expect(test.ConstantTest.SOME_KEY).toBe('value2');
    }).not.toThrow();
  });

  it('throws if you reassign a constant', function() {
    foam.CLASS({
      package: 'test',
      name: 'ConstantTest',
      constants: {
        THE_CONST: 'value1'
      }
    });

    expect(function() {
      test.ConstantTest.THE_CONST = 'value2';
    }).toThrow();

    expect(test.ConstantTest.THE_CONST).toBe('value1');

    expect(function() {
      var t = test.ConstantTest.create();
      t.THE_CONST = 'value3';
    }).toThrow();

    expect(test.ConstantTest.THE_CONST).toBe('value1');
  });
});
