# game-logic

[![Build Status](https://travis-ci.org/anyWareSculpture/game-logic.svg?branch=master)](https://travis-ci.org/anyWareSculpture/game-logic)

[![codecov.io](http://codecov.io/github/anyWareSculpture/game-logic/coverage.svg?branch=master)](http://codecov.io/github/anyWareSculpture/game-logic?branch=master)

![codecov.io](http://codecov.io/github/anyWareSculpture/game-logic/branch.svg?branch=master)

## Usage
This library models the game logic shared by all anyWare implementations.

When installed (or built), modules are stored in a `lib/` directory. Thus when requiring files, make sure that you are adding that before the path of the file you are requiring. In addition, ensure that you are requiring each individual file. `require('@anyware/game-logic')` alone will not work.

Example of correct usage:

    const MyThing = require('@anyware/game-logic/lib/things/my-thing');

This was implemented this way for a variety of reasons:

1. Requiring individual files only gets those files and their dependencies. That way it isn't necessary to include the entire library if you only need a few parts.
2. This means that we don't have to keep any `index.js` or something up to date all the time. You can access whatever you want using the `lib/` directory.

