const client = require("../../config/db/db.js");
const axios = require("axios");
const { TRADELOCKER_DEMO_BASIC_URL } = require("./tradelocker.config.js");

//This function is to get tradableInstrumentPairs and store database

const getTradableInstrumentPairs = async () => {

  const config1 = {
    method: 'get',
    url: `${TRADELOCKER_DEMO_BASIC_URL}/trade/accounts/366024/instruments`,
    headers: {
      'accept': 'application/json',
      'Authorization': `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ0cmFkZWxvY2tlci1hcGkiLCJhdWQiOiJ0cmFkZWxvY2tlci1hcGktdHJhZGVycyIsInR5cGUiOiJhY2Nlc3NfdG9rZW4iLCJzdWIiOiJPU1AjNjZkMTJkNzJmOGEwNTczMWFiZTllNmNiIiwidWlkIjoiZjE0Y2IxYmUtNDI3Ny00NjI1LWI5OGItMzZiZTc1N2UxZDUzIiwiYnJhbmQiOiJPU1AiLCJob3N0IjoiZGVtby50cmFkZWxvY2tlci5jb20iLCJpYXQiOjE3MjgwMzQyOTYsImV4cCI6MTcyODAzNzg5Nn0.EIDbAM43ruHjFjSraJcf5xgIKTjRNDxoHv_lxXLS8fuO4u9gJCjP6cYIINrjQqBbblSa9Pg1zfaeiIvHjf9x211KkzbkqgQNgbagEyh2QMd2MmtVWLTY_GLm7UmkXq_8KZxRFMfahbg_6Q8mWxkuPL8gzNlId9poN1j-Fu1zc6uVYaRUssWVgLlOwyjk_V_D4--KiFf-rAjxXM4LUpL_yvypX6YfxjXRTYtFLrYgZF-4FJ7eloIDgtpxsGXbTocqnkb8PDtVSozDMkEAzYw27KOCUytlldT4lNzFqPRaV_ZmtoJijI3uSM7S8za3NRJgKxExiLC4nX7JIOSU1878Fw`,
      'accNum': `${2}`,
      'Content-Type': 'application/json'
    }
  }
  await axios(config1).then(async (instruments) => {
    if (instruments.data.s === "ok") {
      instruments.data.d.instruments?.map(async (item) => {
        await client.query(
          `INSERT INTO tradable_instrument_pairs 
            (tradable_instrument_id, symbol) 
            VALUES ($1, $2)`,
          [
            item.tradableInstrumentId, item.name
          ]
        )
      })
    }
  })
}

getTradableInstrumentPairs();