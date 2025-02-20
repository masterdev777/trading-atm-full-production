const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const client = require("../config/db/db.js");
const getToken = require("../config/utils/getToken.js");
const { emailExists, firstUser } = require("../config/helper.js");
const { decryptData, encryptWithSymmetricKey } = require("../config/utils/encryptFunction.js");
const jwt = require("jsonwebtoken");
const emailjs = require('@emailjs/nodejs');
const config = require("../config/config.js");
const moment = require("moment");

//Register Endpoint
exports.register = async (req, res) => {
  try {
    const decryptedData = JSON.parse(decryptData(req.body.encrypted));
    const { username, email, password } = decryptedData;
    console.log("Register ---------------------->", email, password);
    const userExists = await emailExists(email);
    const isFirstUser = await firstUser();
    const created_at = new Date();
    const formattedDate = created_at.toISOString();
    if (!userExists) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      const manageRole = isFirstUser ? "admin" : "user";
      const data = await client.query(
        `INSERT INTO users 
          (email, 
          password, 
          username, 
          created_at, 
          manage_role, 
          verify, 
          masters, 
          copiers, 
          follow_account, 
          avatar, 
          balance) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
          RETURNING id, email, password, username, created_at, manage_role, balance`,
        [
          email,
          hash,
          username,
          formattedDate,
          manageRole,
          false,
          [],
          [],
          [],
          "",
          0
        ]
      );
      if (data.rowCount === 0) res.status(201).send("Database Insert Error!");
      else {
        const token = getToken(data.rows[0]);
        const flag = await this.sendVerifyEmail(token, data.rows[0]);
        if (flag) {
          console.log(username, email, password);
          const encryptedResponse = encryptWithSymmetricKey({
            token: token,
            user: data.rows[0]
          });
          await res.status(200).send({ encrypted: encryptedResponse });
        }
        else res.status(203).send("Email Send Error!")
      }
    }
    else res.status(202).send("This user already exists!");
  }
  catch {
    await res.status(501).send("Server error");
  }
}

//Send Verify Email Function
exports.sendVerifyEmail = async (token, user) => {
  try {
    const st = token.split(".");
    const sendToken = `?firstpart=${st[0]}&secondpart=${st[1]}&thirdpart=${st[2]}`;
    const templateParams = {
      to_name: user.username,
      from_name: "TradingATM",
      recipient: user.email,
      message: config.server_url + "/user/verify/token" + sendToken
    };
    const serviceID = "service_mt4brv8";
    const templateID = "template_ukzdtpd";
    const userID = {
      publicKey: 'Dyq7ZSG0gLrFj9gZV',
      privateKey: 'TZiuJMoAKS4oBzFG63Q0a'
    }
    const response = await emailjs.send(serviceID, templateID, templateParams, userID);
    console.log(user.email, 'verify email send success', response.status, response.text);
    return true;
  }
  catch (err) {
    console.log(user.email, 'verify email send failed', err);
    return false;
  }
}

//Send Email Endpoint
exports.sendEmail = async (req, res) => {
  try {
    const user = JSON.parse(decryptData(req.body.encryptedUser));
    const flag = await this.sendVerifyEmail(req.body.token, user);
    if (flag) res.status(200).send("ok");
  }
  catch {
    res.status(501).send("failed");
  }
}

//Send Verify Code Endpoint
exports.sendVerifyCode = async (req, res) => {
  try {
    const decryptedData = JSON.parse(decryptData(req.body.encrypted));
    const { email } = decryptedData;
    const randomNumber = crypto.randomInt(100000, 1000000);
    const data = await client.query(
      `UPDATE users 
        SET verify_code = ${randomNumber} 
        WHERE email = '${email}' RETURNING *`
    )
    if (data.rowCount === 0) res.status(201).send("You are not registered. Please sign up with your email.");
    else {
      const templateParams = {
        to_name: data.rows[0].username,
        from_name: "TradingATM",
        recipient: email,
        message: randomNumber
      };
      const serviceID = "service_mt4brv8";
      const templateID = "template_0gqxe2j";
      const userID = {
        publicKey: 'Dyq7ZSG0gLrFj9gZV',
        privateKey: 'TZiuJMoAKS4oBzFG63Q0a'
      }
      const response = await emailjs.send(serviceID, templateID, templateParams, userID);
      console.log(email, 'verify code send success', response.status, response.text);
      res.status(200).send("success");
    }
  }
  catch (err) {
    console.log(email, 'verify code send failed', err);
    res.status(501).send("Server Error");
  }
}

