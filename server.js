require('dotenv').config();
process.env.NODE_ENV = process.env.NODE_ENV || "development";

var express = require("./config/express"),
    passport = require("./config/passport"),
    config = require("./config/config"),
    fs = require(`fs`),
    // http = require("http");
    https = require("https");
const { startFunc } = require("./trading/masters/index.master.trading.js");
const { paymentFunc } = require("./balance/index.update.js");
const { initSocket } = require('./socket/socket.js');

var app = express();
passport();
const options = {
    key: fs.readFileSync('private-key.pem'),
    cert: fs.readFileSync('certificate.pem')
};
var server = https.createServer(options, app);
// var server = http.createServer(app);

initSocket(server);

startFunc();
paymentFunc();

server.listen(config.port, () => {
    console.log(`Server is running at https://188.166.153.100`);
});
