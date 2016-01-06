'use strict';

// Gulp and Gulp Plugins
var gulp = require('gulp');

/**
 * Concatenate all of the files together in a specific order
 */
gulp.task('build-js-files', function () {
  var concat = require('gulp-concat');
  var uglify = require('gulp-uglify');
  var babel = require('gulp-babel');
  var header = require('gulp-header');
  var footer = require('gulp-footer');
  var merge = require('merge-stream');

  // Manually order the files so that the require dependencies work - this
  // will not work if the library becomes much more complicated
  [
    {file: './dependencies/Hoek.js', name: 'hoek'},
    {file: './dependencies/isemail.js', name: 'isemail'},
    {file: './dependencies/moment.js', name: 'moment'},
    {file: './dependencies/Topo.js', name: 'topo'},

    // Project helpers
    {file: './lib/string/rfc3986.js', name: './rfc3986'},
    {file: './lib/string/ip.js', name: './string/ip'},
    {file: './lib/string/uri.js', name: './string/uri'},

    // Core classes
    {file: './lib/language.js', name: './language'},
    {file: './lib/errors.js', name: './errors'},
    {file: './lib/ref.js', name: './ref'},
    {file: './lib/cast.js', name: './cast'},
    {file: './lib/any.js', name: './any'},
    {file: './lib/alternatives.js', name: './alternatives'},

    // Assertions
    {file: './lib/array.js', name: './array'},
    {file: './lib/boolean.js', name: './boolean'},
    {file: './lib/date.js', name: './date'},
    {file: './lib/number.js', name: './number'},
    {file: './lib/object.js', name: './object'},
    {file: './lib/string.js', name: './string'},

    // Export
    {file: './lib/index.js', name: './index'}
  ]
    .forEach((info, idx) => {
      const file = info.file;
      const name = info.name;
      const headerText = [
        '\n',
        '!(function (cache, require) {',
        '  var module = {exports: {}};',
        '  var exports = module.exports;\n\n'
      ].join('\n');

      const footerText = [
        '\n',
        '  cache["' + name + '"] = module.exports;',
        '}(requireCache, require));\n\n'
      ].join('\n');

      return gulp.src(file)
        .pipe(header(headerText))
        .pipe(footer(footerText))
        .pipe(gulp.dest('./build/'))
    });
});

gulp.task('build-final', function () {
  var concat = require('gulp-concat');
  var uglify = require('gulp-uglify');
  var babel = require('gulp-babel');
  var header = require('gulp-header');
  var footer = require('gulp-footer');
  var merge = require('merge-stream');


  // Wrap the whole thing in an IIFE because there are a bunch of floating
  // 'use strict' statements that could have adverse effects on third-party
  // scripts
  return gulp.src([
    './build/Hoek.js',
    './build/isemail.js',
    './build/moment.js',
    './build/Topo.js',

    './build/rfc3986.js',
    './build/ip.js',
    './build/uri.js',

    // Core classes
    './build/language.js',
    './build/errors.js',
    './build/ref.js',
    './build/cast.js',
    './build/any.js',
    './build/alternatives.js',

    // Assertions
    './build/array.js',
    './build/boolean.js',
    './build/date.js',
    './build/number.js',
    './build/object.js',
    './build/string.js',

    // Export
    './build/index.js'
  ])
    .pipe(concat('Joi.min.js'))
    .pipe(babel({
      presets: ["es2015"],
      compact: false
    }))
    .pipe(header([
      ';(function (global, factory) {',
      " typeof exports === 'object' && typeof module !== 'undefined'",
      "  ? module.exports = factory() :",
      "typeof define === 'function' && define.amd ? define(factory) :",
      "global.Joi = factory();",
      "}(this, function () {",
      '  var requireCache = {};',

      '  function require (name) {',
      '    return requireCache[name];',
      '  }\n\n'
    ].join('\n')))
    .pipe(footer([
      '\n',
      '  return requireCache["./index"];',
      '}));\n'
    ].join('\n')))

    .pipe(uglify())
    .pipe(gulp.dest('./dist/'));
});

// Generate the task ordering
gulp.task('default', ['build-js-files', 'build-final']);


