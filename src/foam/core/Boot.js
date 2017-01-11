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

/**
 Bootstrap support.

 Is discarded after use.
*/
foam.LIB({
  name: 'foam.boot',

  constants: {
    startTime: Date.now(),
  },

  methods: [
    /**
      Create or Update a Prototype from a Model definition.

      This will be added as a method on the Model class
      when it is eventually built.

      (Model is 'this').
    */
    function buildClass() {
      var context = foam.__context__;
      var cls;

      if ( this.refines ) {
        cls = context.lookup(this.refines);
        foam.assert(cls, 'Unknown refinement class: ' + this.refines);
      } else {
        foam.assert(this.id, 'Missing id name.', this.name);
        foam.assert(this.name, 'Missing class name.');

        var parent = this.extends      ?
          context.lookup(this.extends) :
          foam.core.FObject;

        cls                  = parent.createSubClass();
        cls.prototype.cls_   = cls;
        cls.prototype.model_ = this;
        cls.count_           = 0;            // Number of instances created
        cls.id               = this.id;
        cls.package          = this.package;
        cls.name             = this.name;
        cls.model_           = this;
      }

      cls.installModel(this);

      return cls;
    },

    function start() {
      /* Start the bootstrap process. */

      var buildClass = this.buildClass;

      // Will be replaced in phase2.
      foam.CLASS = function(m) {
        m.id = m.package + '.' + m.name;
        var cls = buildClass.call(m);

        foam.assert(
          ! m.refines,
          'Refines is not supported in early bootstrap');

        foam.register(cls);

        // Register the class in the global package path.
        foam.package.registerClass(cls);

        return cls;
      };
    },

    // --- Start second phase of bootstrap process ---

    function phase2() {
      // Upgrade to final CLASS() definition.
      foam.CLASS = function(m) {
        /**
         * Creates a Foam class from a plain-old-object definition.
         * See foam.core.Model
         * @method CLASS
         * @memberof module:foam
         * @param {AnyMap} m
         */
        var model = foam.core.Model.create(m);
        model.validate();
        var cls = model.buildClass();
        cls.validate();

        if ( ! m.refines ) {
          foam.register(cls);

          // Register the class in the global package path.
          foam.package.registerClass(cls);
        }

        return cls;
      };

      // Upgrade existing classes to real classes.
      for ( var key in foam.core ) {
        var m = foam.lookup(key).model_;
        m.refines = m.id;
        foam.CLASS(m);
      }
    },

    function phase3() {
      // Substitute FObject.installModel() ( defined in FObject.js ) with
      // the final version.  A simpler axiom-only verion.
      foam.core.FObject.installModel = function installModel(m) {
        this.installAxioms(m.axioms_);
      };
    },

    /** Finish the bootstrap process, deleting foam.boot when done. */
    function end() {
      var Model = foam.core.Model;

      // Update psedo-Models to real Models
      var upgrade = function(pkg) {
        for ( var key in pkg ) {
          var c = pkg[key];

          // If c.prototype is not defined, this is a subpackage, eg.
          // foam.core.property. Recurse into it.
          if ( ! c.prototype ) {
            upgrade(c);
          } else {
            c.prototype.model_ = c.model_ = Model.create(c.model_);
          }
        }
      };

      upgrade(foam.core);

      delete foam.boot;

      var bootTime = Date.now() - this.startTime;
      foam._BOOT_TIME_ = bootTime;

      console.log('core boot time: ', bootTime);
    }
  ]
});


foam.boot.start();
