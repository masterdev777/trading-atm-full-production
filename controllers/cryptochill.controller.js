const axios = require('axios');
const Base64 = require('js-base64').Base64;
const crypto = require('crypto');
const client = require("../config/db/db.js");
const { decryptData, encryptWithSymmetricKey } = require("../config/utils/encryptFunction.js");

const API_URL = process.env.CRYPTOCHILL_API_URL;
const API_KEY = process.env.CRYPTOCHILL_API_KEY;
const API_SECRET = process.env.CRYPTOCHILL_API_SECRET;
const PROFILE_ID = process.env.CRYPTOCHILL_PROFILE_ID;
const CALLBACK_TOKEN = process.env.CRYPTOCHILL_CALLBACK_TOKEN;

function encode_hmac(key, msg) {
  return crypto.createHmac('sha256', key).update(msg).digest('hex');
}

function cryptochill_api_request(endpoint, payload = {}, method = 'GET') {
  const request_path = '/v1/' + endpoint + '/'
  payload.request = request_path;
  payload.nonce = (new Date).getTime();

  // Encode payload to base64 format and create signature using your API_SECRET
  const encoded_payload = JSON.stringify(payload);
  const b64 = Base64.encode(encoded_payload);
  const signature = encode_hmac(API_SECRET, b64);

  // Add your API key, encoded payload and signature to following headers
  let request_headers = {
    'X-CC-KEY': API_KEY,
    'X-CC-PAYLOAD': b64,
    'X-CC-SIGNATURE': signature,
  };

  return axios({
    method: method,
    url: API_URL + request_path,
    headers: request_headers,
  });
}

//pay to our platform

exports.payCrypto = async (req, res) => {
  const decryptedData = decryptData(req.body.encrypted);
  const { type, amount } = JSON.parse(decryptedData);
  var payload = {
    "amount": amount,
    "currency": "USD",
    "kind": type,
    "profile_id": PROFILE_ID,
    "passthrough": JSON.stringify({
      "user_id": req.user.id,
    })
  }
  await cryptochill_api_request('invoices', payload, 'POST').then(function async(response) {
    console.log(response.data.result);
    const encryptResponse = encryptWithSymmetricKey(response.data.result.id);
    res.status(200).send({ encrypted: encryptResponse });
  }).catch(function (error) {
    console.log(error);
    if (error?.response) {
      const encryptedResponse = encryptWithSymmetricKey("Network Connection Error.");
      res.status(501).send({ encrypted: encryptedResponse });
    }
    else {
      const encryptedResponse = encryptWithSymmetricKey("Creating Invoice Failed.");
      res.status(501).send({ encrypted: encryptedResponse });
    }
  });
}

//withdraw from the platform

exports.withdrawCrypto = async (req, res) => {
  try {
    const decryptedData = decryptData(req.body.encrypted);
    const { type, amount, address } = JSON.parse(decryptedData);
    if (amount > req.user.balance) {
      const encryptedResponse = encryptWithSymmetricKey("Insufficient balance");
      res.status(201).send({ encrypted: encryptedResponse });
      return;
    }
    const new_date = new Date();
    var payload = {
      "profile_id": PROFILE_ID,
      "kind": type,
      "passthrough": JSON.stringify({
        "user_id": req.user.id,
        "created_at": new_date.toISOString()
      }),
      "network_fee_preset": "economy",
      "network_fee_pays": "merchant",
      "recipients": [
        {
          "amount": amount,
          "currency": "USD",
          "address": address,
          "notes": "Withdraw " + amount
        }
      ]
    }

    cryptochill_api_request('payouts', payload, 'POST').then(function (response) {
      if (response.statusText === "Created") {
        const encryptedResponse = encryptWithSymmetricKey("ok");
        res.status(200).send(encryptedResponse);
      }
      else {
        const encryptedResponse = encryptWithSymmetricKey("Withdraw Failed.");
        res.status(202).send({ encrypted: encryptedResponse });
      }
    }).catch(function (error) {
      if (error.response.data.reason === "PayoutNetworkFeeTooHigh" || error.response.data.reason === "InvalidAddress") {
        const encryptedResponse = encryptWithSymmetricKey(error.response.data.reason);
        res.status(501).send({ encrypted: encryptedResponse });
      }
      else if (error.response.data.reason === "InsufficientFunds") {
        const encryptedResponse = encryptWithSymmetricKey("Insufficient funds for this currency. Please use other currency.");
        res.status(501).send({ encrypted: encryptedResponse });
      }
      else {
        const encryptedResponse = encryptWithSymmetricKey("Withdraw Failed.");
        res.status(501).send({ encrypted: encryptedResponse });
      }
    });
  }
  catch {
    const encryptedResponse = encryptWithSymmetricKey("Withdraw Failed");
    await res.status(501).send({ encrypted: encryptedResponse });
  }
}

