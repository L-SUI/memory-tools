#!/usr/bin/env node
const updateNotifier = require('update-notifier');
const semver = require('semver');
const chalk = require('chalk');
const program = require('commander');
const logs = require('../utils/logs');
const enhanceErrorMessages = require('../utils/enhanceErrorMessages');

const {
  engines: { node: requiredNodeVersion },
  name: pkgName,
  version: pkgVersion
} = require('../package.json');

// 1. 检测 node 版本
checkNodeVersion(requiredNodeVersion, pkgName);

// 2.检测版本更新
upNotifier(pkgVersion, pkgName);

// 3. 执行命令
program
  .version(`memory-contrast-json@${pkgVersion}`, '-v, --version')
  .usage('<command> [options]');

// JSON新增KEY对比工具
program
  .description('多语言JSON新增KEY对比')
  .action((name, cmd) => {
    require('../lib/contrast/index')(name);
  });

enhanceErrorMessages('missingArgument', argName => {
  return `Missing required argument ${chalk.yellow(`<${argName}>`)}.`;
});

enhanceErrorMessages('unknownOption', optionName => {
  return `Unknown option ${chalk.yellow(optionName)}.`;
});

program.parse(process.argv);

function checkNodeVersion (wanted, id) {
  if (!semver.satisfies(process.version, wanted)) {
    logs.error(`你正在使用的node版本是${process.version},但是${id}要求版本是${wanted}, 请升级你的node版本`);
    process.exit(1);
  }
}

// 通知版本更新
function upNotifier (version, name) {
  if (!version || !name) return;
  // 检测版本更新
  const notifier = updateNotifier({
    pkg: {
      name,
      version
    },
    updateCheckInterval: 1000 * 60 * 60 * 24, // 1 day
    isGlobal: true,
    shouldNotifyInNpmScript: true
  });
  notifier && notifier.notify();
}
