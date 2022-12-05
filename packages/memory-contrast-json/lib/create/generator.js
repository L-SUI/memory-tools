const logs = require('../../utils/logs');
const { shellExec, existsSync } = require('../../utils/templateShell');
const cwd = process.cwd();
const paths = require('path');
const fs = require('fs');
const Metalsmith = require('metalsmith');
const Handlebars = require('handlebars');

module.exports = async function generator (srcpath, branch, chooseList, materials) {
  const HAS_ROUTER = chooseList.includes('Router');
  const HAS_VUEX = chooseList.includes('Vuex');
  const HAS_DEFAULT = chooseList.includes('Default');
  const HAS_VITELESS = chooseList.includes('ViteLess');

  // 用于模版扩展
  await shellExec(`
        cd front-base-template;
        git pull;
        git checkout ${branch};
        cd ..;
        rm -rf .temp;
        cp -R front-base-template/. .temp;
        rm -rf .temp/.git 
    `);

  const { copyTarget, targetDir } = getAbsolutePath(srcpath);
  if (existsSync(copyTarget)) {
    return logs.error('文件夹已经存在');
  }

  if (!HAS_ROUTER) {
    await shellExec(`
            rm -rf .temp/router
            rm -rf .temp/views
        `);
  }
  if (materials && materials.length > 0) {
    await shellExec(`
     cd front-base-template;
     git checkout material;
     `);
    for (let i = 0; i < materials.length; i++) {
      await shellExec(`
            cp -R front-base-template/components/${materials[i]} .temp/components;
        `);
    }
  }
  if (!HAS_VUEX) {
    await shellExec(`
            rm -rf .temp/store
        `);
  }

  await shellExec('rm -rf .temp/resetVite');

  if (!HAS_VITELESS) {
    await shellExec(`
        rm -rf .temp/css/reset-vite.less
        rm -rf .temp/css/vite-bg.less
    `);
  }

  // 默认情况下，不需要router 和 vuex
  if (HAS_DEFAULT) {
    await shellExec(`
            rm -rf .temp/router
            rm -rf .temp/views
            rm -rf .temp/config
        `);
    await shellExec(`
            rm -rf .temp/store
        `);
  }
  await shellExec(`
      rm -rf front-base-template
     `);

  // 开始处理模板信息
  Metalsmith(cwd)
        .metadata({
          router: HAS_ROUTER,
          vuex: HAS_VUEX
        })
        .source('node_modules/.temp')
        .destination(`src/${targetDir}/${srcpath}`)
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
          logs.success(`${srcpath} 项目创建成功`);
        });
};

// 获取绝对路径
function getAbsolutePath (srcpath) {
  const targetPath = paths.join(cwd, 'src');
  const dir = fs.readdirSync(targetPath);
  let targeDir;
  dir.forEach((item) => {
    const stats = fs.statSync(paths.join(targetPath, item));
    if (stats.isDirectory()) {
      if (item !== 'common') {
        targeDir = item;
      }
    }
  });

  return {
    copyTarget: paths.join(cwd, 'src', targeDir, srcpath),
    targetDir: targeDir
  };
}
