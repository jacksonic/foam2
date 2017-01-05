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

/**
  An Unsafe Property skips the regular FOAM Property getter/setter/instance_
  mechanism. In gets installed on the CLASS as a Property constant, but isn't
  added to the prototype at all. From this point of view, it's mostly just for
  documentation. Unsafe Properties are used only in special cases to maximize
  performance and/or minimize memory use.
  Used for MDAO indices and Slots, as well as parsers.

  USE WITH EXTREME CAUTION (OR NOT AT ALL).
*/
foam.CLASS({
  package: 'foam.core.property',
  name: 'Unsafe',
  extends: 'Property',

  methods: [
    function installInProto() {}
  ]
});
