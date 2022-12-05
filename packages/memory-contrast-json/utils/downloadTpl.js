const { shellExec } = require('./templateShell');
const Metalsmith = require('metalsmith');
const Handlebars = require('handlebars');
const logs = require('./logs');

const DEFAULT_REPO = 'git@git.wb-intra.com:web_base_group/front-base-template.git';

// 下载模版
async function downloadTpl ({ branch, repo = DEFAULT_REPO, targetDir }) {
  await shellExec(`
    rm -rf wb-temporary;
    mkdir wb-temporary;
    cd wb-temporary;
    git clone ${repo};
    cd front-base-template;
    git checkout default;
    rm -rf .git;
    cd ..;
  `);
  Metalsmith()
    .metadata({
      router: true,
      vuex: true
    })
    .source('wb-temporary/front-base-template')
    .destination('app')
    .use((files, metalsmith, done) => {
      const meta = metalsmith.metadata();
      Object.keys(files).forEach((fileName) => {
        const t = files[fileName].contents.toString();
        files[fileName].contents = Buffer.from(
          Handlebars.compile(t)(meta)
        );
      });
      done();
    })
    .build((err) => {
      if (err) {
        return logs.error(err);
      }
      logs.success(`${branch} 模版创建成功`);
    });
}

module.exports = downloadTpl;
