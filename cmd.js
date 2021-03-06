#!/usr/bin/env node

'use strict';

const fs = require('fs-extra');
const path = require('path');
const minimist = require('minimist');
const listy = require('listy');
const isMarkdown = require('is-md');
const async = require('async');
const GitHubMarkdown = require('./');
const mkdirp = require('mkdirp');
const css = require('./lib/styleTemplate')

let argv = minimist(process.argv.slice(2), {
  alias: {
    t: 'title',
    d: 'dest',
    T: 'template',
    h: 'help',
    v: 'version'
  }
});

if (argv.version) {
  process.stdout.write(require('./package').version + '\n');
  process.exit();
} else if (argv._.length === 0 || argv.help) {
  process.stdout.write(fs.readFileSync('./usage.txt'));
  process.exit();
}

let markdowns = listy(argv._, {
  filter: p => isMarkdown(p)
})

async.each(markdowns, (file, index, files) => {
  let config = {
    title: argv.title || path.basename(file, '.md'),
    file: file,
    template: argv.template
  };

  let dest;
  let filename = path.basename(file, '.md') + '.jsx';

  let ghmd = new GitHubMarkdown(config);
  ghmd.render().then(function (html) {
    let outPath = process.cwd() + '/' + config.title; 
    mkdirp.sync(outPath)
    fs.writeFileSync(outPath + '/style.css', css, {encoding: 'utf8', flag: 'w'});
    fs.writeFileSync(outPath + '/' + filename, html, {encoding: 'utf8', flag: 'w'});
    fs.copySync('./RobotoCondensed-Regular.ttf', outPath + '/RobotoCondensed-Regular.ttf');
  });

}, (error, result) => {
  if (error) {
    throw error;
  }
});
