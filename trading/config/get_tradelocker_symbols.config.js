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
        'Authorization': `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ0cmFkZWxvY2tlci1hcGkiLCJhdWQiOiJ0cmFkZWxvY2tlci1hcGktdHJhZGVycyIsInR5cGUiOiJhY2Nlc3NfdG9rZW4iLCJzdWIiOiJPU1AjNjVmNzBkZjNiZTgzMWJjNjk0MWFmNDRlIiwidWlkIjoiYmI3ZTY2ZmMtZDJlZC00M2IyLThlNjAtMDhlZTE1Mzc0ZDE1IiwiYnJhbmQiOiJPU1AiLCJob3N0IjoiZGVtby50cmFkZWxvY2tlci5jb20iLCJpYXQiOjE3MjYxNTg1NzUsImV4cCI6MTcyNjE2MjE3NX0.CyHjHogkAjTHXZl2yYtYBGlPGdhVofInLrQ3PLAljQY4rqWv9PdJCD15Sxdlm1wRi8olEbrXnrZCF6Sw0Bg7dE5qQxv_ktn5jiTfGeoZS0upJDbSHh59CO8FjJJ1-rWrTpeW7hRKibjdeW6p7usnHG6xtrXCkcPbWjZBqmrOOelLWZc9kvoV65DGWppqKdGBLOEvD1eKKbyRZM8v9pF2rUn0t-lAgfs0bv2WcvZnoVN5_XSAa1Lj1DZlqJo8QqzDm02FlLIMw07Dd-PeiybKNnAlcxRK7eMb3IHabLclqw4zpiS7czye1ZZpY7f3XWgbFoMQoC9WVG3-x_UyT6gkVg`,
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