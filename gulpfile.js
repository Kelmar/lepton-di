'use strict';

const SRC_DIR = 'src';

const { series } = require('gulp');
const { src, dest } = require('gulp');
const { promisify } = require('util');
const { delTree } = require('./scripts/deltree');

const mocha = require('gulp-mocha');

const tsc = require('gulp-typescript');
const path = require('path');
const fs = require('fs');

const exists = promisify(fs.exists);
const mkdir = promisify(fs.mkdir);

var tsProject = tsc.createProject('tsconfig.json');

function clean()
{
    return delTree('./' + SRC_DIR);
}

function makeSrcDir()
{
    let fullName = path.join('./', SRC_DIR);

    return exists(fullName)
        .then(found => found ? Promise.resolve() : mkdir(fullName));
}

function compile()
{
    return tsProject
        .src()
        .pipe(tsProject())
        .pipe(dest(SRC_DIR));
}

var build = series(makeSrcDir, compile)

function runTests()
{
    return src(SRC_DIR + '/tests/index.js', {read: false})
        .pipe(mocha({ reporter: 'nyan' }));
}

exports.clean = clean;
exports.build = build;
exports.rebuild = series(clean, build);
exports.test = series(build, runTests);
exports.default = build;
