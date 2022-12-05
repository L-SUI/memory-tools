const fs = require('fs');
const path = require('path');
const glob = require('glob');

// 只读取当前目录，不递归更深层级的目录
function getdirInfo (url) {
  const info = fs.readdirSync(url);
  const dirs = [];
  const files = [];
  const infos = [];

  info.forEach(file => {
    infos.push(path.join(url, file));
    const stats = fs.statSync(path.join(url, file));
    if (stats.isFile()) {
      files.push(path.join(url, file));
    } else if (stats.isDirectory()) {
      dirs.push(path.join(url, file));
    }
  });

  return {
    infos,
    dirs,
    files
  };
}

// 递归读取所有信息
function getdirAllInfo (url) {
  const opt = {
    info: [],
    dirs: [],
    files: []
  };

  get(url, opt);

  // eslint-disable-next-line no-shadow
  function get (url, opt) {
    const {
      infos,
      dirs,
      files
    } = getdirInfo(url);
    opt.info = opt.info.concat(infos);
    opt.dirs = opt.dirs.concat(dirs);
    opt.files = opt.files.concat(files);

    dirs.forEach(file => {
      get(file, opt);
    });
  }

  return opt;
}

// 递归读取所有CSS信息
function getdirAllCssInfo (url) {
  const opt = [];
  get(url, opt);

  // eslint-disable-next-line no-shadow
  function get (url, opt) {
    const {
      dirs,
      files
    } = getdirInfo(url);

    files.forEach(function (dirsValue) {
      if ((dirsValue.indexOf('less') !== -1) || (dirsValue.indexOf('css') !== -1)) {
        opt.push(dirsValue);
      }
    });

    dirs.forEach(file => {
      get(file, opt);
    });
  }

  return opt;
}

// 读取json文件
function jsonFile (url) {
  const json = fs.readFileSync(url, 'utf8');
  return JSON.parse(json);
}

// 读取纯文本文件
function readTextFile (url) {
  const json = fs.readFileSync(url, 'utf8');
  return json;
}

// 获取所有文件路径
function FIND_ALL_PATH (url) {
  const FILE_LIST = glob.sync(url, {
    nodir: true
  });

  return FILE_LIST;
}

module.exports = {
  getdirInfo,
  getdirAllInfo,
  jsonFile,
  readTextFile,
  getdirAllCssInfo,
  FIND_ALL_PATH
};