//Check if Verify Code is correct Endpoint 
exports.checkVerifyCode = async (req, res) => {
  try {
    const decryptedData = JSON.parse(decryptData(req.body.encrypted));
    const { email, verifyCode } = decryptedData;
    const data = await client.query(
      `SELECT * FROM users 
        WHERE email = '${email}'`
    );
    if (data.rowCount === 0) res.status(201).send("Database Error");
    else {
      if (verifyCode === data.rows[0].verify_code) {
        res.status(200).send("ok");
      }
      else res.status(202).send("Verify Code Invalid");
    }
  }
  catch {
    res.status(501).send("Server Error");
  }
}

//Change Password Endpoint
exports.changePassword = async (req, res) => {
  try {
    const decryptedData = JSON.parse(decryptData(req.body.encrypted));
    const { email, password } = decryptedData;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const data = await client.query(
      `UPDATE users 
        SET password = '${hash}'  
        WHERE email = '${email}'`
    );
    if (data.rowCount === 0) res.status(201).send("Database Error");
    else {
      res.status(200).send("ok");
    }
  }
  catch {
    res.status(501).send("Server Error");
  }
}

//Get Tradelocker Accounts From Database Function
const getTradelockerAccounts = async (user) => {
  let masterIds = [];
  let copierIds = [];
  for (let i = 0; i < user.masters?.length; i++) {
    if (user.masters[i].type === "tld" || user.masters[i].type === "tll") masterIds.push(user.masters[i]);
  }
  for (let i = 0; i < user.copiers?.length; i++) {
    if (user.copiers[i].type === "tld" || user.copiers[i].type === "tll") copierIds.push(user.copiers[i]);
  }
  let accounts = [];
  for (let i = 0; i < masterIds.length; i++) {
    const masterAccName = await client.query(
      `SELECT account_id, 
        account_name, 
        type, 
        follows, 
        account_balance, 
        total_pl_amount, 
        registered_at, 
        win_count, 
        lose_count,
        avatar,
        level 
        FROM masters 
        WHERE account_id = '${masterIds[i].account_id}'`
    )
    if (masterAccName.rowCount === 0) continue;
    masterAccName.rows[0].role = "Master";
    masterAccName.rows[0].status = masterAccName.rows[0].follows.toString();
    delete masterAccName.rows[0].follows;
    accounts.push(masterAccName.rows[0]);
  }
  for (let i = 0; i < copierIds.length; i++) {
    const copierAccName = await client.query(
      `SELECT account_id, 
        account_name, 
        type, 
        status, 
        account_balance, 
        total_pl_amount, 
        registered_at, 
        win_count, 
        lose_count
        FROM copiers 
        WHERE account_id = '${copierIds[i].account_id}'`
    )
    if (copierAccName.rowCount === 0) continue;
    copierAccName.rows[0].role = "Copier";
    accounts.push(copierAccName.rows[0]);
  }
  return accounts;
}

//Get Metatrader4 Accounts From Database Function
const getMetatraderAccounts = async (user) => {
  let masterIds = [];
  let copierIds = [];
  for (let i = 0; i < user.masters?.length; i++) {
    if (user.masters[i].type === "mt4") masterIds.push(user.masters[i]);
  }
  for (let i = 0; i < user.copiers?.length; i++) {
    if (user.copiers[i].type === "mt4") copierIds.push(user.copiers[i]);
  }
  let accounts = [];
  for (let i = 0; i < masterIds.length; i++) {
    const masterAccName = await client.query(
      `SELECT account_id, 
        account_name, 
        type, 
        follows, 
        account_balance, 
        total_pl_amount, 
        registered_at, 
        win_count, 
        lose_count,
        avatar,
        level 
        FROM metatrader_masters 
        WHERE account_id = '${masterIds[i].account_id}'`
    )
    if (masterAccName.rowCount === 0) continue;
    masterAccName.rows[0].role = "Master";
    masterAccName.rows[0].status = masterAccName.rows[0].follows.toString();
    delete masterAccName.rows[0].follows;
    accounts.push(masterAccName.rows[0]);
  }
  for (let i = 0; i < copierIds.length; i++) {
    const copierAccName = await client.query(
      `SELECT 
        account_id, 
        account_name, 
        type, 
        status, 
        account_balance, 
        total_pl_amount, 
        registered_at, 
        win_count, 
        lose_count 
        FROM metatrader_copiers 
        WHERE account_id = '${copierIds[i].account_id}'`
    )
    if (copierAccName.rowCount === 0) continue;
    copierAccName.rows[0].role = "Copier";
    accounts.push(copierAccName.rows[0]);
  }
  return accounts;
}

