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

var createTestProperties = function createTestProperties() {
  if ( ! foam.lookup('test.FObjectPropertyTester', true) ) {
    foam.CLASS({
      name: 'FObjectPropertyTesterData',
      package: 'test',
      properties: [
        'a', 'b'
      ]
    });

    foam.CLASS({
      name: 'FObjectPropertyTester',
      package: 'test',

      properties: [
        {
          class: 'FObjectProperty',
          name: 'fobj',
          of: 'test.FObjectPropertyTesterData'
        },
      ]
    });
  }

  return global.test.FObjectPropertyTester.create(undefined,
    foam.__context__);
};

describe('FObjectProperty', function() {
  var p;

  beforeEach(function() {
    p = createTestProperties();
  });
  afterEach(function() {
    p = null;
  });

  it('accepts FObject values', function() {
    var data = global.test.FObjectPropertyTesterData.create({ a: 3, b: 6 });
    p.fobj = data;
    expect(p.fobj).toBe(data);
  });
  it('converts maps to FObject instances', function() {
    p.fobj = { a: 5, b: 9 };
    expect(global.test.FObjectPropertyTesterData.isInstance(p.fobj))
      .toBe(true);
    expect(p.fobj.a).toBe(5);
    expect(p.fobj.b).toBe(9);
  });
  it('converts maps using given class', function() {
    p.fobj = { class: 'foam.core.Method' };
    expect(global.test.FObjectPropertyTesterData.isInstance(p.fobj))
      .toBe(false);
    expect(global.foam.core.Method.isInstance(p.fobj))
      .toBe(true);
  });
  it('fails invalid objects', function() {
    expect(function() {
      p.fobj = 4;
    }).toThrow();
    expect(function() {
      p.fobj = "Not an object";
    }).toThrow();
  });

});