//CryptoChill Callback Function

exports.cryptoChillCallback = async (req, res) => {
  const payload = req.body;
  // Get signature and callback_id fields from provided data
  const signature = payload['signature'];
  const callback_id = payload['callback_id'];

  // Compare signatures
  const is_valid = signature === encode_hmac(CALLBACK_TOKEN, callback_id);

  if (!is_valid) {
    throw new Error('Failed to verify CryptoChill callback signature.');
  }
  else {
    switch (payload['callback_status']) {
      case 'transaction_pending':
        const pending_passthrough = JSON.parse(payload['transaction']['invoice']['passthrough']);
        const pending_user = await client.query(
          `SELECT * FROM users WHERE id = '${pending_passthrough.user_id}'`
        );
        if (pending_user.rowCount > 0) {
          const payment_date = payload['transaction']['created_at'];
          const new_transaction_history = {
            invoice_id: payload['transaction']['invoice']['id'],
            transaction_id: payload['transaction']['id'],
            kind: payload['transaction']['kind'],
            amount: payload['transaction']['amount']['paid']['quotes']['USD'],
            crypto_amount: payload['transaction']['amount']['paid']['amount'],
            payment_date: payment_date,
            type: 'Charge',
            status: 'pending',
            description: "Charge balance from your wallet."
          }
          await client.query(
            `UPDATE users SET transaction_history = array_append(transaction_history, $1) WHERE id = '${pending_passthrough.user_id}'`,
            [
              new_transaction_history
            ]
          )
        }
        break;
      case 'transaction_confirmed':
        console.log(payload)
        const confirmed_passthrough = JSON.parse(payload['transaction']['invoice']['passthrough']);
        const confirmed_user = await client.query(
          `SELECT * FROM users WHERE id = '${confirmed_passthrough.user_id}'`
        );
        if (confirmed_user.rowCount > 0) {
          const update_one = confirmed_user.rows[0].transaction_history?.find(item => item.transaction_id === payload['transaction']['id']);
          const new_transaction_history = {
            ...update_one,
            status: 'confirmed'
          }

          await client.query(
            `UPDATE users 
              SET transaction_history = array_remove(transaction_history, $1) 
              WHERE id = '${confirmed_passthrough.user_id}'`,
            [
              update_one
            ]
          )

          await client.query(
            `UPDATE users 
              SET transaction_history = array_append(transaction_history, $1),
              balance = balance + $2 
              WHERE id = '${confirmed_passthrough.user_id}'`,
            [
              new_transaction_history,
              new_transaction_history.amount
            ]
          )
        }
        break;
      case 'transaction_complete':
        const completed_passthrough = JSON.parse(payload['transaction']['invoice']['passthrough']);
        const complete_user = await client.query(
          `SELECT * FROM users 
            WHERE id = '${completed_passthrough.user_id}'`
        );
        if (complete_user.rowCount > 0) {
          const update_one = complete_user.rows[0].transaction_history?.find(item => item.transaction_id === payload['transaction']['id']);
          console.log(update_one, payload['transaction']['id']);
          if (update_one) {
            const new_transaction_history = {
              ...update_one,
              status: 'completed'
            }
            console.log(new_transaction_history)
            await client.query(
              `UPDATE users 
                SET transaction_history = array_remove(transaction_history, $1) 
                WHERE id = '${completed_passthrough.user_id}'`,
              [
                update_one
              ]
            )

            await client.query(
              `UPDATE users 
                SET transaction_history = array_append(transaction_history, $1)
                WHERE id = '${completed_passthrough.user_id}'`,
              [
                new_transaction_history
              ]
            )
          }
        }

        console.log('complete');
        break;
      case 'transaction_zero_conf_confirmed':
        console.log("transaction_zero_conf_confirmed");
        console.log(payload);
        break;
      case 'payout_pending':
        console.log(payload);
        const payout_passthrough = JSON.parse(payload['payout']['passthrough']);
        const payout_pending_user = await client.query(
          `SELECT * FROM users 
            WHERE id = '${payout_passthrough.user_id}'`
        );
        console.log(payload['payout']['recipients'], payload['payout']['recipients'][0])
        if (payout_pending_user.rowCount > 0) {
          const payment_date = payload['payout']['created_at'];
          const new_transaction_history = {
            transaction_id: payload['payout']['id'],
            kind: payload['payout']['kind'],
            amount: payload['payout']['recipients'][0]['amount']['requested']['amount'],
            crypto_amount: payload['payout']['amount']['total'],
            fee: payload['payout']['amount']['network_fee'],
            payment_date: payment_date,
            type: 'Withdraw',
            status: 'pending',
            description: 'Withdraw crypto to your wallet.'
          }

          await client.query(
            `UPDATE users 
              SET transaction_history = array_append(transaction_history, $1) 
              WHERE id = '${payout_passthrough.user_id}'`,
            [
              new_transaction_history
            ]
          )
        }
        break;
      case 'payout_confirmed':
        console.log(payload);
        const payout_confirmed_passthrough = JSON.parse(payload['payout']['passthrough']);
        const payout_confirmed_user = await client.query(
          `SELECT * FROM users 
            WHERE id = '${payout_confirmed_passthrough.user_id}'`
        );
        if (payout_confirmed_user.rowCount > 0) {
          console.log(payout_confirmed_user.rows[0].transaction_history);
          const update_one = payout_confirmed_user.rows[0].transaction_history?.find(item => item.transaction_id === payload['payout']['id']);
          if (update_one) {
            const new_transaction_history = {
              ...update_one,
              status: 'confirmed'
            }

            await client.query(
              `UPDATE users 
                SET transaction_history = array_remove(transaction_history, $1) 
                WHERE id = '${payout_confirmed_passthrough.user_id}'`,
              [
                update_one
              ]
            )

            await client.query(
              `UPDATE users 
                SET transaction_history = array_append(transaction_history, $1),
                balance = balance + $2 
                WHERE id = '${payout_confirmed_passthrough.user_id}'`,
              [
                new_transaction_history,
                -new_transaction_history.amount
              ]
            )
          }
        }
        break;
      case 'payout_complete':
        const payout_completed_passthrough = JSON.parse(payload['payout']['passthrough']);
        const payout_completed_user = await client.query(
          `SELECT * FROM users 
            WHERE id = '${payout_completed_passthrough.user_id}'`
        );
        if (payout_completed_user.rowCount > 0) {
          const update_one = payout_completed_user.rows[0].transaction_history?.find(item => item.transaction_id === payload['payout']['id']);
          if (update_one) {
            const new_transaction_history = {
              ...update_one,
              status: 'completed'
            }
            await client.query(
              `UPDATE users 
                SET transaction_history = array_remove(transaction_history, $1) 
                WHERE id = '${payout_completed_passthrough.user_id}'`,
              [
                update_one
              ]
            );

            await client.query(
              `UPDATE users 
                SET transaction_history = array_append(transaction_history, $1) 
                WHERE id = '${payout_completed_passthrough.user_id}'`,
              [
                new_transaction_history
              ]
            );
          }
        }
        break;
      case 'payout_failed':
        console.log(payload)
        console.log('payout failed')
        break;
    }
    await res.status(200).send("ok");
  }
}

