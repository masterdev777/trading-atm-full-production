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
      'Authorization': `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ0cmFkZWxvY2tlci1hcGkiLCJhdWQiOiJ0cmFkZWxvY2tlci1hcGktdHJhZGVycyIsInR5cGUiOiJhY2Nlc3NfdG9rZW4iLCJzdWIiOiJPU1AjNjVmNzBkZjNiZTgzMWJjNjk0MWFmNDRlIiwidWlkIjoiYmI3ZTY2ZmMtZDJlZC00M2IyLThlNjAtMDhlZTE1Mzc0ZDE1IiwiYnJhbmQiOiJPU1AiLCJob3N0IjoiZGVtby50cmFkZWxvY2tlci5jb20iLCJpYXQiOjE3MjYxNTg1NzUsImV4cCI6MTcyNjE2MjE3NX0.CyHjHogkAjTHXZl2yYtYBGlPGdhVofInLrQ3PLAljQY4rqWv9PdJCD15Sxdlm1wRi8olEbrXnrZCF6Sw0Bg7dE5qQxv_ktn5jiTfGeoZS0upJDbSHh59CO8FjJJ1-rWrTpeW7hRKibjdeW6p7usnHG6xtrXCkcPbWjZBqmrOOelLWZc9kvoV65DGWppqKdGBLOEvD1eKKbyRZM8v9pF2rUn0t-lAgfs0bv2WcvZnoVN5_XSAa1Lj1DZlqJo8QqzDm02FlLIMw07Dd-PeiybKNnAlcxRK7eMb3IHabLclqw4zpiS7czye1ZZpY7f3XWgbFoMQoC9WVG3-x_UyT6gkVg`,
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