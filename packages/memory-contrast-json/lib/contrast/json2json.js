const fs = require('fs');
const inquirer = require('inquirer');
const shell = require('shelljs');
const contrast = require('./contrast');
const { echo, exec, exit } = shell;

async function main () {
  const { baseUrl, basePreUrl } = await inquirer.prompt([{
    type: 'input',
    message: '请输入新增文件路径(相对路径)',
    name: 'baseUrl'
  }, {
    type: 'input',
    message: '请输入源文件路径(相对路径)',
    name: 'basePreUrl'
  }]);
  echo('\nstart......\n');
  const pre = fs.readFileSync(`${process.cwd()}/${basePreUrl}`, 'utf8');
  const curr = fs.readFileSync(`${process.cwd()}/${baseUrl}`, 'utf8');
  const result = contrast(JSON.parse(curr), JSON.parse(pre), '');

  const fileName = `${process.cwd()}/contrast.txt`;
  let content = '';
  result.forEach((item) => {
    content += `${item[0]} ${item[1]}\n`;
  });

  const ws = fs.createWriteStream(fileName, {
    encoding: 'utf8',
    autoClose: true
  });
  ws.on('open', () => {
    console.log('正在写入');
  });
  ws.on('finish', () => {
    console.log('写入完成');
    if (process.argv.length === 3) exec('rm pre.txt');
  });
  ws.on('error', () => {
    exit(1);
  });
  ws.write(content);
  ws.end();
}
module.exports = main;