//Get Metatrader5 Accounts From Database Function
const getMetatrader5Accounts = async (user) => {
  let masterIds = [];
  let copierIds = [];
  for (let i = 0; i < user.masters?.length; i++) {
    if (user.masters[i].type === "mt5") masterIds.push(user.masters[i]);
  }
  for (let i = 0; i < user.copiers?.length; i++) {
    if (user.copiers[i].type === "mt5") copierIds.push(user.copiers[i]);
  }
  let accounts = [];
  for (let i = 0; i < masterIds.length; i++) {
    const masterAccName = await client.query(
      `SELECT account_id, 
        account_name, 
        type, 
        follows, 
        account_balance, 
        total_pl_amount, 
        registered_at, 
        win_count, 
        lose_count,
        avatar,
        level FROM metatrader5_masters 
        WHERE account_id = '${masterIds[i].account_id}'`
    )
    if (masterAccName.rowCount === 0) continue;
    masterAccName.rows[0].role = "Master";
    masterAccName.rows[0].status = masterAccName.rows[0].follows.toString();
    delete masterAccName.rows[0].follows;
    accounts.push(masterAccName.rows[0]);
  }
  for (let i = 0; i < copierIds.length; i++) {
    const copierAccName = await client.query(
      `SELECT account_id, 
        account_name, 
        type, 
        status, 
        account_balance, 
        total_pl_amount, 
        registered_at, 
        win_count, 
        lose_count
        FROM metatrader5_copiers 
        WHERE account_id = '${copierIds[i].account_id}'`
    )
    if (copierAccName.rowCount === 0) continue;
    copierAccName.rows[0].role = "Copier";
    accounts.push(copierAccName.rows[0]);
  }
  return accounts;
}

//Get All Trading Accounts From Database Function
exports.getMyAllAccounts = async (user) => {
  let accounts = [];
  const tradelocker_accounts = await getTradelockerAccounts(user);
  accounts = accounts.concat(tradelocker_accounts);
  const metatrader_accounts = await getMetatraderAccounts(user);
  accounts = accounts.concat(metatrader_accounts);
  const metatrader5_accounts = await getMetatrader5Accounts(user);
  accounts = accounts.concat(metatrader5_accounts);
  const sortedData = accounts.sort((a, b) => {
    return new Date(a.registered_at) - new Date(b.registered_at);
  });
  return sortedData;
}

//Token Verify Endpoint
exports.tokenVerification = async (req, res) => {
  try {
    let { token } = req.body;
    jwt.verify(token, config.secret, async (err, payload) => {
      if (err) await res.status(401).send("Unauthorized.");
      else {
        const data = await client.query(
          `UPDATE users 
            SET verify = TRUE 
            WHERE id = ${payload.id} RETURNING *`
        )
        if (data.rowCount === 0) res.status(201).send("Failed.");
        else {
          const accounts = await this.getMyAllAccounts(data.rows[0]);
          const encryptedResponse = encryptWithSymmetricKey({
            token: getToken(data.rows[0]),
            user: data.rows[0],
            accounts: accounts
          });
          await res.status(200).send({ encrypted: encryptedResponse });
        }
      }
    });
  }
  catch {
    res.status(501).send("Server error");
  }
}

