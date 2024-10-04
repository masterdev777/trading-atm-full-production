const axios = require('axios');

const METATRADER4_BASIC_URL = "https://metatrader4-apis.ngrok.app/";
// const METATRADER4_BASIC_URL = "http://mt4.mtapi.io";

const metatrader4Axios = axios.create({
  baseURL: METATRADER4_BASIC_URL
});

module.exports = { metatrader4Axios };