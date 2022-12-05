const program = require('commander');
const chalk = require('chalk');
const logs = require('./logs');

module.exports = (methodName, log) => {
  program.Command.prototype[methodName] = function (...args) {
    if (methodName === 'unknownOption' && this._allowUnknownOption) {
      return;
    }
    this.outputHelp();
    logs.error(chalk.red(log(...args)));
    process.exit(1);
  };
};