//User Login Endpoint
exports.login = async (req, res) => {
  try {
    const data = await client.query(
      `SELECT * 
        FROM users 
        WHERE id = ${req.user.id}`
    );
    if (data.rows[0].verify) {
      const accounts = await this.getMyAllAccounts(data.rows[0]);
      const levelToLimit = await client.query(
        `SELECT * FROM level_limit`
      );
      const copier_price = await client.query(
        `SELECT * FROM copier_plan_price 
        WHERE id = 1`
      );
      const messages = await client.query(
        `SELECT * FROM notifications
        WHERE receiver_id = $1
        AND read = $2
        ORDER BY time`,
        [
          req.user.id,
          false
        ]
      );
      const encryptedResponse = encryptWithSymmetricKey({
        token: getToken(data.rows[0]),
        user: data.rows[0],
        accounts: accounts,
        levelToLimit: levelToLimit.rows,
        copier_plan_price: copier_price.rows[0].price,
        messages: messages.rows
      });
      await res.status(200).send({ encrypted: encryptedResponse });
    }
    else {
      const token = getToken(data.rows[0]);
      const flag = await this.sendVerifyEmail(token, data.rows[0]);
      if (flag) {
        const encryptedResponse = encryptWithSymmetricKey({
          token: token,
          user: data.rows[0],
        });
        await res.status(201).send({ encrypted: encryptedResponse });
      }
    }
  }
  catch {
    res.status(501).send("Server error")
  }
}

//Login with Token when refresh website Endpoint
exports.loginWithToken = async (req, res) => {
  try {
    let { token } = req.body;
    jwt.verify(token, config.secret, async (err, payload) => {
      if (err) return res.status(401).send("Unauthorized.");
      else {
        const data = await client.query(
          `SELECT * 
            FROM users 
            WHERE id = ${payload.id}`
        );
        console.log("user id", payload.id);
        if (data.rowCount === 0) res.status(201).send("No User Exist");
        else {
          const levelToLimit = await client.query(
            `SELECT *
            FROM level_limit`
          );
          const copier_price = await client.query(
            `SELECT * FROM copier_plan_price 
            WHERE id = 1`
          );
          const messages = await client.query(
            `SELECT * FROM notifications
            WHERE receiver_id = $1
            AND read = $2
            ORDER BY time`,
            [
              payload.id,
              false
            ]
          );
          const accounts = await this.getMyAllAccounts(data.rows[0]);
          const encryptedResponse = encryptWithSymmetricKey({
            token: getToken(data.rows[0]),
            user: data.rows[0],
            accounts: accounts,
            levelToLimit: levelToLimit.rows,
            copier_plan_price: copier_price.rows[0].price,
            messages: messages.rows
          });
          await res.status(200).send({ encrypted: encryptedResponse })
        }
      }
    });
  }
  catch {
    await res.send("Server error");
  }
}

//Get User Information From Database Endpoint
exports.getUserData = async (req, res) => {
  try {
    const accounts = await this.getMyAllAccounts(req.user);
    const encryptedResponse = encryptWithSymmetricKey({
      user: req.user,
      accounts: accounts
    });
    await res.status(200).send({ encrypted: encryptedResponse })
  }
  catch {
    await res.status(501).send("Getting Data Failed!")
  }
}

