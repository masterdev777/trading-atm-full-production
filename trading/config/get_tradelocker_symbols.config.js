const client = require("../../config/db/db.js");
const axios = require("axios");
const { TRADELOCKER_DEMO_BASIC_URL } = require("./tradelocker.config.js");

//This function is to get tradableInstrumentPairs and store database

const getTradelockerSymbols = async () => {

  const list = await client.query(
    `SELECT * FROM tradable_instrument_pairs`
  );

  for (i = 0; i < list.rowCount; i++ ) {
    const item = list.rows[i];
    if (item.pip_value) continue;
    const config1 = {
      method: 'get',
      url: `${TRADELOCKER_DEMO_BASIC_URL}/trade/instruments/${item.tradable_instrument_id}?routeId=452`,
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ0cmFkZWxvY2tlci1hcGkiLCJhdWQiOiJ0cmFkZWxvY2tlci1hcGktdHJhZGVycyIsInR5cGUiOiJhY2Nlc3NfdG9rZW4iLCJzdWIiOiJPU1AjNjZkMTJkNzJmOGEwNTczMWFiZTllNmNiIiwidWlkIjoiZjE0Y2IxYmUtNDI3Ny00NjI1LWI5OGItMzZiZTc1N2UxZDUzIiwiYnJhbmQiOiJPU1AiLCJob3N0IjoiZGVtby50cmFkZWxvY2tlci5jb20iLCJpYXQiOjE3MjgwMzQyOTYsImV4cCI6MTcyODAzNzg5Nn0.EIDbAM43ruHjFjSraJcf5xgIKTjRNDxoHv_lxXLS8fuO4u9gJCjP6cYIINrjQqBbblSa9Pg1zfaeiIvHjf9x211KkzbkqgQNgbagEyh2QMd2MmtVWLTY_GLm7UmkXq_8KZxRFMfahbg_6Q8mWxkuPL8gzNlId9poN1j-Fu1zc6uVYaRUssWVgLlOwyjk_V_D4--KiFf-rAjxXM4LUpL_yvypX6YfxjXRTYtFLrYgZF-4FJ7eloIDgtpxsGXbTocqnkb8PDtVSozDMkEAzYw27KOCUytlldT4lNzFqPRaV_ZmtoJijI3uSM7S8za3NRJgKxExiLC4nX7JIOSU1878Fw`,
        'accNum': `${2}`,
        'Content-Type': 'application/json'
      }
    }
    await axios(config1).then(async (information) => {
      if (information.data.s === "ok") {
        await client.query(
          `UPDATE tradable_instrument_pairs 
            SET pip_value = $1 
            WHERE id = $2`,
          [
            information.data.d.tickSize[0].tickSize,
            item.id
          ]
        )
      }
    })
  }
}

getTradelockerSymbols();