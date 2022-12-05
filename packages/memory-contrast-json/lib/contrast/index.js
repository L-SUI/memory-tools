const inquirer = require('inquirer');
const choiceList = require('./choiceList');
const unCommit = require('./unCommit');
const lately = require('./lately');
const commits = require('./commits');
const branch = require('./branch');
const json2json = require('./json2json');
async function main () {
  const answers = await inquirer.prompt(choiceList);
  switch (answers.type) {
  case 'json':
    json2json();
    break;
  case 'unCommit':
    unCommit();
    break;
  case 'lately':
    lately();
    break;
  case 'commits':
    commits();
    break;
  case 'branch':
    branch();
    break;
  default: json2json();
  }
}
module.exports = main;