//Get Account Information From Database Endpoint
exports.getAccountData = async (req, res) => {
  try {
    const decryptedData = decryptData(req.body.encrypted);
    const { type, account_id, role, days } = JSON.parse(decryptedData);
    const count = days === 1 ? 24 : days;
    const interval = days === 1 ? 1 : 24;
    if (role === "Master") {
      const table_name = (type === "tld" || type === "tll") ? "masters" : type === "mt4" ? "metatrader_masters" : "metatrader5_masters";
      const masterAcc = await client.query(
        `SELECT account_id, 
          account_name, 
          type, 
          account_balance, 
          total_pl_amount, 
          registered_at, 
          win_count, 
          lose_count, 
          master_pl, 
          registered_at,
          about_me,
          private_account 
          FROM ${table_name} 
          WHERE account_id = '${account_id}'
          AND type = '${type}'`
      );
      if (masterAcc.rowCount === 0) return;
      masterAcc.rows[0].role = "Master";
      const pl = masterAcc.rows[0].master_pl;
      delete masterAcc.rows[0].master_pl;
      let process_pl = [];
      let i = pl?.length ? pl?.length - 1 : -1;
      const last_trade_at = i > 0 ? new Date(pl[i - 1].date) : "";
      let balance = masterAcc.rows[0].account_balance;
      let maxVal = balance;
      let minVal = 0;
      let plMaxVal = 5;
      let plMinVal = -5;
      let total_pl = 0;
      let win_count = 0;
      let lose_count = 0;
      if (i >= 0) {
        maxVal = pl[i].balance;
        minVal = pl[i].balance;
        plMaxVal = pl[i].pl;
        plMinVal = pl[i].pl;
      }
      for (let d = 1; d <= count; d++) {
        let isExist = false;
        let daysAgo = new Date(Date.now() - d * interval * 60 * 60 * 1000);
        if (daysAgo < masterAcc.rows[0].registered_at) daysAgo = masterAcc.rows[0].registered_at;
        let day_pl = 0;
        for (; i >= 0; i--) {
          if (new Date(pl[i].date) > daysAgo) {
            if (!isExist) balance = pl[i].balance;
            isExist = true;
            day_pl += pl[i].pl;
            if (pl[i].pl >= 0) win_count++;
            else lose_count++;
          }
          else {
            break;
          }
        }
        process_pl.push({
          date: moment(new Date(Date.now() - (d - 1) * interval * 60 * 60 * 1000)),
          pl: day_pl,
          balance: balance
        });
        total_pl += day_pl;
        if (maxVal < balance) maxVal = balance;
        if (minVal > balance) minVal = balance;
        if (plMaxVal < day_pl) plMaxVal = day_pl;
        if (plMinVal > day_pl) plMinVal = day_pl;
        if (daysAgo === masterAcc.rows[0].registered_at) break;
        // if (i < 0) break;
      }
      const responseData = {
        data: masterAcc.rows[0],
        total_pl: total_pl,
        last_trade_at: last_trade_at,
        win_count: win_count,
        lose_count: lose_count,
        pl: process_pl.reverse(),
        maxVal: Math.max(maxVal, 5),
        minVal: minVal,
        plMaxVal: Math.max(plMaxVal, 5),
        plMinVal: Math.min(plMinVal, -5)
      }
      const encryptedResponse = encryptWithSymmetricKey(responseData);
      await res.status(200).send({ encrypted: encryptedResponse });
    }
    else {
      const table_name = (type === "tld" || type === "tll") ? "copiers" : type === "mt4" ? "metatrader_copiers" : "metatrader5_copiers";
      const copierAcc = await client.query(
        `SELECT account_id, 
          account_name, 
          type, 
          account_balance, 
          total_pl_amount, 
          registered_at, 
          win_count, 
          lose_count, 
          copier_pl FROM ${table_name}
          WHERE account_id = '${account_id}'
          AND type = '${type}'`
      )
      if (copierAcc.rowCount === 0) return;
      copierAcc.rows[0].role = "Copier";
      const pl = copierAcc.rows[0].copier_pl;
      delete copierAcc.rows[0].copier_pl;
      let process_pl = [];
      let i = pl?.length ? pl?.length - 1 : -1;
      const last_trade_at = i > 0 ? new Date(pl[i - 1].date) : "";
      let balance = copierAcc.rows[0].account_balance;
      let maxVal = balance;
      let minVal = 0;
      let plMaxVal = 5;
      let plMinVal = -5;
      let total_pl = 0;
      let win_count = 0;
      let lose_count = 0;
      if (i >= 0) {
        maxVal = pl[i].balance;
        minVal = pl[i].balance;
        plMaxVal = pl[i].pl;
        plMinVal = pl[i].pl;
      }
      for (let d = 1; d <= count; d++) {
        let isExist = false;
        let daysAgo = new Date(Date.now() - d * interval * 60 * 60 * 1000);
        if (daysAgo < copierAcc.rows[0].registered_at) daysAgo = copierAcc.rows[0].registered_at;
        let day_pl = 0;
        for (; i >= 0; i--) {
          if (new Date(pl[i].date) > daysAgo) {
            if (!isExist) balance = pl[i].balance;
            isExist = true;
            day_pl += pl[i].pl;
            if (pl[i].pl >= 0) win_count++;
            else lose_count++;
          }
          else {
            break;
          }
        }
        process_pl.push({
          date: moment(new Date(Date.now() - (d - 1) * interval * 60 * 60 * 1000)),
          pl: day_pl,
          balance: balance
        });
        total_pl += day_pl;
        if (maxVal < balance) maxVal = balance;
        if (minVal > balance) minVal = balance;
        if (plMaxVal < day_pl) plMaxVal = day_pl;
        if (plMinVal > day_pl) plMinVal = day_pl;
        daysAgo = copierAcc.rows[0].registered_at;
        // if (i < 0) break;
      }
      const responseData = {
        data: copierAcc.rows[0],
        pl: process_pl.reverse(),
        total_pl: total_pl,
        last_trade_at: last_trade_at,
        win_count: win_count,
        lose_count: lose_count,
        maxVal: Math.max(maxVal, 5),
        minVal: minVal,
        plMaxVal: Math.max(plMaxVal, 5),
        plMinVal: Math.min(plMinVal, -5)
      }
      const encryptedResponse = encryptWithSymmetricKey(responseData);
      await res.status(200).send({ encrypted: encryptedResponse });
    }
  }
  catch {
    const encryptedResponse = encryptWithSymmetricKey("Getting Account Data Failed!");
    await res.status(501).send({ encrypted: encryptedResponse });
  }
}

