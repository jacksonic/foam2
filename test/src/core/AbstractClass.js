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
describe('AbstractClass', function() {
  it('getAxiomsByClass', function() {
    foam.CLASS({
      name: 'Abc',
      properties: [
        {
          name: 'someProperty'
        }
      ],
      methods: [
        {
          name: 'someMethod',
          code: function() {}
        },
        {
          name: 'someOtherMethod',
          code: function() {}
        }
      ]
    });

    var properties = Abc.getAxiomsByClass(foam.core.Property);

    expect(properties.length).toBe(1);

    // Fetch again to ensure coverage of caching
    var properties2 = Abc.getAxiomsByClass(foam.core.Property);

    expect(properties2.length).toBe(properties.length);
    expect(properties2[0]).toBe(properties[0]);

    var methods = Abc.getAxiomsByClass(foam.core.Method);

    var found = {};

    for ( var i = 0 ; i < methods.length ; i++ ) {
      var method = methods[i];
      expect(foam.core.Method.isInstance(method)).toBe(true);
      found[method.name] = true;
    }
    expect(found.someMethod).toBe(true);
    expect(found.someOtherMethod).toBe(true);
  });

  it('hasOwnAxiom', function() {
    foam.CLASS({
      name: 'Parent',
      properties: [
        'a'
      ]
    });

    foam.CLASS({
      name: 'Child',
      extends: 'Parent',
      properties: [
        'b'
      ]
    });

    expect(Child.getAxiomByName('b')).toBeTruthy();
    expect(Child.getAxiomByName('a')).toBeTruthy();
    expect(Child.hasOwnAxiom('b')).toBeTruthy();
    expect(Child.hasOwnAxiom('a')).toBeFalsy();
  });

  it('toString', function() {
    foam.CLASS({
      name: 'Abc'
    });

    expect(Abc.toString()).toBe('AbcClass');
  });

  it('anonymous axioms are verified', function() {
    expect(function() {
      foam.CLASS({
        name: 'SomeClass',
        axioms: [
          {
            name: 'axiomMissingInstallInClassOrProto'
          }
        ]
      });
    }).toThrow();
  });

  it('installAxiom imperatively', function() {
    foam.CLASS({
      name: 'SomeClass'
    });

    expect(function() {
      SomeClass.installAxiom({
        name: 'axiomMissingInstallInClassOrProto2'
      });
    }).toThrow();
  });
});
