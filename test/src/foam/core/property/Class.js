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

describe('Class property', function() {
  var p;

  beforeEach(function() {
    if ( ! foam.lookup('test.ClassTester', true) ) {
      foam.CLASS({
        name: 'ClassTester',
        package: 'test',

        properties: [
          {
            class: 'Class',
            name: 'class',
          },
        ]
      });
    }
    p = global.test.ClassTester.create(undefined, foam.__context__);
  });
  afterEach(function() {
    p = null;
  });

  it('is undefined by default', function() {
    expect(p.class).toBeUndefined();
  });

  it('stores a given model instance', function() {
    p.class = test.ClassTester;
    expect(p.class).toBe(test.ClassTester);
  });
  it('looks up a model from a string name', function() {
    p.class = 'test.ClassTester';
    expect(p.class).toBe(test.ClassTester);
  });
  it('accepts undefined', function() {
    p.class = 'test.ClassTester';
    expect(p.class).toBe(test.ClassTester);

    p.class = undefined;
    expect(p.class).toBeUndefined();
  });
  it('handles a defined default value', function() {
    foam.CLASS({
      name: 'ClassTesterVal',
      package: 'test',

      properties: [
        {
          class: 'Class',
          name: 'class',
          value: 'foam.core.Property'
        },
      ]
    });
    var pv = global.test.ClassTesterVal.create(undefined, foam.__context__);
    expect(pv.class).toBe(foam.core.Property);
  });
  it('handles a defined factory', function() {
    foam.CLASS({
      name: 'ClassTesterFac',
      package: 'test',

      properties: [
        {
          class: 'Class',
          name: 'class',
          factory: function() {
            return 'foam.core.Listener';
          }
        }
      ]
    });
    var pv = global.test.ClassTesterFac.create(undefined, foam.__context__);
    expect(pv.class).toBe(foam.core.Listener);
  });
  it('handles a bad type', function() {
    p.class = 'bad.type.Here';
    expect(p.class).toBeUndefined();
  });

  it('serializes JSON with a string id', function() {
    expect(global.test.ClassTester.CLASS.toJSON(foam.core.Method))
      .toBe('foam.core.Method');
  });


});
