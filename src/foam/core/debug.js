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

/** Describes one argument of a function or method. */
foam.CLASS({
  package: 'foam.core',
  name: 'Argument',

  constants: {
    PREFIX: 'Argument',
  },

  properties: [
    {
      /** The name of the argument */
      name: 'name'
    },
    {
      /**
        The string name of the type
        (either a model name or javascript typeof name)
      */
      name: 'typeName'
    },
    {
      /** If set, this holds the actual Model represented by typeName. */
      name: 'type'
    },
    {
      /** If true, indicates that this argument is optional. */
      name: 'optional', value: false
    },
    {
      /** If true, indicates a variable number of arguments. */
      name: 'repeats', value: false
    },
    {
      /** The index of the argument (the first argument is at index 0). */
      name: 'index', value: -1
    },
    {
      /** The documentation associated with the argument (denoted by a // ) */
      name: 'documentation', value: ''
    }
  ],

  methods: [
    /**
      Validates the given argument against this type information.
      If any type checks are failed, a TypeError is thrown.
     */
    function validate(/* any // the argument value to validate. */ arg) {
      var i = ( this.index >= 0 ) ? ' ' + this.index + ', ' : ', ';

      // optional check
      if ( ( ! arg ) && typeof arg === 'undefined' ) {
        if ( ! this.optional ) {
          throw new TypeError(
              this.PREFIX + i + this.name +
              ', is not optional, but was undefined in a function call');
        } else {
          return; // value is undefined, but ok with that
        }
      }

      // type this for non-modelled types (no model, but a type name specified)
      if ( ! this.type ) {
        if ( this.typeName &&
            typeof arg !== this.typeName &&
            ! ( this.typeName === 'array' && Array.isArray(arg) ) ) {
          throw new TypeError(
              this.PREFIX + i + this.name +
              ', expected type ' + this.typeName + ' but passed ' +
              (typeof arg));
        } // else no this: no type, no typeName
      } else {
        // have a modelled type
        if ( ! this.type.isInstance(arg) ) {
          var gotType = (arg.cls_) ? arg.cls_.name : typeof arg;
          throw new TypeError(
              this.PREFIX + i + this.name +
              ', expected type ' + this.typeName + ' but passed ' + gotType);
        }
      }
    }
  ]
});

/** Describes a function return type. */
foam.CLASS({
  package: 'foam.core',
  name: 'ReturnValue',
  extends: 'foam.core.Argument',

  constants: {
    PREFIX: 'Return'
  }
});


