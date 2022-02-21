require("dotenv").config();

const sheetID = "19A7jfTKkZ-_66dQUKpH3tpNFzqBOEQXC2WtPrr_QbIY";
const googleKey = process.env.GOOGLE_API_KEY;
const axios = require("axios");


const convertToObj = (keys, valuesArrays) => {
  const finalArrray = [];
  valuesArrays.forEach((arr, i) => {
    finalArrray.push(Object.assign(...keys.map((k, i) => ({ [k]: arr[i] }))));
  });
  return finalArrray;
};
const getData = async (sheetName) => {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/${sheetName}?alt=json&key=${googleKey}`;
  let res = await axios.get(url);
  const response = res.data.values;
  return response;
};
module.exports = {
  convertToObj,
  getData
};
