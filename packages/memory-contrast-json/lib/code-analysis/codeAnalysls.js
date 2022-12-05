const path = require('path');
const fs = require('fs');
const basePath = 'node_modules/front-base-common';
const cwd = process.cwd();
const logs = require('../../utils/logs');
const { readTextFile, FIND_ALL_PATH } = require('../../utils/nodefs');

// 校验是否安装了 front-base-common
const VERIFY_MODULE = () => {
  try {
    if (fs.statSync(path.join(cwd, basePath))) {
      return true;
    }
  } catch (error) {
    logs.error('❌ 请安装 npm install front-base-common --save');
    return false;
  }
};

// 对比 front-base-common 与 业务的数据
const COMPARE = (wb, data) => {
  return new Promise((resolve, reject) => {
    if (Object.keys(data).length === 0) {
      reject(new Error('something bad happened'));
    }
    const MapReport = {};
    const useMap = {};
    for (const key in data) {
      const keys = Object.keys(data[key]);

      const canUse = [];
      const noCanUse = [];
      keys.forEach((k) => {
        if (wb[k]) {
          // 存在，
          canUse.push(k);
          useMap[k] = true;
          return;
        } // 不存在
        noCanUse.push(k);
      });
      MapReport[key] = {};
      MapReport[key].canUse = canUse;
      MapReport[key].noCanUse = noCanUse;
    }
    let str = '';
    Object.keys(MapReport).forEach((key) => {
      str += `## 文件路径：${key}\r\n`;
      if (MapReport[key].canUse.length !== 0) {
        str += '**能够继续使用的方法**：\r\n';
        MapReport[key].canUse.forEach((methods) => {
          str += `${methods}\r\n`;
        });
      }
      if (MapReport[key].noCanUse.length !== 0) {
        str += '**废弃方法**：\r\n';
        MapReport[key].noCanUse.forEach((methods) => {
          str += `${methods}\r\n`;
        });
      }

      str += '\r\n';
    });
    fs.writeFileSync('./file.md', str);
    INIT_WB_JS(useMap);
    resolve();
  });
};

const INIT_WB_JS = useMap => {
  const str = `import {
    wb,${Object.keys(useMap).map(key => `
    ${key},`).join('')}
    webInteractiveWithNative,
    nativeInteractiveWithWeb
} from 'front-base-common';
${Object.keys(useMap).map(key => `
wb.install(${key});`).join('')}
wb.install(webInteractiveWithNative);
wb.install(nativeInteractiveWithWeb);
export default wb;
`;
  fs.writeFileSync('./wb.js', str);
};

// 获取 front-base-common api list
const GET_COMMON_API = () => {
  const data = fs.readFileSync(
    path.join(cwd, basePath, 'libs/utils/pluginInterface.d.ts'),
    'utf-8'
  );
  const [, result] = /PluginInterface {([^}]*)}/.exec(data);
  return result.split('\n').reduce((pre, next) => {
    const [key] = next.split(': ');
    if (key.length > 0) {
      pre[key.trim()] = true;
    }
    return pre;
  }, {});
};

const main = realtivePath => {
  const url = path.join(cwd, realtivePath + '**/*.?(js|vue)');
  const allpath = FIND_ALL_PATH(url);
  const fnUseCount = {};

  // path 是绝对路径，需要转成相对路径进行统计
  allpath.forEach((spath) => {
    const rPath = spath
            .replace(path.join(cwd, realtivePath), '')
            .split(path.sep)[0];
    const rePath = path.relative(realtivePath, spath);
    const filedata = readTextFile(spath);
    fnUseCount[rePath] = fnUseCount[rePath] || {};
    let getResult = null;
    if (path.extname(spath) === '.vue') {
      getResult = HANDLE_EXT_VUE(filedata, rPath);
    } else {
      getResult = statistics(filedata, rPath);
    }
    fnUseCount[rePath] = Object.assign(fnUseCount[rePath], getResult);
  });

  return fnUseCount;
};

// 处理vue文件
const HANDLE_EXT_VUE = (filedata, rPath) => {
  const result = filedata.match(/<script>([\s\S]*)<\/script>/);
  if (result) {
    return statistics(result[1], rPath);
  }
  return {};
};

// 统计一个文件所使用的函数；
const statistics = (code, rPath) => {
  const BABEL_PARSER = require('@babel/parser');
  const BABEL_TRAVERSE = require('@babel/traverse').default;
  try {
    const AST_INFO = BABEL_PARSER.parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });

    const BIZ_DATA = {};
    BABEL_TRAVERSE(AST_INFO, {
      // eslint-disable-next-line no-shadow
      MemberExpression (path) {
        if (
          path.node.object.type === 'Identifier' &&
                    path.node.object.name === 'wb'
        ) {
          BIZ_DATA[path.node.property.name] = true;
        }
        if (
          path.node.object.type === 'MemberExpression' &&
                    path.node.object.object.type === 'ThisExpression' &&
                    path.node.object.property.name === '$wb'
        ) {
          BIZ_DATA[path.node.property.name] = true;
        }
      },
      // eslint-disable-next-line no-shadow
      ImportDeclaration (path) {
        if (path.node.source.value === 'front-common/build/modules.js') {
          const specifiers = path.node.specifiers;
          specifiers.forEach((specifier) => {
            if (specifier.type !== 'ImportDefaultSpecifier') {
              BIZ_DATA[specifier.imported.name] = true;
            }
          });
        }
      }
    });

    return BIZ_DATA;
  } catch (error) {
    return {};
  }
};

// 业务代码与 front-base-common 对比
const codeAnalysis = p => {
  if (!VERIFY_MODULE()) return false;

  // base-common api 信息
  const BASE_COMMON_CONFIG = GET_COMMON_API();

  // 传入业务的 api 信息
  const BIZ_DATA = main(p);

  // console.log(BASE_COMMON_CONFIG);
  // console.log('----');
  // console.log(BIZ_DATA);
  return COMPARE(BASE_COMMON_CONFIG, BIZ_DATA);
};

module.exports = codeAnalysis;
