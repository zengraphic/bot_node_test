const convertToObj = (keys, valuesArrays) => {
    const finalArrray = [];
    valuesArrays.forEach((arr, i) => {
      finalArrray.push(Object.assign(...keys.map((k, i) => ({ [k]: arr[i] }))));
    });
    return finalArrray;
  };

module.exports = {
    convertToObj
}