/** The types library deals with type safety. */
foam.LIB({
  name: 'foam.types',

  methods: [
    function getFunctionArgs(fn) {
      /** Extracts the arguments and their types from the given function.
         @arg {function} fn The function to extract from. The toString() of the function
             must be accurate.
         @return An array of Argument objects.
       */
      // strip newlines and find the function(...) declaration
      var args = foam.Function.argsStr(fn);
      if ( ! args ) return [];
      args += ','; // easier matching

      var ret = [];
      var retMapByName = {};
      // check each arg for types
      // Optional commented type(incl. dots for packages), argument name,
      // optional commented return type
      // ws [/* ws package.type? ws */] ws argname ws [/* ws retType ws */]
      //console.log('-----------------');
      var argIdx = 0;
      var argMatcher = /(\s*\/\*\s*([\w._$]+)(\?)?(\*)?\s*(\/\/\s*(.*?))?\s*\*\/)?\s*([\w_$]+)\s*(\/\*\s*([\w._$]+)\s*\*\/)?\s*\,+/g;
      var typeMatch;
      while ( typeMatch = argMatcher.exec(args) ) {
        // if can't match from start of string, fail
        if ( argIdx === 0 && typeMatch.index > 0 ) break;

        if ( ret.returnType ) {
          throw new SyntaxError("foam.types.getFunctionArgs return type '" +
            ret.returnType.typeName +
            "' must appear after the last argument only: " + args.toString());
        }

        // record the argument
        var arg = foam.core.Argument.create({
          name:          typeMatch[7],
          typeName:      typeMatch[2],
          type:          foam.lookup(typeMatch[2], true),
          optional:      typeMatch[3] === '?',
          repeats:       typeMatch[4] === '*',
          index:         argIdx++,
          documentation: typeMatch[6],
        });
        ret.push(arg);
        retMapByName[arg.name] = arg;

        // if present, record return type (if not the last arg, we fail on the
        // next iteration)
        if ( typeMatch[9] ) {
          ret.returnType = foam.core.ReturnValue.create({
            typeName: typeMatch[9],
            type: foam.lookup(typeMatch[9], true)
          });
        }
      }
      if ( argIdx === 0 ) {
        // check for bare return type with no args
        typeMatch = args.match(/^\s*\/\*\s*([\w._$]+)\s*\*\/\s*/);
        if ( typeMatch && typeMatch[1] ) {
          ret.returnType = foam.core.ReturnValue.create({
            typeName: typeMatch[1],
            type: foam.lookup(typeMatch[1], true)
          });
        } else {
          throw new SyntaxError(
              'foam.types.getFunctionArgs argument parsing error: ' +
              args.toString());
        }
      }

      // Also pull args out of the documentation comment (if inside the body
      // so we can access it)
      var comment = foam.Function.functionComment(fn);
      if ( comment ) {
        // match @arg or @param {opt_type} arg_name
        var commentMatcher = /.*(\@arg|\@param|\@return)\s+(?:\{(.*?)\}\s+)?(.*?)\s+(?:([^\@]*))?/g;
        var commentMatch;
        while ( commentMatch = commentMatcher.exec(comment) ) {
          var name = commentMatch[3];
          var type = commentMatch[2];
          var docs = commentMatch[4] && commentMatch[4].trim();

          if ( commentMatch[1] === '@return' ) {
            if ( ret.returnType ) {
              throw new SyntaxError(
                  'foam.types.getFunctionArgs duplicate return type ' +
                  'definition in block comment: \"' +
                  type + '\" from ' + fn.toString());
            }
            ret.returnType = foam.core.ReturnValue.create({
              typeName: type,
              type: foam.lookup(type, true),
              documentation: docs
            });
          } else {
            // check existing args
            if ( retMapByName[name] ) {
              if ( retMapByName[name].typeName ) {
                throw new SyntaxError(
                    'foam.types.getFunctionArgs duplicate argument ' +
                    'definition in block comment: \"' +
                    name + '\" from ' + fn.toString());
              }
              retMapByName[name].typeName = type;
              retMapByName[name].documentation = docs;
            } else {
              var arg = foam.core.Argument.create({
                name:          name,
                typeName:      type,
                type:          foam.lookup(type, true),
                index:         argIdx++,
                documentation: docs
              });
              ret.push(arg);
              retMapByName[arg.name] = arg;
            }
          }
        }
      }

      return ret;
    },

    /** Decorates the given function with a runtime type checker.
      * Types should be denoted before each argument:
      * <code>function(\/\*TypeA\*\/ argA, \/\*string\*\/ argB) { ... }</code>
      * Types are either the names of Models (i.e. declared with CLASS), or
      * javascript primitives as returned by 'typeof'. In addition, 'array'
      * is supported as a special case, corresponding to an Array.isArray()
      * check.
      * @arg fn The function to decorate. The toString() of the function must be
      *     accurate.
      * @return A new function that will throw errors if arguments
      *         doesn't match the declared types, run the original function,
      *         then type check the returned value.
      */
    function typeCheck(fn) {
      // parse out the arguments and their types
      var args = foam.types.getFunctionArgs(fn);
      var ret = function() {
        // check each declared argument, arguments[i] can be undefined for
        // missing optional args, extra arguments are ok
        for ( var i = 0 ; i < args.length ; i++ ) {
          args[i].validate(arguments[i]);
        }

        // if last arg repeats, validate remaining arguments against lastArg
        var lastArg = args[args.length - 1];
        if ( lastArg && lastArg.repeats ) {
          for ( var i = args.length ; i < arguments.length ; i++ ) {
            lastArg.validate(arguments[i]);
          }
        }

        // If nothing threw an exception, we are free to run the function
        var retVal = fn.apply(this, arguments);

        // check the return value
        if ( args.returnType ) args.returnType.validate(retVal);

        return retVal;
      };

      // keep the old value of toString (hide the decorator)
      ret.toString = function() { return fn.toString(); };

      return ret;
    }
  ]
});

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

      foam.assert(
          ! this.name.endsWith('$'),
          'Illegal Property Name: Can\'t end with "$": ', this.name);

      foam.assert(
          ! this.name.startsWith('__'),
          'Illegal Property Name: Names beginning with double underscore ' +
          '"__" are reserved: ', this.name);
    }
  ]
});


