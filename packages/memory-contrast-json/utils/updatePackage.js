// 更新 package.json
const fs = require('fs');
const nodefs = require('./nodefs.js');

async function updatePackage (remoteJSONPath, fn) {
  const currentJSON = nodefs.jsonFile('./package.json');
  const remoteJSON = nodefs.jsonFile(remoteJSONPath);

  // 更新方式
  function updateWay (param, type = 1, childParam) {
    // 如果没有 package.json，直接替换
    if (!currentJSON[param]) {
      currentJSON[param] = remoteJSON[param];
      return;
    }

    // 如果有 package.json，进行比较替换
    if (type === 1) { // 直接替换
      for (const key in remoteJSON[param]) {
        currentJSON[param][key] = remoteJSON[param][key];
      }

      return;
    }

    if (type === 2) { // 比较替换
      for (const key in remoteJSON[param]) {
        if (currentJSON[param][key] !== remoteJSON[param][key]) {
          currentJSON[param][key] = remoteJSON[param][key];
        }
      }

      return;
    }

    if (type === 3) { // 深层次替换
      for (const key in remoteJSON[param][childParam]) {
        if (currentJSON[param][childParam][key] !== remoteJSON[param][childParam][key]) {
          currentJSON[param][childParam][key] = remoteJSON[param][childParam][key];
        }
      }
    }
  }

  // scripts：直接替换
  updateWay('scripts');

  // config：直接替换
  updateWay('config');

  // //lint-staged：直接替换
  updateWay('lint-staged');

  // dependencies：比较替换
  updateWay('dependencies', 2);

  // devDependencies：比较替换
  updateWay('devDependencies', 2);

  // 重写 package.json
  await fs.writeFileSync('./package.json', JSON.stringify(currentJSON, null, 2));
}

module.exports = updatePackage;
