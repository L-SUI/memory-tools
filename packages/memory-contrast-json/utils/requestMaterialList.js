const http = require('http');
const TOKEN = 'HWZECa8WNgaAHrjeiZ3y';
const OPTIONS = {
  host: 'git.wb-intra.com',
  method: 'get',
  path: '/api/v4/projects/446/repository/files/material.json/raw?ref=material',
  headers: {
    'private-token': TOKEN
  }
};
function fetchMaterialList (callback) {
  const req = http.request(OPTIONS, res => {
    let result = '';
    res.on('data', chunk => {
      result += chunk;
    });
    res.on('end', () => callback(result));
  });
  req.on('error', error => {
    console.error(error);
  });
  req.end('end');
}
module.exports = {
  fetchMaterialList
};
