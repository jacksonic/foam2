# FOAM

Build fully featured high performance apps in less time using FOAM.

  * Application Speed
  * Application Size
  * Developer Efficiency

"Fast apps Fast"

[http://foamdev.com](http://foamdev.com)

## Feature Oriented Active Modeller

Foam is a Modeller: describe your data's properties, methods, event topics,
listeners, dependencies, etc., and Foam will generate your javascript classes.
Use them with Foam's data access layer for easy offline support and pick your
favorite front end framework.

While Foam is written in Javascript, it can be used to generate code for any
language or platform. Android and iOS Swift support are on the way.

# Development

## Style Guide

All code should folow the [style guide.](/doc/gen/tutorial-StyleGuide.html)

# Contributing

Before contributing code to FOAM, you must complete the [Google Individual Contributor License Agreement](https://cla.developers.google.com/about/google-individual?csw=1).

We are using codereview.cc to manage code reveiws, CI, etc. To get set up,
[follow the directions](https://secure.phabricator.com/book/phabricator/article/arcanist_quick_start/)
to install arcanist, and then visit the
[apitokens page](http://codereview.cc/settings/panel/apitokens/)
to manually generate a token.

Once you have your API token, create `~/.arcrc`:
```
{
 "config": {
   "default": "http://codereview.cc/"
 },
 "hosts": {
   "http://codereview.cc/api/": {
     "token": "YOUR_TOKEN_HERE"
   }
 }
}
```

`arc list` should then tell you that you have no open revisions.
