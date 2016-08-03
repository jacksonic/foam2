/*
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

/** The implicit base model for the model heirarchy. If you do not
 *  explicitly extend another model, FObject is used. Most models will
 *  extend FObject and inherit its methods.
 */
foam.CLASS({
  package: 'foam.core',
  name: 'FObject',

  // documentation: 'Base model for model hierarchy.',

  methods: [
    /**
      This is a temporary version of initArgs.
      When the bootstrap is finished, it will be replaced by a version
      that knows about a classes Properties, so it can do a better job.
     */
    function initArgs(args) {
      if ( ! args ) return;

      for ( var key in args ) this[key] = args[key];
    },

    function hasOwnProperty(name) {
      return typeof this.instance_[name] !== 'undefined';
    },

    /**
      Undefine a Property's value.
      The value will revert to either the Property's 'value' or
      'expression' value, if they're defined or undefined if they aren't.
      A propertyChange event will be fired, even if the value doesn't change.

      If the given name is not a property of this object, it will do nothing and
      return silently.
    */
    function clearProperty(name) {
      var prop = this.cls_.getAxiomByName(name);
      console.assert(prop && foam.core.Property.isInstance(prop),
                    'Attempted to clear non-property', name);

      if ( this.hasOwnProperty(name) ) {
        this.instance_[name] = undefined;
      }
    },

    /**
      Private support is used to store per-object values that are not
      instance variables.  Things like listeners and topics.
    */
    function setPrivate_(name, value) {
      ( this.private_ || ( this.private_ = {} ) )[name] = value;
      return value;
    },

    function getPrivate_(name) {
      return this.private_ && this.private_[name];
    },

    function hasOwnPrivate_(name) {
      return this.private_ && typeof this.private_[name] !== 'undefined';
    },

    function clearPrivate_(name) {
      if ( this.private_ ) this.private_[name] = undefined;
    },

    function validate() {
      var as = this.cls_.getAxioms();
      for ( var i = 0 ; i < as.length ; i++ ) {
        var a = as[i];
        a.validateInstance && a.validateInstance(this);
      }
    },

    /** Create a deep copy of this object. **/
    function clone() {
      var m = {};
      for ( var key in this.instance_ ) {
        var value = this[key];
        this.cls_.getAxiomByName(key).cloneProperty(value, m);
      }
      return this.cls_.create(m);
    },

    function toString() {
      // Distinguish between prototypes and instances.
      return this.cls_.id + (
        this.cls_.prototype === this ? 'Proto' : '' );
    }
  ]
});
