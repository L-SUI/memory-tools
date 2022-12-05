const inquirer = require('inquirer');
const logs = require('../../utils/logs');
const generator = require('./generator');
const { shellExec, existsSync } = require('../../utils/templateShell');
const simpleChoice = require('./simple-promptList'); // checkbox
const { fetchMaterialList } = require('../../utils/requestMaterialList');
const TEMPLATE_BRANCH = 'default'; // 目前只做 simple 的模版下载，所以默认 default
const TEMPLATE_BRANCH_TS = 'default-ts'; // ts模板分支

function createTemplate (name) {
  inquirer.prompt(simpleChoice).then((answers) => {
    const BRANCH = answers.techList.includes('TypeScript') ? TEMPLATE_BRANCH_TS : TEMPLATE_BRANCH;
    if (answers.techList.includes('Material')) {
      fetchMaterialList((result) => {
        const choices = JSON.parse(result);
        inquirer.prompt([{
          type: 'checkbox',
          message: '请选择对应的物料',
          name: 'materials',
          choices: choices
        }]).then(({ materials }) => {
          downloadrepo(() => {
            generator(name, BRANCH, answers.techList, materials); // 传给generator  文件夹名称 分支名（模板对应的分支名） checkbox选中的list
          });
        });
      });
    } else {
      downloadrepo(() => {
        generator(name, BRANCH, answers.techList); // 传给generator  文件夹名称 分支名（模板对应的分支名） checkbox选中的list
      });
    }
  });
}
function downloadrepo (cb) { // 把front-base-template工程clone 下来
  // 下载模版
  if (!existsSync('node_modules/front-base-template')) {
    shellExec('git clone git@git.wb-intra.com:web_base_group/front-base-template.git')
      .then(() => {
        shellExec('cd front-base-template; git branch -a;clear;')
          .then((data) => {
            cb && cb();
          })
          .catch((e) => {
            logs.error('error', e);
          });
      })
      .catch((e) => {
        logs.error('error', e);
      });
  } else {
    shellExec('cd front-base-template; git branch -a;clear;')
      .then((data) => {
        cb && cb();
      })
      .catch((e) => {
        logs.error('error', e);
      });
  }
}

module.exports = createTemplate;