//Upload Profile Endpoint
exports.uploadProfile = async (req, res) => {
  try {
    const { avatarURL, encrypted_userInfo } = req.body;
    const userInfo = JSON.parse(decryptData(encrypted_userInfo));
    const updatedData = await client.query(
      `UPDATE users 
        SET avatar = $1,
        phone_number = $2,
        first_name = $3,
        last_name = $4 
        WHERE id = ${req.user.id}`,
      [
        avatarURL,
        userInfo.phone_number,
        userInfo.first_name,
        userInfo.last_name]
    );
    if (updatedData.rowCount > 0) {
      for (let i = 0; i < req.user.masters?.length; i++) {
        if (req.user.masters[i].type === "tld" || req.user.masters[i].type === "tll") {
          await client.query(
            `UPDATE masters 
              SET avatar = $1 
              WHERE account_id = '${req.user.masters[i].account_id}'`,
            [
              avatarURL
            ]
          )
        }
        if (req.user.masters[i].type === "mt4") {
          await client.query(
            `UPDATE metatrader_masters 
              SET avatar = $1 
              WHERE account_id = '${req.user.masters[i].account_id}'`,
            [
              avatarURL
            ]
          )
        }
        if (req.user.masters[i].type === "mt5") {
          await client.query(
            `UPDATE metatrader5_masters 
              SET avatar = $1 
              WHERE account_id = '${req.user.masters[i].account_id}'`,
            [
              avatarURL
            ]
          )
        }
      }
      for (let i = 0; i < req.user.copiers?.length; i++) {
        if (req.user.copiers[i].type === "tld" || req.user.copiers[i].type === "tll") {
          await client.query(
            `UPDATE copiers 
              SET avatar = $1 
              WHERE account_id = '${req.user.copiers[i].account_id}'`,
            [
              avatarURL
            ]
          )
        }
        if (req.user.copiers[i].type === "mt4") {
          await client.query(
            `UPDATE metatrader_copiers 
              SET avatar = $1 
              WHERE account_id = '${req.user.copiers[i].account_id}'`,
            [
              avatarURL
            ]
          )
        }
        if (req.user.copiers[i].type === "mt5") {
          await client.query(
            `UPDATE metatrader5_copiers 
              SET avatar = $1 
              WHERE account_id = '${req.user.copiers[i].account_id}'`,
            [
              avatarURL
            ]
          )
        }
      }
      await res.status(200).send("ok");
    }
  }
  catch {
    await res.status(501).send("Server Error!");
  }
}

//Dashboard Balance Update Endpoint
exports.updateBalance = async (req, res) => {
  try {
    const user_id = req.user.id;
    const balance = await client.query(
      `SELECT balance FROM users
      WHERE id = $1`,
      [
        user_id
      ]
    );
    const encryptResponse = encryptWithSymmetricKey({ balance: balance.rows[0].balance > 0 ? balance.rows[0].balance : 0 });
    await res.status(200).send({ encrypted: encryptResponse });
  }
  catch {
    await res.status(501).send("failed");
  }
}

//update notification

exports.updateNotification = async (req, res) => {
  try {
    const { user_id, id } = JSON.parse(decryptData(req.body.encrypted));
    await client.query(
      `UPDATE notifications
      SET read = $1
      WHERE id = $2`,
      [
        true,
        id
      ]
    );
    const data = await client.query(
      `SELECT * FROM notifications
      WHERE read = $1
      AND receiver_id = $2`,
      [
        false,
        user_id
      ]
    );
    const encryptedResponse = encryptWithSymmetricKey(data.rowCount > 0 ? data.rows : []);
    await res.status(200).send({ encrypted: encryptedResponse });
  }
  catch {
    await res.status(501).send("Server error!");
  }
}