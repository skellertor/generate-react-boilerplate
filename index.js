#!/usr/bin/env node

const { textSync } = require('figlet');
const program = require('commander');

const util = require('./util');

console.log(textSync('Clip-boilerplate', {
    font: 'Tombstone',
    horizontalLayout: 'default',
    verticalLayout: 'default'
}));

program
    .version('1.0.0')
    .description('Create Boilerplate')
    .command('init')
    .description('Start the creation process')
    .action(util.prompt);

// if no command show help menu
if (!process.argv.slice(2).length) program.help(text => `${text}\n`);

program.parse(process.argv);
