const fs = require('fs');
const inquirer = require('inquirer');
const shell = require('shelljs');
const contrast = require('./contrast');
const { echo, exec, exit } = shell;

async function main () {
  const { add, base, baseUrl } = await inquirer.prompt([{
    type: 'input',
    message: '请输入文件路径(相对路径)',
    name: 'baseUrl'
  }, {
    type: 'input',
    message: '请输入增加KEY的分支名',
    name: 'add'
  }, {
    type: 'input',
    message: '请输入基础的分支名',
    name: 'base'
  }]);
  echo('\nstart......\n');
  // await exec(`cd ${process.cwd()}`);
  await exec(`git diff -W ${base} ${add} ${process.cwd()}/${baseUrl} > pre.txt`);
  const str = fs
  .readFileSync(process.cwd() + '/pre.txt', 'utf8');
  const pre = str
    .split('\n')
    .slice(5)
    .filter((item) => item[0] !== '+' && item[0] !== '@')
    .map((item) => (item[0] === '-' ? item.slice(1) : item))
    .join('\n');
  const curr = str
  .split('\n')
  .slice(5)
  .filter((item) => item[0] !== '-' && item[0] !== '@')
  .map((item) => (item[0] === '+' ? item.slice(1) : item))
  .join('\n');
  const result = contrast(JSON.parse(curr), JSON.parse(pre), '');

  const fileName = 'contrast.txt';
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
    exec('rm pre.txt');
  });
  ws.on('error', () => {
    exit(1);
  });
  ws.write(content);
  ws.end();
}
module.exports = main;
