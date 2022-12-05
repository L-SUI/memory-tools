const shell = require('shelljs');
const version = require('./lerna').version;
console.log(version);

const main = async () => {
  const isAlpha = !!(version.indexOf('alpha') > -1);

  if (isAlpha) {
    await shell.exec('git add -A');
    await shell.exec(`git commit -m "chore(prerelease): prerelease ${version}"`);
    await shell.exec('git push');
  } else {
    await shell.exec(`npm run standard-version -- --release-as ${version}`);
    await shell.exec(`git push origin v${version}`);
    await shell.exec('git push --follow-tags origin master');
    await shell.exec('git add -A');
    await shell.exec(`git commit -m "chore(release): release ${version}"`);
    await shell.exec('git push');
  }
};

main();
