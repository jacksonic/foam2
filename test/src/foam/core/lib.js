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

describe('foam.LIB type checking:', function() {
  it('methods must be named', function() {
    expect(function() {
      foam.LIB({
        name: 'foam.testlib',
        methods: [
          function() {
          }
        ]
      });
    }).toThrow(new Error('Methods must be named with a non-empty string'));
  });

  it('methods must be functions or maps', function() {
    expect(function() {
      foam.LIB({
        name: 'foam.testlib',
        methods: [
          'hello'
        ]
      });
    }).toThrow(new Error('Methods must be a map or a function'));
  });

  it('methods as maps must have .code', function() {
    expect(function() {
      foam.LIB({
        name: 'foam.testlib',
        methods: [
          {
            name: 'hello'
          }
        ]
      });
    }).toThrow(new Error('Methods must have a code key which is a function'));
  });
});

describe('foam.LIB', function() {
  it('must have a name', function() {
    expect(function() {
      foam.LIB({
        methods: []
      });
    }).toThrow(new Error('Libraries must have a name.'));
  });

  it('constants', function() {
    foam.LIB({
      name: 'foam.testlib',
      constants: {
        CONST: 'val'
      }
    });
    expect(foam.testlib.CONST).toEqual('val');
  });

  it('methods', function() {
    foam.LIB({
      name: 'foam.testlib',
      methods: [
        function hello() {
          return 'hello world.';
        },
        {
          name: 'longMethod',
          code: function() {
            return 'long ' + this.hello();
          }
        }
      ]
    });

    expect(foam.testlib.hello()).toBe('hello world.');
    expect(foam.testlib.longMethod()).toBe('long hello world.');
  });
});

describe('Object.$UID', function() {
  it('is unique', function() {
    var o1 = {};
    var o2 = {};
    expect(o1.$UID).not.toEqual(o2.$UID);

    var o3 = {};
    expect(o1.$UID).not.toEqual(o3.$UID);
    expect(o2.$UID).not.toEqual(o3.$UID);
  });
});