// Decorate installModel() to verify that axiom names aren't duplicated.
foam.core.FObject.installModel = (function() {
  var superInstallModel = foam.core.FObject.installModel;

  return function(m) {
    var names = {};

    for ( var i = 0; i < m.axioms_.length; i++ ) {
      var a = m.axioms_[i];

      foam.assert(! names.hasOwnProperty(a.name),
        'Axiom name conflict in', m.id || m.refines, ':', a.name);

      var prevA    = this.getAxiomByName(a.name);
      var Property = foam.core.Property;
      // Potential failure if:
      //    previousAxiom class does not match newAxiom class
      // But ignore valid cases:
      //    base Property extended by subclass of Property
      //    subclass of Property extended without specifying class
      if ( prevA && prevA.cls_ !== a.cls_ &&
          ! (prevA.cls_ === Property && Property.isSubClass(a.cls_)) &&
          ! (Property.isSubClass(prevA.cls_) && a.cls_ === Property) ) {
        var prevCls = prevA.cls_ ? prevA.cls_.id : 'anonymous';
        var aCls    = a.cls_     ? a.cls_.id     : 'anonymous';

        if ( Property.isSubClass(prevA.cls_) &&
            ! Property.isSubClass(a.cls_) ) {
          throw 'Illegal to change Property to non-Property: ' + this.id + '.' +
            a.name + ' changed to ' + aCls;
        // FUTURE: This case is needed when we have other method types, like
        // Templates and Actions.
        //} else if ( foam.core.Method.isSubClass(prevA.cls_) &&
        //    foam.core.Method.isSubClass(a.cls_) ) {
        //  // NOP
        } else if ( prevA.cls_ ) {
          // FUTURE: Make this an error when supression is supported.
          console.warn('Change of Axiom ' + this.id + '.' + a.name +
              ' type from ' + prevCls + ' to ' + aCls);
        }
      }

      names[a.name] = a;
    }

    superInstallModel.call(this, m);
  };
})();


foam.CLASS({
  refines: 'foam.core.FObject',

  documentation: 'Assert that all required imports are provided.',

  methods: [
    function init() {
      var is = this.cls_.getAxiomsByClass(foam.core.Import);
      for ( var i = 0 ; i < is.length ; i++ ) {
        var imp = is[i];

        if ( imp.required && ! this.__context__[imp.key + '$'] ) {
          var m = 'Missing required import: ' + imp.key + ' in ' + this.cls_.id;
          foam.assert(false, m);
        }
      }
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.Import',

  properties: [
    {
      name: 'name',
      assertValue: function(n) {
        if ( ! /^[a-zA-Z][a-zA-Z0-9_]*?$/.test(n) ) {
          var m = 'Import name "' + n + '" must be a valid variable name.';
          if ( n.indexOf('.') !== -1 ) m += ' Did you mean requires:?';

          foam.assert(false, m);
        }
      }
    }
  ],

  methods: [
    function installInClass(c) {
      // Produce warning for duplicate imports
      if ( c.getSuperAxiomByName(this.name) ) {
        // TODO(adamvy): Don't warn if ancestor import is equal to this one.
        // Will be done when we have .compareTo() and/or .equals() support
        // on FObjects.
        console.warn(
          'Import "' + this.name + '" already exists in ancestor class of ' +
          c.id + '.');
      }
    }
  ]
});
