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

describe('Bootstrap invariants', function() {
  it('Check that all recursive relationships are properly set', function() {
    expect(foam.core.Model.isInstance(foam.core.Model.model_)).toBe(true);
    expect(foam.core.Model.isInstance(foam.core.FObject.model_)).toBe(true);
    expect(foam.core.Model.isInstance(foam.core.Property.model_)).toBe(true);
    expect(foam.core.Model.isInstance(foam.core.Method.model_)).toBe(true);
    expect(foam.core.Model.isInstance(foam.core.property.AxiomArray.model_))
        .toBe(true);
  });

  it('Check bootstrap methods have been upgraded to real methods', function() {
    var method = foam.core.FObject.getAxiomByName('sub');

    expect(foam.core.Method.isInstance(method)).toBe(true);
  });
});
