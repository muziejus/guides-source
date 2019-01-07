/* eslint no-console:0 import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */

const walkSync = require('walk-sync');
const _ = require('lodash');
const codeBlocks = require('gfm-code-blocks');
const { extname, join, dirname } = require('path');
const {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
} = require('fs');

const currentVersion = 'v3.6.0';

// these regexs are used against the lang definition of a code block to identify the language
// we should add some more for different required languages as we need them
const templatesMatch = /^(handlebars|html|text)/;

const mdFiles = _.chain(walkSync(`guides/${currentVersion}`))
  .filter(path => extname(path) === '.md')
  .value();

mdFiles.forEach((filename) => {
  const source = readFileSync(join(__dirname, 'guides', currentVersion, filename), 'utf-8');
  // console.log(filename);
  const blocks = codeBlocks(source);

  const codeOnly = blocks.reduce((prev, current) => {
    if (!current.lang) {
      console.error(`Missing lang in code block on ${filename}`);
    }

    // change this line if you want to extract different langauages
    if (current.lang.match(templatesMatch)) {
      return `${prev}\n\n${current.block}`;
    }

    console.log(`Ignoring language ${current.lang}`);
    return prev;
  }, '');

  if (codeOnly) {
    const newFilename = join(__dirname, 'code', filename);

    if (!existsSync(dirname(newFilename))) {
      mkdirSync(dirname(newFilename), {
        recursive: true,
      });
    }

    writeFileSync(join(__dirname, 'code', filename), codeOnly);
  }
});
