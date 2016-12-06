# FOAM Documentation Style Guide

FOAM includes a JSDoc plugin to match up its declarative style with traditional
JSDoc comments. To document your classes, properties, and methods, follow this
style guide.

## Classes

Use a normal JSDoc block comment before your `foam.CLASS` declaration. Do not use
`@class`, `@module`, `@extends`, or `@name`, as these will be inserted as necessary
by the plugin. You _can_ use `@ignore` to leave an item out of the documentation.

```javascript
/**
  MyClass is used by my code to produce widgets.
  <p>This is a normal JSDoc comment!
* /
foam.CLASS({
  package: 'com.example',
  name: 'MyClass',

  methods: [
    function hello() { ... }
  ]
});

```

### Linking

FOAM packages are translated into JSDoc modules, so to link to the example above
use a module prefix and specify the package using forward slashes.

```javascript
/**
  Link to class:
  &#123;@link module:com/example.MyClass | Link to MyClass}

  Link to class:
  &#123;@link module:com/example.MyClass#hello | Link to hello method}
* /
```

## Methods

Methods documentation is placed inside the method body, before any statements.

```javascript
foam.CLASS({
  package: 'com.example',
  name: 'MyClass',

  methods: [
    function goodbye() {
      /** The goodbye method says no! */
      console.log('no!');
    }
  ]
});
```

### Method Arguments

Method arguments can either be listed in your main comment using @arg or @param,
or you can use FOAM's type system to declare their types and add comments.

```javascript
foam.CLASS({
  package: 'com.example',
  name: 'MyClass',

  methods: [
    function hello(/* number */ intArg, /* com.example.MyClass */ other,
        /* array */ arr) {
      /**
        The hello method says hello, and the types listed will appear in the
        generated documentation along with the argument names. You can use a
        class name, a javascript 'typeof' name, or 'array'.
      */
      console.log('hello');
    },

    function goodbye(arg) {
      /**
        Or document types in the comment:
        @param {com.example.MyType} arg  An arg!
      */
      console.log('no!');
    },
  ]
});
```

## Properties

Property declarations are a non-standard case for JSDoc, since they appear to be object
blocks in an array. Put your comment *inside* the braces. As with the other cases,
don't use `@name` since this will be specified for you based on the property name.

```javascript
foam.CLASS({
  package: 'com.example',
  name: 'MyClass',

  properties: [
    {
      /** Stores the value */
      name: 'value',
      defaultValue: 77
    }
  ]
});
```




