const ora = require('ora');
const codeAnalysis = require('./codeAnalysls');
const logs = require('../../utils/logs');

function run (path) {
  const ORA_INSTANCE = ora('分析中....');
  ORA_INSTANCE.start();
  codeAnalysis(`${path}/`)
        .then((res) => {
          ORA_INSTANCE.stop();
          logs.success('分析完成，请查看根目录下的 file.md');
          logs.success('wb 初始化完成，请查看根目录下的 wb.js');
        })
        .catch((res) => {
          ORA_INSTANCE.stop();
          logs.error('没有业务分析数据，请检查输入路径是否正确');
        });
}

module.exports = run;
