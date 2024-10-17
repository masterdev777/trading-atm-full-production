const { updateBalance } = require("./balance.update");
const { getSocketInstance, socketUsers } = require("../socket/socket.js");
const { Payment } = require("./payment.js");

const paymentFunc = () => {
  const io = getSocketInstance();
  //Update Balance of Database Every 60 Seconds
  setInterval(() => updateBalance(io, socketUsers), 60 * 1000);
  //Payment
  setInterval(() => Payment(io, socketUsers, 0.01), 0.01 * 60 * 60 * 1000);
}

module.exports = { paymentFunc }
