const { updateBalance } = require("./balance.update");
// const { cryptoCurrencyPriceUpdate } = require("./cryptocurrency.price.update");

//Update Balance of Database Every 5 Seconds
setInterval(updateBalance, 1 * 5 * 1000);

//Update Currency Price of Database Every 2 hours 
// setInterval(cryptoCurrencyPriceUpdate, 2 * 60 * 60 * 1000);
