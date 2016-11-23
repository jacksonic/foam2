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

/*
 * Debug.js
 *
 * This file contains refinements and replacements designed to make
 * FOAM apps easier to debug. Things like more informative toString() methods
 * .describe() on various types of objects, extra type checking, warnings,
 * and asserts, etc. Many of these features may negatively affect performance,
 * so while this file should be loaded during your day-to-day development,
 * it should not be included in production.
 */

/* Validating a Model should also validate all of its Axioms. */
foam.CLASS({
  refines: 'foam.core.Model',

  methods: [
    function validate() {
      this.SUPER();

      if ( this.hasOwnProperty('extends') && this.refines ) {
        throw this.id + ': "extends" and "refines" are mutually exclusive.';
      }

      for ( var i = 0 ; i < this.axioms_.length ; i++ ) {
        this.axioms_[i].validate && this.axioms_[i].validate(this);
      }
    }
  ]
});

/* Validating a Model should also validate all of its Axioms. */
foam.CLASS({
  refines: 'foam.core.Property',

  methods: [
    function validate(model) {
      this.SUPER();

      console.assert(
          ! this.name.endsWith('$'),
          'Illegal Property Name: Can\'t end with "$": ', this.name);

      console.assert(
          ! this.name.startsWith('__'),
          'Illegal Property Name: Names beginning with double underscore ' +
          '"__" are reserved: ', this.name);
    }
  ]
});
