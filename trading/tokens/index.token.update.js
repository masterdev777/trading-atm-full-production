const { updateMetatrader4MastersToken, updateMetatrader4CopiersToken } = require("./metatrader4.token.update");
const { updateMetatrader5MastersToken, updateMetatrader5CopiersToken } = require("./metatrader5.token.update");
const { updateTradelockerMastersToken, updateTradelockerCopiersToken } = require("./tradelocker.token.update");

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const tokenUpdate = async (callback) => {
  await updateMetatrader4MastersToken();
  await updateMetatrader4CopiersToken();

  await updateTradelockerMastersToken();
  await updateTradelockerCopiersToken();

  await updateMetatrader5MastersToken();
  await updateMetatrader5CopiersToken();

  setInterval(updateMetatrader4MastersToken, 1 * 60 * 60 * 1000);
  setInterval(updateMetatrader4CopiersToken, 1 * 60 * 60 * 1000);

  setInterval(updateMetatrader5MastersToken, 1 * 60 * 60 * 1000);
  setInterval(updateMetatrader5CopiersToken, 1 * 60 * 60 * 1000);

  setInterval(updateTradelockerMastersToken, 0.5 * 60 * 60 * 1000);
  setInterval(updateTradelockerCopiersToken, 0.5 * 60 * 60 * 1000);
  await delay(5000);
  callback();
}

module.exports = { tokenUpdate }



