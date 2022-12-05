const result = [];
function contrast (currData, preData, currentStr) {
  const currObjKeys = Object.keys(currData);
  currObjKeys.forEach((item) => {
    if (preData[item] && typeof preData[item] === 'object') {
      contrast(currData[item], preData[item], currentStr + item + '.');
    } else if (!preData[item] && typeof currData[item] === 'string') {
      result.push([currentStr + item, currData[item]]);
    } else if (!preData[item] && typeof currData[item] === 'object') {
      generateResult(currData[item], currentStr + item + '.');
    }
  });
  return result;
}

function generateResult (data, currentStr) {
  const dataKeys = Object.keys(data);
  dataKeys.forEach((item) => {
    if (typeof data[item] === 'object') {
      generateResult(data[item], currentStr + item + '.');
    } else {
      result.push([currentStr + item, data[item]]);
    }
  });
}

module.exports = contrast;
