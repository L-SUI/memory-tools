module.exports = [{
  type: 'list',
  message: '选择要使用对比方式',
  name: 'type',
  choices: [
    {
      name: '两个JSON文件对比',
      value: 'json'
    },
    {
      name: '当前未commit的JSON文件对比',
      value: 'unCommit'
    },
    {
      name: '最近两次commit的JSON文件对比',
      value: 'lately'
    },
    {
      name: '两次commit的JSON文件对比',
      value: 'commits'
    },
    {
      name: '两个分支的JSON文件对比',
      value: 'branch'
    }
  ]
}];
