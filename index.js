'use strict';

var buble = require('buble');
var path = require('path');

function BubleError (err) {
  Error.call(this);
  Error.captureStackTrace(this, BubleError);

  this.name = 'BubleLoaderError';
  this.message = ['', err.snippet, err.message].join('\n');
  this.hideStack = true;
  this.error = err;
}

BubleError.prototype = Object.create(Error.prototype);
BubleError.prototype.constructor = BubleError;

function handleError (err) {
    if (err.name === 'CompileError') {
        throw new BubleError(err);
    } else {
        throw err;
    }
}

module.exports = function BubleLoader(source, inputSourceMap) {
    var transformed;
    try {
        transformed = buble.transform(source, {
            transforms: {
                modules: false
            }
        });
    } catch (err) {
        handleError(err);
    }

    var resourcePath = this.resourcePath;

    transformed.map.file = resourcePath;
    transformed.map.sources[0] = path.relative(process.cwd(), resourcePath);
    transformed.map.sourceRoot = process.cwd();

    this.cacheable && this.cacheable();
    this.callback(null, transformed.code, transformed.map);
};
