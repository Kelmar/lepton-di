'use strict';

const BULID_DIR = 'build';

const { series, parallel } = require('gulp');
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
    return delTree('./' + BULID_DIR);
}

function makeBuildDir()
{
    let fullName = path.join('./', BULID_DIR);

    return exists(fullName)
        .then(found => found ? Promise.resolve() : mkdir(fullName));
}

function copyResources()
{
    return src(['src/**/*', '!src/**/*.ts'])
        .pipe(dest(BULID_DIR));
}

function compile()
{
    return tsProject
        .src()
        .pipe(tsProject())
        .js.pipe(dest(BULID_DIR));
}

var build = series(makeBuildDir, parallel(copyResources, compile))

function runTests()
{
    return src(BULID_DIR + '/tests/index.js', {read: false})
        .pipe(mocha({ reporter: 'nyan' }));
}

exports.clean = clean;
exports.build = build;
exports.rebuild = series(clean, build);
exports.test = series(build, runTests);
exports.default = build;
