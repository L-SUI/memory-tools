const paths = require('path');
const fs = require('fs');
const cwd = process.cwd();

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
module.exports = getAbsolutePath;
