const client = require("../../config/db/db.js");
const axios = require("axios");
const { v5: uuidv5 } = require('uuid');
const moment = require("moment");
const { TRADELOCKER_DEMO_BASIC_URL, TRADELOCKER_LIVE_BASIC_URL, tradelockerDemoAxios, tradelockerLiveAxios } = require("../config/tradelocker.config.js");
const { metatrader4Axios } = require("../config/metatrader4.config.js");
const { metatrader5Axios } = require("../config/metatrader5.config.js");

const MY_NAMESPACE = uuidv5("https://tradingatmstg.wpenginepowered.com/", uuidv5.DNS);

//This function is to initialize the previous positions (history_positions) of masters in database before start trading

const getTradelockerMasterHistoryPositions = async (callback) => {
  console.log("getTradelockerMasterHistoryPositions", performance.now());
  const masterData = await client.query(
    `SELECT * FROM masters`
  );

  const getMasterHistoryP = masterData.rows?.map(async (master) => {
    const myAxiosRequest = master.type === "tld" ? tradelockerDemoAxios : master.type === "tll" ? tradelockerLiveAxios : "";
    await myAxiosRequest.get(`/trade/accounts/${master.account_id}/positions`, {
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${master.access_token}`,
        'accNum': `${master.acc_num}`
      }
    })
      .then(async (res) => {
        // console.log(res.data)
        const master_positions = res.data.d.positions;

        await client.query(
          `UPDATE masters 
          SET history_positions = $1
          WHERE id = '${master.id}'`,
          [
            master_positions
          ]
        );
        console.log("getTradelockerMasterHistoryPositions Success", performance.now());
      })
      .catch(async (err) => {
        console.log("getTradelocekrHistoryPositions Error", err.response?.data);
      })
  })

  await Promise.all(getMasterHistoryP);
  callback();
}

//This function is to initialize the previous orders (history_orders) of masters in database before start trading

const getTradelockerMasterHistoryOrders = async (callback) => {
  console.log("getTradelockerMasterHistoryOrders", performance.now());
  const masterData = await client.query(
    `SELECT * FROM masters`
  );
  const getMasterHistoryO = masterData.rows?.map(async (master) => {
    const myAxiosRequest = master.type === "tld" ? tradelockerDemoAxios : master.type === "tll" ? tradelockerLiveAxios : "";
    await myAxiosRequest.get(`/trade/accounts/${master.account_id}/orders`, {
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${master.access_token}`,
        'accNum': `${master.acc_num}`
      }
    })
      .then(async (res) => {
        if (res.data.s === "ok") {
          console.log("getTradelockerMasterHistoryOrders Success", performance.now());
          const orders = res.data.d.orders;
          const history_positions = master.history_positions;
          let temp_take_stop = [];
          for (let i = 0; i < history_positions?.length; i++) {
            const position = history_positions[i];
            const exist_orders = orders.filter(order => order[16] === position[0]);
            let take_profit = null;
            let stop_loss = null;
            if (exist_orders?.length > 0) {
              exist_orders.map(order => {
                if (order[5] === "limit") take_profit = order[9];
                if (order[5] === "stop") stop_loss = order[10];
              })
            }
            temp_take_stop.push({
              position_id: position[0],
              take_profit: take_profit,
              stop_loss: stop_loss
            })
          }
          await client.query(
            `UPDATE masters 
            SET take_stop = $1 
            WHERE id = '${master.id}'`,
            [
              temp_take_stop
            ]
          );
        }
      })
      .catch(async (err) => {
        console.log("Tradelocker error status", err.response.data);
      })
  })
  await Promise.all(getMasterHistoryO);
  callback();
}

//This function is to initialize the position_pair of copiers in database before start trading

const getTradelockerPositionPair = async (callback) => {
  console.log("-----------------------------------------> Start get Position Pair", performance.now());
  const copierData = await client.query(
    `SELECT position_pair, 
      account_id, 
      my_master_id,
      my_master_type, 
      acc_num, 
      access_token, 
      type FROM copiers`
  );

  for (let i = 0; i < copierData.rowCount; i++) {
    const copier = copierData.rows[i];
    if (copier.my_master_type === 'tld' || copier.my_master_type === 'tll') {
      const master = await client.query(
        `SELECT acc_num,
          access_token
          FROM masters
          WHERE account_id = $1
          AND type = $2`,
        [
          copier.my_master_id,
          copier.my_master_type
        ]
      );
      if (master.rowCount === 0) {
        return;
      }
      const myAxiosRequest = copier.type === "tld" ? tradelockerDemoAxios : copier.type === "tll" ? tradelockerLiveAxios : "";
      await myAxiosRequest.get(`/trade/accounts/${copier.account_id}/positions`, {
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${copier.access_token}`,
          'accNum': `${copier.acc_num}`
        }
      }).then(async (response) => {
        if (response.data.s !== "ok") {
          console.log("Tradelocker-master ----------> get copier accounts positions request not success");
          return;
        }
        const myAxiosRequest1 = copier.my_master_type === "tld" ? tradelockerDemoAxios : copier.my_master_type === "tll" ? tradelockerLiveAxios : "";
        await myAxiosRequest1.get(`/trade/accounts/${copier.my_master_id}/positions`, {
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${master.rows[0].access_token}`,
            'accNum': `${master.rows[0].acc_num}`
          }
        }).then(async (master_response) => {
          if (master_response.data.s !== "ok") {
            console.log("Tradelocker-master ----------> get Accounts positions not success");
            return;
          }
          await copier.position_pair?.map(async (pair) => {
            const exist_copier_position = await response.data.d.positions.find(item => item[0] === pair.copier_position_id);
            const exist_master_position = await master_response.data.d.positions.find(item => item[0] === pair.master_position_id);
            if (!exist_copier_position || !exist_master_position) {
              await client.query(
                `UPDATE copiers 
                  SET position_pair = array_remove(position_pair, $1) 
                  WHERE account_id = $2`,
                [
                  pair,
                  copier.account_id
                ]
              )
            }
          });
          console.log("Tradelocker-master ----------> Get Accounts Position Pair success", performance.now());
        }).catch((err) => {
          console.log("!!!!!!!!!!Tradelocker-master ----------> get master accounts positions request error", err.response.data);
        })
      })
    }
    if (copier.my_master_type === 'mt4') {
      const master = await client.query(
        `SELECT token 
          FROM metatrader_masters 
          WHERE account_id = $1
          AND type = $2`,
        [
          copier.my_master_id,
          copier.my_master_type
        ]
      );
      if (master.rowCount === 0) {
        console.log("getMetatrader4OrderPair ---------> Get Master Data from MT4 database Error!");
        return;
      }
      const myAxiosRequest = copier.type === "tld" ? tradelockerDemoAxios : copier.type === "tll" ? tradelockerLiveAxios : "";
      await myAxiosRequest.get(`/trade/accounts/${copier.account_id}/positions`, {
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${copier.access_token}`,
          'accNum': `${copier.acc_num}`
        }
      }).then(async (response) => {
        if (response.data.s !== "ok") {
          console.log("Tradelocker-master ----------> get copier accounts positions request not success");
          return;
        }
        await metatrader4Axios.get(`/OpenedOrders`, {
          params: {
            id: master.rows[0].token
          }
        }).then(async (master_response) => {
          if (master_response.status !== 200) {
            console.log("getMetatrader4OrderPair ------> Get Opened Orders Request Error!");
            return;
          }
          await copier.position_pair?.map(async (pair) => {
            const exist_copier_order = await response.data.d.positions.find(item => item[0] === pair.copier_position_id);
            const exist_master_order = await master_response.data.find(item => item.ticket === pair.master_order_id);
            if (!exist_copier_order || !exist_master_order) {
              await client.query(
                `UPDATE copiers 
                  SET position_pair = array_remove(position_pair, $1) 
                  WHERE account_id = '${copier.account_id}'
                  AND type = '${copier.type}'`,
                [
                  pair
                ]
              )
            }
          });
          console.log("Get Metatrader4 Order Pair success", performance.now());
        })
      }).catch(() => {
        console.log("!!!!!!!!!!Get Metatrader4 Opened Order Error.");
      })
    }
    if (copier.my_master_type === 'mt5') {
      const master = await client.query(
        `SELECT token 
          FROM metatrader5_masters 
          WHERE account_id = $1
          AND type = $2`,
        [
          copier.my_master_id,
          copier.my_master_type
        ]
      );
      if (master.rowCount === 0) {
        console.log("getMetatrader4OrderPair ---------> Get Master Data from MT4 database Error!");
        return;
      }
      const myAxiosRequest = copier.type === "tld" ? tradelockerDemoAxios : copier.type === "tll" ? tradelockerLiveAxios : "";
      await myAxiosRequest.get(`/trade/accounts/${copier.account_id}/positions`, {
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${copier.access_token}`,
          'accNum': `${copier.acc_num}`
        }
      }).then(async (response) => {
        if (response.data.s !== "ok") {
          console.log("Tradelocker-master ----------> get copier accounts positions request not success");
          return;
        }
        await metatrader5Axios.get(`/OpenedOrders`, {
          params: {
            id: master.rows[0].token
          }
        }).then(async (master_response) => {
          if (master_response.status !== 200) {
            console.log("getMetatrader4OrderPair ------> Get Opened Orders Request Error!");
            return;
          }
          await copier.position_pair?.map(async (pair) => {
            const exist_copier_order = await response.data.d.positions.find(item => item[0] === pair.copier_position_id);
            const exist_master_order = await master_response.data.find(item => item.ticket === pair.master_order_id);
            if (!exist_copier_order || !exist_master_order) {
              await client.query(
                `UPDATE copiers 
                  SET position_pair = array_remove(position_pair, $1) 
                  WHERE account_id = $2
                  AND type = '${copier.type}'`,
                [
                  pair,
                  copier.account_id
                ]
              )
            }
          });
          console.log("Get Metatrader4 Order Pair success", performance.now());
        })
      }).catch(() => {
        console.log("!!!!!!!!!!Get Metatrader4 Opened Order Error.");
      })
    }
    console.log("tradelocker my master id", copier.my_master_id)
    console.log("---------------> performance <----------------", performance.now())
  }
  //   if (copier.my_master_type === 'tld' || copier.my_master_type === 'tll') {
  //     const master = await client.query(
  //       `SELECT acc_num,
  //         access_token
  //         FROM masters
  //         WHERE account_id = $1
  //         AND type = $2`,
  //       [
  //         copier.my_master_id,
  //         copier.my_master_type
  //       ]
  //     );
  //     if (master.rowCount === 0) {
  //       return;
  //     }
  //     const myAxiosRequest = copier.type === "tld" ? tradelockerDemoAxios : copier.type === "tll" ? tradelockerLiveAxios : "";
  //     await myAxiosRequest.get(`/trade/accounts/${copier.account_id}/positions`, {
  //       headers: {
  //         'accept': 'application/json',
  //         'Authorization': `Bearer ${copier.access_token}`,
  //         'accNum': `${copier.acc_num}`
  //       }
  //     }).then(async (response) => {
  //       if (response.data.s !== "ok") {
  //         console.log("Tradelocker-master ----------> get copier accounts positions request not success");
  //         return;
  //       }
  //       const myAxiosRequest1 = copier.my_master_type === "tld" ? tradelockerDemoAxios : copier.my_master_type === "tll" ? tradelockerLiveAxios : "";
  //       await myAxiosRequest1.get(`/trade/accounts/${copier.my_master_id}/positions`, {
  //         headers: {
  //           'accept': 'application/json',
  //           'Authorization': `Bearer ${master.rows[0].access_token}`,
  //           'accNum': `${master.rows[0].acc_num}`
  //         }
  //       }).then(async (master_response) => {
  //         if (master_response.data.s !== "ok") {
  //           console.log("Tradelocker-master ----------> get Accounts positions not success");
  //           return;
  //         }
  //         const copier_positions = response.data.d.positions;
  //         let temp_data = [];
  //         await copier_positions.map((position) => {
  //           const match_position = copier.balance_pl_pairs?.find(item => item?.position_id === position[0]);
  //           if (match_position) temp_data.push(match_position);
  //         });
  //         console.log(temp_data);
  //         await client.query(
  //           `UPDATE masters 
  //           SET balance_pl_pairs = $1
  //           WHERE account_id = '${master.account_id}'
  //           AND type = '${master.type}'`,
  //           [
  //             temp_data
  //           ]
  //         );
  //         await copier.position_pair?.map(async (pair) => {
  //           const exist_copier_position = await response.data.d.positions.find(item => item[0] === pair.copier_position_id);
  //           const exist_master_position = await master_response.data.d.positions.find(item => item[0] === pair.master_position_id);
  //           if (!exist_copier_position || !exist_master_position) {
  //             await client.query(
  //               `UPDATE copiers 
  //                 SET position_pair = array_remove(position_pair, $1) 
  //                 WHERE account_id = $2`,
  //               [
  //                 pair,
  //                 copier.account_id
  //               ]
  //             )
  //           }
  //         });
  //         console.log("Tradelocker-master ----------> Get Accounts Position Pair success", performance.now());
  //       }).catch((err) => {
  //         console.log("Tradelocker-master ----------> get master accounts positions request error", err.response.data);
  //       })
  //     })
  //   }
  //   if (copier.my_master_type === 'mt4') {
  //     const master = await client.query(
  //       `SELECT token 
  //         FROM metatrader_masters 
  //         WHERE account_id = $1
  //         AND type = $2`,
  //       [
  //         copier.my_master_id,
  //         copier.my_master_type
  //       ]
  //     );
  //     if (master.rowCount === 0) {
  //       console.log("getMetatrader4OrderPair ---------> Get Master Data from MT4 database Error!");
  //       return;
  //     }
  //     const myAxiosRequest = copier.type === "tld" ? tradelockerDemoAxios : copier.type === "tll" ? tradelockerLiveAxios : "";
  //     await myAxiosRequest.get(`/trade/accounts/${copier.account_id}/positions`, {
  //       headers: {
  //         'accept': 'application/json',
  //         'Authorization': `Bearer ${copier.access_token}`,
  //         'accNum': `${copier.acc_num}`
  //       }
  //     }).then(async (response) => {
  //       if (response.data.s !== "ok") {
  //         console.log("Tradelocker-master ----------> get copier accounts positions request not success");
  //         return;
  //       }
  //       await metatrader4Axios.get(`/OpenedOrders`, {
  //         params: {
  //           id: master.rows[0].token
  //         }
  //       }).then(async (master_response) => {
  //         if (master_response.status !== 200) {
  //           console.log("getMetatrader4OrderPair ------> Get Opened Orders Request Error!");
  //           return;
  //         }
  //         const copier_positions = response.data.d.positions;
  //         let temp_data = [];
  //         await copier_positions.map((position) => {
  //           const match_position = copier.balance_pl_pairs?.find(item => item?.position_id === position[0]);
  //           if (match_position) temp_data.push(match_position);
  //         });
  //         console.log(temp_data);
  //         await copier.position_pair?.map(async (pair) => {
  //           const exist_copier_order = await response.data.d.positions.find(item => item[0] === pair.copier_position_id);
  //           const exist_master_order = await master_response.data.find(item => item.ticket === pair.master_order_id);
  //           if (!exist_copier_order || !exist_master_order) {
  //             await client.query(
  //               `UPDATE copiers 
  //                 SET position_pair = array_remove(position_pair, $1) 
  //                 WHERE account_id = '${copier.account_id}'
  //                 AND type = '${copier.type}'`,
  //               [
  //                 pair
  //               ]
  //             )
  //           }
  //         });
  //         console.log("Get Metatrader4 Order Pair success", performance.now());
  //       })
  //     }).catch(() => {
  //       console.log("Get Metatrader4 Opened Order Error.");
  //     })
  //   }
  //   if (copier.my_master_type === 'mt5') {
  //     const master = await client.query(
  //       `SELECT token 
  //         FROM metatrader5_masters 
  //         WHERE account_id = $1
  //         AND type = $2`,
  //       [
  //         copier.my_master_id,
  //         copier.my_master_type
  //       ]
  //     );
  //     if (master.rowCount === 0) {
  //       console.log("getMetatrader4OrderPair ---------> Get Master Data from MT4 database Error!");
  //       return;
  //     }
  //     const myAxiosRequest = copier.type === "tld" ? tradelockerDemoAxios : copier.type === "tll" ? tradelockerLiveAxios : "";
  //     await myAxiosRequest.get(`/trade/accounts/${copier.account_id}/positions`, {
  //       headers: {
  //         'accept': 'application/json',
  //         'Authorization': `Bearer ${copier.access_token}`,
  //         'accNum': `${copier.acc_num}`
  //       }
  //     }).then(async (response) => {
  //       if (response.data.s !== "ok") {
  //         console.log("Tradelocker-master ----------> get copier accounts positions request not success");
  //         return;
  //       }
  //       await metatrader5Axios.get(`/OpenedOrders`, {
  //         params: {
  //           id: master.rows[0].token
  //         }
  //       }).then(async (master_response) => {
  //         if (master_response.status !== 200) {
  //           console.log("getMetatrader4OrderPair ------> Get Opened Orders Request Error!");
  //           return;
  //         }
  //         const copier_positions = response.data.d.positions;
  //         let temp_data = [];
  //         await copier_positions.map((position) => {
  //           const match_position = copier.balance_pl_pairs?.find(item => item?.position_id === position[0]);
  //           if (match_position) temp_data.push(match_position);
  //         });
  //         console.log(temp_data);
  //         await copier.position_pair?.map(async (pair) => {
  //           const exist_copier_order = await response.data.d.positions.find(item => item[0] === pair.copier_position_id);
  //           const exist_master_order = await master_response.data.find(item => item.ticket === pair.master_order_id);
  //           if (!exist_copier_order || !exist_master_order) {
  //             await client.query(
  //               `UPDATE copiers 
  //                 SET position_pair = array_remove(position_pair, $1) 
  //                 WHERE account_id = $2
  //                 AND type = '${copier.type}'`,
  //               [
  //                 pair,
  //                 copier.account_id
  //               ]
  //             )
  //           }
  //         });
  //         console.log("Get Metatrader4 Order Pair success", performance.now());
  //       })
  //     }).catch(() => {
  //       console.log("Get Metatrader4 Opened Order Error.");
  //     })
  //   }
  // });
  // Promise.all(promises);
  callback();
}

let indexNum = 0;
//This function is the main function that trade by interval
//First, get all masters data from masters table of database and get all copiers corresponding to each master from tData table of database

// function getRandomNumber(min, max, criteria) {
//   return (max - min) > criteria ? Math.floor(Math.random() * criteria * 1000) / 1000 : Math.floor(Math.random() * (max - min) * 1000) / 1000 + min;
// }

const calc_nearest_int = (input_number) => {
  if (((input_number * 100) - Math.floor(input_number * 100)) >= 0.5) return (Math.floor(input_number * 100) + 1) / 100;
  else return Math.floor(input_number * 100) / 100;
}

const risk_setting_func = (master_account_balance, copier_account, opened_position, pip_value, stop_loss, take_profit) => {
  const risk_type = copier_account.risk_type;
  const follow_tp_st = copier_account.follow_tp_st;
  const force_min_max = copier_account.force_min_max;
  const risk_setting = copier_account.risk_setting;
  const copier_account_balance = copier_account.account_balance;
  let volume = parseFloat(opened_position[4]);
  switch (risk_type) {
    case 'fixed_lot':
      volume = parseFloat(opened_position[4]);
      break;
    case 'balance_multiplier':
      volume = Math.floor(((copier_account_balance * 100) / (master_account_balance * 100)) * parseFloat(opened_position[4]) * 100) / 100;
      break;
    case 'lot_multiplier':
      volume = Math.floor(parseFloat(opened_position[4]) * risk_setting) / 100;
      break;
    case 'fixed_balance_multiplier':
      volume = Math.floor((copier_account_balance * 100) / (risk_setting * 100) * parseFloat(opened_position[4]) * 100) / 100;
      break;
  }
  if (force_min_max?.lot_refine) volume = volume + parseFloat(force_min_max?.lot_refine_size);
  if (force_min_max?.force_max && force_min_max?.force_max_value < volume) volume = parseFloat(force_min_max?.force_max_value);
  if (force_min_max?.force_min && force_min_max?.force_min_value > volume) volume = parseFloat(force_min_max?.force_min_value);
  let stopLoss = 0;
  let takeProfit = 0;
  if (volume === 0) return { volume, stopLoss, takeProfit };
  if (follow_tp_st?.stop_loss) {
    if (follow_tp_st?.fixed_stop_loss) {
      if (opened_position[3] === 'sell') stopLoss = parseFloat(opened_position[5]) + parseFloat(follow_tp_st?.fixed_stop_loss_size) * pip_value;
      else stopLoss = parseFloat(opened_position[5]) - parseFloat(follow_tp_st?.fixed_stop_loss_size) * pip_value;
    }
    else {
      stopLoss = stop_loss > 0 ? (follow_tp_st?.stop_loss_refinement ? (stop_loss + parseFloat(follow_tp_st?.stop_loss_refinement_size) * pip_value) : stop_loss) : 0;
    }
  }
  if (follow_tp_st?.take_profit) {
    if (follow_tp_st?.fixed_take_profit) {
      if (opened_position[3] === 'sell') takeProfit = parseFloat(opened_position[5]) - parseFloat(follow_tp_st?.fixed_take_profit_size) * pip_value;
      else takeProfit = parseFloat(opened_position[5]) + parseFloat(follow_tp_st?.fixed_take_profit_size) * pip_value;
    }
    else {
      takeProfit = take_profit > 0 ? (follow_tp_st?.take_profit_refinement ? (take_profit + parseFloat(follow_tp_st?.take_profit_refinement_size) * pip_value) : take_profit) : 0;
    }
  }
  return { volume, stopLoss, takeProfit };
}

const calc_tp_st = (stop_loss, take_profit, follow_tp_st, pip_value) => {
  let stopLoss = 0;
  let takeProfit = 0;
  if (follow_tp_st?.stop_loss) {
    if (follow_tp_st?.fixed_stop_loss) stopLoss = parseFloat(follow_tp_st?.fixed_stop_loss_size) * pip_value;
    else {
      stopLoss = stop_loss > 0 ? (follow_tp_st?.stop_loss_refinement ? (stop_loss + parseFloat(follow_tp_st?.stop_loss_refinement_size) * pip_value) : stop_loss) : 0;
    }
  }
  if (follow_tp_st?.take_profit) {
    if (follow_tp_st?.fixed_take_profit) takeProfit = parseFloat(follow_tp_st?.fixed_take_profit_size) * pip_value;
    else {
      takeProfit = take_profit > 0 ? (follow_tp_st?.take_profit_refinement ? (take_profit + parseFloat(follow_tp_st?.take_profit_refinement_size) * pip_value) : take_profit) : 0;
    }
  }
  return { stopLoss, takeProfit };
}

const calc_volume = (master_account_balance, copier_account_balance, risk_type, risk_setting, history_order_lot, exist_order_lot) => {
  switch (risk_type) {
    case 'fixed_lot':
      volume = history_order_lot - exist_order_lot;
      break;
    case 'balance_multiplier':
      volume = Math.floor(((copier_account_balance * 100) / (master_account_balance * 100)) * (history_order_lot - exist_order_lot) * 100) / 100;
      break;
    case 'lot_multiplier':
      volume = Math.floor((history_order_lot - exist_order_lot) * risk_setting) / 100;
      break;
    case 'fixed_balance_multiplier':
      volume = Math.floor(copier_account_balance / risk_setting * 100 * (history_order_lot - exist_order_lot)) / 100;
      break;
  }
  return volume;
}

const runTradelockerTradingFunction = async (io, socketUsers) => {
  indexNum++;
  console.log(indexNum, "Tradelocker-master ----------> Start Run Trading Function", performance.now());
  //get all masters data
  const masterData = await client.query(
    `SELECT * FROM masters`
  );

  //for each master
  const promises = masterData.rows.map(async (master) => {
    //get contract data for getting copier corresponding to each master
    const contractData = await client.query(
      `SELECT * FROM contract 
        WHERE master_acc_id = $1 
        AND master_acc_type = $2`,
      [
        master.account_id,
        master.type
      ]
    );
    const master_acc_id = master.account_id;
    const master_acc_num = master.acc_num;

    const myAxiosRequest = master.type === "tld" ? tradelockerDemoAxios : master.type === "tll" ? tradelockerLiveAxios : "";
    const basic_url = master.type === "tld" ? TRADELOCKER_DEMO_BASIC_URL : master.type === "tll" ? TRADELOCKER_LIVE_BASIC_URL : "";

    //get positions of master account
    console.log(indexNum, "Tradelocker-master ----------> Send Get Account Position Request", performance.now());
    await myAxiosRequest.get(`/trade/accounts/${master_acc_id}/positions`, {
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${master.access_token}`,
        'accNum': `${master_acc_num}`
      }
    })
      .then(async (master_res) => {
        // console.log("Tradelocker-master ===================> get positions success", performance.now());
        const all_accounts = await myAxiosRequest.get(`/auth/jwt/all-accounts`, {
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${master.access_token}`
          }
        });
        const current_account = await all_accounts.data.accounts.find(acc => acc.id === master_acc_id);
        if (current_account) {
          await client.query(
            `UPDATE masters 
              SET account_balance = $1 
              WHERE id = '${master.id}'`,
            [
              parseFloat(current_account.accountBalance)
            ]
          )
        }
        if (master.follows === 0) return;
        const master_positions = master_res.data.d.positions;
        const history_positions = master.history_positions;
        // console.log("Tradelocker-master ===================> get orders start", performance.now());
        await myAxiosRequest.get(`/trade/accounts/${master_acc_id}/orders`, {
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${master.access_token}`,
            'accNum': `${master_acc_num}`
          }
        }).then((orders) => {
          if (orders.data.s !== "ok") {
            console.log("Tradelocker-master ----------> get orders failed!");
            return;
          }
          // console.log("Tradelocker-master ===================> get orders success", performance.now());
          const master_orders = orders.data.d.orders;

          const add_remove_requests = (callback) => {
            //send real time request api for getting removed position
            history_positions?.map(async (history_position) => {
              const cur_position = master_positions?.find(position => history_position[0] === position[0]);

              //if exist removed position and lot size changed position, send delete position api request
              if (!cur_position || (cur_position && cur_position[4] !== history_position[4])) {
                const database_set = async () => {
                  if (!cur_position) {
                    const take_stop = master.take_stop;
                    const removed_ts = take_stop.find(item => item.position_id === history_position[0]);
                    if (!removed_ts) {
                      console.log("Tradelocker-master ----------> removed_ts no exist");
                      return;
                    }
                    await client.query(
                      `UPDATE masters 
                      SET take_stop = array_remove(take_stop, $1) 
                      WHERE id = '${master.id}'`,
                      [
                        removed_ts
                      ]
                    );
                  }
                  const myDate = new Date();
                  const formattedDate = myDate.toISOString();
                  const pair_data = await client.query(
                    `SELECT account_balance, 
                      total_pl_amount, 
                      win_count, 
                      lose_count
                      FROM masters
                      WHERE id = '${master.id}'`
                  );
                  const pl = parseFloat(history_position[9]);
                  const account_balance = pair_data.rows[0].account_balance;
                  const lot_size = cur_position ? parseFloat(history_position[4]) - parseFloat(cur_position[4]) : parseFloat(history_position[4]);
                  const real_pl = cur_position ? (lot_size * 100) / (parseFloat(history_position[4]) * 100) * pl : pl;
                  const total_pl = pair_data.rows[0].total_pl_amount + real_pl;
                  const cur_pl = {
                    balance: account_balance,
                    pl: real_pl,
                    date: formattedDate
                  }
                  if (real_pl > 0) {
                    await client.query(
                      `UPDATE masters 
                        SET win_count = win_count + 1 
                        WHERE id = '${master.id}'`
                    )
                  }
                  else {
                    await client.query(
                      `UPDATE masters 
                        SET lose_count = lose_count + 1 
                        WHERE id = '${master.id}'`
                    )
                  }

                  await client.query(
                    `UPDATE masters 
                      SET master_pl = array_append(master_pl, $1),
                      total_pl_amount = $2
                      WHERE id = '${master.id}'`,
                    [
                      cur_pl,
                      total_pl
                    ]
                  );
                }
                database_set();
                const position_remove = async () => {
                  contractData.rows.map(async (row) => {
                    const copier_acc_id = row.copier_acc_id;
                    const copier_acc_num = row.copier_acc_num;
                    const copier_acc_type = row.copier_acc_type;
                    if (copier_acc_type === 'tld' || copier_acc_type === 'tll') {
                      const tl_copier_account = await client.query(
                        `SELECT * FROM copiers 
                          WHERE account_id = '${copier_acc_id}'`
                      )
                      const position_pairs = tl_copier_account.rows[0].position_pair;
                      const pair = position_pairs?.find(pair => pair.master_position_id === history_position[0]);

                      if (row.status === "Running") {
                        if (!pair) {
                          console.log("Tradelocker-master ----------> pair no exist");
                          return;
                        }
                        let volume = 0;
                        const copier_order = tl_copier_account.rows[0].history_positions?.find(item => item[0] === pair.copier_position_id);
                        if (cur_position) {
                          volume = calc_volume(master.account_balance,
                            tl_copier_account.rows[0].account_balance,
                            tl_copier_account.rows[0].risk_type,
                            tl_copier_account.rows[0].risk_setting,
                            parseFloat(history_position[4]),
                            parseFloat(cur_position[4])
                          );
                          if (volume === 0) return;
                        }
                        const real_qty = (copier_order && parseFloat(copier_order[4]) <= volume) ? 0 : volume;
                        console.log("tl real qty", real_qty);
                        const config = {
                          method: 'delete',
                          url: `${basic_url}/trade/positions/${pair.copier_position_id}`,
                          headers: {
                            'accept': 'application/json',
                            'Authorization': `Bearer ${tl_copier_account.rows[0].access_token}`,
                            'accNum': `${copier_acc_num}`,
                            'Content-Type': 'application/json'
                          },
                          data: {
                            "qty": parseFloat(real_qty)
                          }
                        };
                        axios(config)
                          .then(async (response) => {
                            if (response.data.s === "ok") {
                              const myDate = new Date();
                              const formattedDate = myDate.toISOString();
                              const my_secret_name = JSON.stringify({
                                time: moment(formattedDate).format('YYYY/MM/DD hh:mm:ss A'),
                                type: "close_trade",
                                account_id: tl_copier_account.rows[0].account_id,
                                user_id: tl_copier_account.rows[0].user_id,
                              });
                              const uniqueId = uuidv5(my_secret_name, MY_NAMESPACE);
                              const messages = await client.query(
                                `INSERT INTO notifications
                                (id, receiver_id, message, read, time, type)  
                                VALUES ($1, $2, $3, $4, $5, $6)
                                RETURNING *`,
                                [
                                  uniqueId,
                                  tl_copier_account.rows[0].user_id,
                                  "Tradelocker account " + tl_copier_account.rows[0].account_name + " closed " + ((real_qty > 0 ? calc_nearest_int(real_qty) : "all") + " lots of order ") + pair.copier_position_id + " at " + moment(formattedDate).format('YYYY/MM/DD hh:mm:ss A'),
                                  false,
                                  moment(formattedDate).format('YYYY/MM/DD hh:mm:ss A'),
                                  "close_trade"
                                ]
                              );
                              console.log(uniqueId, socketUsers);
                              if (socketUsers[tl_copier_account.rows[0].user_id]) {
                                io.to(tl_copier_account.rows[0].user_id).emit('notification', messages.rowCount > 0 ? messages.rows[0] : {});
                              }
                              console.log(indexNum, " Tradelocker-master -----------> Delete Position Success!");
                            }
                          })
                          .catch((err) => {
                            console.log(indexNum, " Tradelocker-master ----------> Delete Position Failed.", err);
                          });
                      }
                      else {
                        if (!cur_position && pair) {
                          await client.query(
                            `UPDATE copiers 
                              SET position_pair = array_remove(position_pair, $1) 
                              WHERE account_id = '${copier_acc_id}'`,
                            [
                              pair
                            ]
                          )
                        }
                      }
                    }
                    if (copier_acc_type === 'mt4') {
                      const mt4_copier_account = await client.query(
                        `SELECT * FROM metatrader_copiers 
                          WHERE account_id = '${copier_acc_id}'`
                      )
                      const order_pairs = mt4_copier_account.rows[0].order_pair;
                      const pair = order_pairs?.find(pair => pair.master_position_id === history_position[0]);

                      if (row.status === "Running") {
                        if (!pair) {
                          console.log("Tradelocker-master ----------> pair no exist");
                          return;
                        }
                        let volume = 0;
                        const copier_order = mt4_copier_account.rows[0].history_orders?.find(item => item.ticket === pair.copier_order_id);
                        if (cur_position) {
                          volume = calc_volume(master.account_balance,
                            mt4_copier_account.rows[0].account_balance,
                            mt4_copier_account.rows[0].risk_type,
                            mt4_copier_account.rows[0].risk_setting,
                            parseFloat(history_position[4]),
                            parseFloat(cur_position[4])
                          );
                          if (volume === 0) return;
                        }
                        const real_qty = (copier_order && parseFloat(copier_order[4]) <= volume) ? 0 : volume;
                        console.log("mt4 real qty", real_qty);
                        await metatrader4Axios.get('/OrderClose', {
                          params: {
                            id: mt4_copier_account.rows[0].token,
                            ticket: pair.copier_order_id,
                            lots: real_qty
                          }
                        }).then(async (closed_order) => {
                          if (closed_order.status !== 200) {
                            console.log("Tradelocker-master ----------> metatrader4 Order Close Error");
                            return;
                          }
                          const myDate = new Date();
                          const formattedDate = myDate.toISOString();
                          const my_secret_name = JSON.stringify({
                            time: moment(formattedDate).format('YYYY/MM/DD hh:mm:ss A'),
                            type: "close_trade",
                            account_id: mt4_copier_account.rows[0].account_id,
                            user_id: mt4_copier_account.rows[0].user_id,
                          });
                          const uniqueId = uuidv5(my_secret_name, MY_NAMESPACE);
                          const messages = await client.query(
                            `INSERT INTO notifications
                              (id, receiver_id, message, read, time, type)  
                              VALUES ($1, $2, $3, $4, $5, $6)
                              RETURNING *`,
                            [
                              uniqueId,
                              mt4_copier_account.rows[0].user_id,
                              "MT4 account " + mt4_copier_account.rows[0].account_name + " closed " + ((real_qty > 0 ? calc_nearest_int(real_qty) : "all") + " lots of order ") + pair.copier_order_id + " at " + moment(formattedDate).format('YYYY/MM/DD hh:mm:ss A'),
                              false,
                              moment(formattedDate).format('YYYY/MM/DD hh:mm:ss A'),
                              "close_trade"
                            ]
                          );
                          if (socketUsers[mt4_copier_account.rows[0].user_id]) {
                            io.to(mt4_copier_account.rows[0].user_id).emit('notification', messages.rowCount > 0 ? messages.rows[0] : {});
                          }
                          const closed_order_comment = closed_order.data.comment;
                          if (real_qty > 0 && closed_order_comment.includes("to")) {
                            const temp_split = closed_order_comment.split("#");
                            const new_order_id = parseInt(temp_split[1]);
                            await client.query(
                              `UPDATE metatrader_copiers
                                SET order_pair = array_remove(order_pair, $1)
                                WHERE account_id = '${copier_acc_id}'`,
                              [
                                pair
                              ]
                            );
                            const update_pair = {
                              master_position_id: pair.master_position_id,
                              copier_order_id: new_order_id,
                              old_copier_order_id: pair.copier_order_id,
                              lot_size: real_qty,
                            }
                            await client.query(
                              `UPDATE metatrader_copiers
                                SET order_pair = array_append(order_pair, $1)
                                WHERE account_id = '${copier_acc_id}'`,
                              [
                                update_pair
                              ]
                            );
                          }
                          console.log("Tradelocker-master ----------> close metatrader4 success", performance.now())
                        }).catch((err) => {
                          console.log("Tradelocker-master ----------> metatrader4 order close error", err);
                        })
                      }
                      else {
                        if (!cur_position && pair) {
                          await client.query(
                            `UPDATE metatrader_copiers 
                              SET order_pair = array_remove(order_pair, $1) 
                              WHERE account_id = '${copier_acc_id}'`,
                            [
                              pair
                            ]
                          )
                        }
                      }
                    }
                    if (copier_acc_type === 'mt5') {
                      const mt5_copier_account = await client.query(
                        `SELECT * FROM metatrader5_copiers 
                          WHERE account_id = '${copier_acc_id}'`
                      )
                      const order_pairs = mt5_copier_account.rows[0].order_pair;
                      const pair = order_pairs?.find(pair => pair.master_position_id === history_position[0]);

                      if (row.status === "Running") {
                        if (!pair) {
                          console.log("Tradelocker-master ----------> pair no exist");
                          return;
                        }
                        let volume = 0;

                        const copier_order = mt5_copier_account.rows[0].history_orders?.find(item => item.ticket === pair.copier_order_id);
                        if (cur_position) {
                          volume = calc_volume(master.account_balance,
                            mt5_copier_account.rows[0].account_balance,
                            mt5_copier_account.rows[0].risk_type,
                            mt5_copier_account.rows[0].risk_setting,
                            parseFloat(history_position[4]),
                            parseFloat(cur_position[4])
                          );
                          if (volume === 0) return;
                        }
                        const real_qty = (copier_order && parseFloat(copier_order[4]) <= volume) ? 0 : volume;
                        console.log("mt5 real qty", real_qty);
                        await metatrader5Axios.get('/OrderClose', {
                          params: {
                            id: mt5_copier_account.rows[0].token,
                            ticket: pair.copier_order_id,
                            lots: real_qty
                          }
                        }).then(async (close_response) => {
                          if (close_response.status !== 200) {
                            console.log("Tradelocker-master ----------> metatrader4 Order Close Error");
                            return;
                          }
                          const myDate = new Date();
                          const formattedDate = myDate.toISOString();
                          const my_secret_name = JSON.stringify({
                            time: moment(formattedDate).format('YYYY/MM/DD hh:mm:ss A'),
                            type: "close_trade",
                            account_id: mt5_copier_account.rows[0].account_id,
                            user_id: mt5_copier_account.rows[0].user_id,
                          });
                          const uniqueId = uuidv5(my_secret_name, MY_NAMESPACE);
                          const messages = await client.query(
                            `INSERT INTO notifications
                              (id, receiver_id, message, read, time, type)  
                              VALUES ($1, $2, $3, $4, $5, $6)
                              RETURNING *`,
                            [
                              uniqueId,
                              mt5_copier_account.rows[0].user_id,
                              "MT5 account " + mt5_copier_account.rows[0].account_name + " closed " + ((real_qty > 0 ? calc_nearest_int(real_qty) : "all") + " lots of order ") + pair.copier_order_id + " at " + moment(formattedDate).format('YYYY/MM/DD hh:mm:ss A'),
                              false,
                              moment(formattedDate).format('YYYY/MM/DD hh:mm:ss A'),
                              "close_trade"
                            ]
                          );
                          if (socketUsers[mt5_copier_account.rows[0].user_id]) {
                            io.to(mt5_copier_account.rows[0].user_id).emit('notification', messages.rowCount > 0 ? messages.rows[0] : {});
                          }
                          // if (real_qty > 0) return;
                          // await client.query(
                          //   `UPDATE metatrader5_copiers
                          //     SET order_pair = array_remove(order_pair, $1)
                          //     WHERE account_id = '${copier_acc_id}'
                          //     AND type = '${copier_acc_type}'`,
                          //   [
                          //     pair
                          //   ]
                          // );
                          console.log("Tradelocker-master ----------> close metatrader4 success", performance.now())
                        }).catch((err) => {
                          console.log("Tradelocker-master ----------> metatrader4 order close error", err);
                        })
                      }
                      else {
                        if (!cur_position && pair) {
                          await client.query(
                            `UPDATE metatrader5_copiers 
                              SET order_pair = array_remove(order_pair, $1) 
                              WHERE account_id = '${copier_acc_id}'`,
                            [
                              pair
                            ]
                          )
                        }
                      }
                    }
                  })
                }
                position_remove();
              }
            });

            //send real time request api for getting new position
            master_positions.map(async (current_position) => {
              const cur_position = history_positions?.find(position => current_position[0] === position[0]);
              let stop_loss = null;
              let take_profit = null;
              const set_database_master = async () => {
                const new_take_stop = {
                  position_id: current_position[0],
                  take_profit: take_profit,
                  stop_loss: stop_loss
                }
                console.log(indexNum, "Tradelocker-master ----------> new_take_stop", new_take_stop, performance.now());
                await client.query(
                  `UPDATE masters 
                    SET take_stop = array_append(take_stop, $1) 
                    WHERE id = '${master.id}'`,
                  [
                    new_take_stop
                  ]
                );
              }
              const order_function = async (callback) => {
                contractData.rows.map(async (row) => {
                  const copier_acc_id = row.copier_acc_id;
                  const copier_acc_num = row.copier_acc_num;
                  const copier_acc_type = row.copier_acc_type;
                  if (row.status === "Running") {
                    if (copier_acc_type === 'tld' || copier_acc_type === 'tll') {
                      const tl_copier_account = await client.query(
                        `SELECT * FROM copiers 
                        WHERE account_id = '${copier_acc_id}'`
                      );
                      const symbol_id = await client.query(
                        `SELECT * FROM tradable_instrument_pairs
                          WHERE tradable_instrument_id = '${parseInt(current_position[1])}'`
                      );
                      if (symbol_id.rowCount === 0) return;
                      const { volume, stopLoss, takeProfit } = risk_setting_func(master.account_balance, tl_copier_account.rows[0], current_position, symbol_id.rows[0].pip_value, stop_loss, take_profit);
                      if (volume === 0) return;
                      const config = {
                        method: 'post',
                        url: `${basic_url}/trade/accounts/${copier_acc_id}/orders`,
                        headers: {
                          'accept': 'application/json',
                          'Authorization': `Bearer ${tl_copier_account.rows[0].access_token}`,
                          'accNum': `${copier_acc_num}`,
                          'Content-Type': 'application/json'
                        },
                        data: {
                          "price": 0,
                          "qty": volume,
                          "routeId": parseInt(current_position[2]),
                          "side": current_position[3],
                          "stopLoss": stopLoss,
                          "stopLossType": "absolute",
                          "stopPrice": 0,
                          "takeProfit": takeProfit,
                          "takeProfitType": "absolute",
                          "trStopOffset": 0,
                          "tradableInstrumentId": parseInt(current_position[1]),
                          "type": "market",
                          "validity": "IOC"
                        }
                      };

                      axios(config)
                        .then(async (response) => {
                          if (response.data.s !== "ok") {
                            console.log("Tradelocker-master ----------> copier order not success");
                            return;
                          }
                          const orderId = response.data.d.orderId;
                          await myAxiosRequest.get(`/trade/accounts/${copier_acc_id}/ordersHistory?tradableInstrumentId=${parseInt(current_position[1])}`, {
                            headers: {
                              'accept': 'application/json',
                              'Authorization': `Bearer ${tl_copier_account.rows[0].access_token}`,
                              'accNum': `${copier_acc_num}`,
                            }
                          }).then(async (history_response) => {
                            if (history_response.data.s !== "ok") {
                              console.log("Tradelocker-master ----------> get ordershistory not success");
                              return;
                            }
                            const myDate = new Date();
                            const formattedDate = myDate.toISOString();
                            const my_secret_name = JSON.stringify({
                              time: moment(formattedDate).format('YYYY/MM/DD hh:mm:ss A'),
                              type: "open_trade",
                              account_id: tl_copier_account.rows[0].account_id,
                              user_id: tl_copier_account.rows[0].user_id,
                            });
                            const uniqueId = uuidv5(my_secret_name, MY_NAMESPACE);
                            const messages = await client.query(
                              `INSERT INTO notifications
                                (id, receiver_id, message, read, time, type)
                                VALUES ($1, $2, $3, $4, $5, $6)
                                RETURNING *`,
                              [
                                uniqueId,
                                tl_copier_account.rows[0].user_id,
                                "Tradelocker account " + tl_copier_account.rows[0].account_name + " opened a trade of id " + response.data.d.orderId + " at " + moment(formattedDate).format('YYYY/MM/DD hh:mm:ss A'),
                                false,
                                moment(formattedDate).format('YYYY/MM/DD hh:mm:ss A'),
                                "open_trade"
                              ]
                            );
                            console.log(socketUsers[tl_copier_account.rows[0].user_id])
                            if (socketUsers[tl_copier_account.rows[0].user_id]) {
                              io.to(tl_copier_account.rows[0].user_id).emit('notification', messages.rowCount > 0 ? messages.rows[0] : {});
                            }
                            const remove_order = history_response.data.d.ordersHistory.find(orhistory => orhistory[0] === orderId);
                            const pair = {
                              master_position_id: current_position[0],
                              copier_position_id: remove_order[16]
                            }

                            await client.query(
                              `UPDATE copiers 
                                SET position_pair = array_append(position_pair, $1) 
                                WHERE account_id = '${copier_acc_id}'`,
                              [
                                pair
                              ]
                            );
                            console.log(indexNum + " Tradelocker-master ----------> Order History Success", performance.now())
                          }).catch((err) => {
                            console.log(indexNum + " Tradelocker-master ----------> Error", err.response?.data);
                          })
                        })
                        .catch((err) => {
                          console.log(indexNum, " Tradelocker-master ----------> Before Delete Position", err.response?.data);
                        });
                    }
                    if (copier_acc_type === 'mt4') {
                      const mt4_copier_account = await client.query(
                        `SELECT * FROM metatrader_copiers 
                        WHERE account_id = '${copier_acc_id}'`
                      );
                      console.log(mt4_copier_account.rowCount)
                      if (mt4_copier_account.rowCount === 0) {
                        console.log("Tradelocker-master ----------> get copier account token from database error!");
                        return;
                      }
                      const symbol_name = await client.query(
                        `SELECT * FROM tradable_instrument_pairs
                          WHERE tradable_instrument_id = '${parseInt(current_position[1])}'`
                      );
                      await metatrader4Axios.get(`/SymbolParams`, {
                        params: {
                          id: mt4_copier_account.rows[0].token,
                          symbol: symbol_name.rows[0].symbol
                        }
                      }).then(async (info) => {
                        if (info.statusText === "OK") {
                          console.log(info.data.symbol.point);
                          const { volume, stopLoss, takeProfit } = risk_setting_func(master.account_balance, mt4_copier_account.rows[0], current_position, info.data.symbol.point, stop_loss, take_profit);
                          if (volume === 0) return;
                          await metatrader4Axios.get('/OrderSend', {
                            params: {
                              id: mt4_copier_account.rows[0].token,
                              symbol: symbol_name.rows[0].symbol,
                              operation: current_position[3],
                              volume: volume,
                              stoploss: stopLoss,
                              takeprofit: takeProfit,
                            }
                          }).then(async (order_response) => {
                            if (order_response.status === 200) {
                              const myDate = new Date();
                              const formattedDate = myDate.toISOString();
                              const my_secret_name = JSON.stringify({
                                time: moment(formattedDate).format('YYYY/MM/DD hh:mm:ss A'),
                                type: "open_trade",
                                account_id: mt4_copier_account.rows[0].account_id,
                                user_id: mt4_copier_account.rows[0].user_id,
                              });
                              const uniqueId = uuidv5(my_secret_name, MY_NAMESPACE);
                              const messages = await client.query(
                                `INSERT INTO notifications
                                (id, receiver_id, message, read, time, type)
                                VALUES ($1, $2, $3, $4, $5, $6)
                                RETURNING *`,
                                [
                                  uniqueId,
                                  mt4_copier_account.rows[0].user_id,
                                  "MT4 account " + mt4_copier_account.rows[0].account_name + " opened a trade of id " + order_response.data.ticket + " at " + moment(formattedDate).format('YYYY/MM/DD hh:mm:ss A'),
                                  false,
                                  moment(formattedDate).format('YYYY/MM/DD hh:mm:ss A'),
                                  "open_trade"
                                ]
                              );
                              if (socketUsers[mt4_copier_account.rows[0].user_id]) {
                                io.to(mt4_copier_account.rows[0].user_id).emit('notification', messages.rowCount > 0 ? messages.rows[0] : {});
                              }
                              await client.query(
                                `UPDATE metatrader_copiers
                                SET order_pair = array_append(order_pair, $1)
                                WHERE account_id = '${copier_acc_id}'`,
                                [
                                  {
                                    copier_order_id: order_response.data.ticket,
                                    master_position_id: current_position[0]
                                  }
                                ]
                              );
                              console.log("Tradelocker-master ----------> metatrader4 order success", performance.now())
                            }
                          }).catch(() => {
                            console.log("Tradelocker-master ----------> metatrader4 order send error");
                          });
                        }
                      }).then(() => {
                        console.log("Tradelocker-master ----------> metatrader4 get symbol param error");
                      })
                    }
                    if (copier_acc_type === 'mt5') {
                      const mt5_copier_account = await client.query(
                        `SELECT * FROM metatrader5_copiers 
                        WHERE account_id = '${copier_acc_id}'`
                      );
                      if (mt5_copier_account.rowCount === 0) {
                        console.log("Tradelocker-master ----------> get copier account token from database error!");
                        return;
                      }
                      const symbol_name = await client.query(
                        `SELECT * FROM tradable_instrument_pairs
                          WHERE tradable_instrument_id = '${parseInt(current_position[1])}'`
                      );
                      await metatrader5Axios.get(`/SymbolParams`, {
                        params: {
                          id: mt5_copier_account.rows[0].token,
                          symbol: symbol_name.rows[0].symbol
                        }
                      }).then(async (info) => {
                        if (info.statusText === "OK") {
                          const { volume, stopLoss, takeProfit } = risk_setting_func(master.account_balance, mt5_copier_account.rows[0], current_position, info.data.symbolInfo.points, stop_loss, take_profit);
                          if (volume === 0) return;
                          await metatrader5Axios.get('/OrderSend', {
                            params: {
                              id: mt5_copier_account.rows[0].token,
                              symbol: symbol_name.rows[0].symbol,
                              operation: current_position[3],
                              volume: volume,
                              stoploss: stopLoss,
                              takeprofit: takeProfit,
                            }
                          }).then(async (order_response) => {
                            if (order_response.status === 200) {
                              console.log(order_response.data.ticket)
                              const myDate = new Date();
                              const formattedDate = myDate.toISOString();
                              const my_secret_name = JSON.stringify({
                                time: moment(formattedDate).format('YYYY/MM/DD hh:mm:ss A'),
                                type: "open_trade",
                                account_id: mt5_copier_account.rows[0].account_id,
                                user_id: mt5_copier_account.rows[0].user_id,
                              });
                              const uniqueId = uuidv5(my_secret_name, MY_NAMESPACE);
                              const messages = await client.query(
                                `INSERT INTO notifications
                                (id, receiver_id, message, read, time, type)
                                VALUES ($1, $2, $3, $4, $5, $6)
                                RETURNING *`,
                                [
                                  uniqueId,
                                  mt5_copier_account.rows[0].user_id,
                                  "MT5 account " + mt5_copier_account.rows[0].account_name + " opened a trade of id " + order_response.data.ticket + " at " + moment(formattedDate).format('YYYY/MM/DD hh:mm:ss A'),
                                  false,
                                  moment(formattedDate).format('YYYY/MM/DD hh:mm:ss A'),
                                  "open_trade"
                                ]
                              );
                              if (socketUsers[mt5_copier_account.rows[0].user_id]) {
                                io.to(mt5_copier_account.rows[0].user_id).emit('notification', messages.rowCount > 0 ? messages.rows[0] : {});
                              }
                              await client.query(
                                `UPDATE metatrader5_copiers
                                SET order_pair = array_append(order_pair, $1)
                                WHERE account_id = '${copier_acc_id}'`,
                                [
                                  {
                                    copier_order_id: order_response.data.ticket,
                                    master_position_id: current_position[0]
                                  }
                                ]
                              );
                              console.log("Tradelocker-master ----------> metatrader5 order success", performance.now())
                            }
                          }).catch(() => {
                            console.log("Tradelocker-master ----------> metatrader5 order send error");
                          });
                        }
                      }).catch(() => {
                        console.log("Tradelocker-master ------------> metatrader5 get symbol param error");
                      })
                    }
                  }

                })
                callback();
              }
              const order_modify = async (stop_loss_flag, take_profit_flag, callback) => {
                contractData.rows.map(async (row) => {
                  const copier_acc_id = row.copier_acc_id;
                  const copier_acc_num = row.copier_acc_num;
                  const copier_acc_type = row.copier_acc_type;
                  if (row.status === "Running") {
                    if (copier_acc_type === 'tld' || copier_acc_type === 'tll') {
                      const tl_copier_account = await client.query(
                        `SELECT * FROM copiers 
                          WHERE account_id = '${copier_acc_id}'`
                      );
                      const follow_tp_st = tl_copier_account.rows[0].follow_tp_st;
                      const symbol_id = await client.query(
                        `SELECT * FROM tradable_instrument_pairs
                          WHERE tradable_instrument_id = '${parseInt(current_position[1])}'`
                      );
                      const { stopLoss, takeProfit } = calc_tp_st(stop_loss, take_profit, follow_tp_st, symbol_id.rows[0].pip_value);
                      const position_pairs = tl_copier_account.rows[0].position_pair;
                      const pair = position_pairs?.find(pair => pair.master_position_id === current_position[0]);
                      if (!pair) return;
                      let data = {};
                      if (stop_loss_flag && take_profit_flag) data = {
                        "stopLoss": stopLoss,
                        "takeProfit": takeProfit
                      }
                      if (stop_loss_flag && !take_profit_flag) data = {
                        "stopLoss": stopLoss,
                      }
                      if (!stop_loss_flag && take_profit_flag) data = {
                        "takeProfit": takeProfit
                      }
                      const config = {
                        method: 'patch',
                        url: `${basic_url}/trade/positions/${pair.copier_position_id}`,
                        headers: {
                          'accept': 'application/json',
                          'Authorization': `Bearer ${tl_copier_account.rows[0].access_token}`,
                          'accNum': `${copier_acc_num}`,
                          'Content-Type': 'application/json'
                        },
                        data: data
                      };
                      axios(config)
                        .then(async (res) => {
                          if (res.data.s === 'ok') {
                            const myDate = new Date();
                            const formattedDate = myDate.toISOString();
                            const my_secret_name = JSON.stringify({
                              time: moment(formattedDate).format('YYYY/MM/DD hh:mm:ss A'),
                              type: "modify_trade",
                              account_id: tl_copier_account.rows[0].account_id,
                              user_id: tl_copier_account.rows[0].user_id,
                            });
                            const uniqueId = uuidv5(my_secret_name, MY_NAMESPACE);
                            const messages = await client.query(
                              `INSERT INTO notifications
                              (id, receiver_id, message, read, time, type)
                              VALUES ($1, $2, $3, $4, $5, $6)
                              RETURNING *`,
                              [
                                uniqueId,
                                tl_copier_account.rows[0].user_id,
                                "Tradelocker account " + tl_copier_account.rows[0].account_name + " modified stop loss or take profit of order " + pair.copier_position_id + " at " + moment(formattedDate).format('YYYY/MM/DD hh:mm:ss A'),
                                false,
                                moment(formattedDate).format('YYYY/MM/DD hh:mm:ss A'),
                                "modify_trade"
                              ]
                            );
                            if (socketUsers[tl_copier_account.rows[0].user_id]) {
                              io.to(tl_copier_account.rows[0].user_id).emit('notification', messages.rowCount > 0 ? messages.rows[0] : {});
                            }
                            console.log(indexNum + " Tradelocker-master ----------> Modify Position Success", performance.now());
                          }
                        })
                        .catch(async (err) => {
                          console.log(indexNum, " Modify Position Error", err.response?.data);
                        });
                    }
                    if (copier_acc_type === 'mt4') {
                      const mt4_copier_account = await client.query(
                        `SELECT * FROM metatrader_copiers 
                          WHERE account_id = '${copier_acc_id}'`
                      );
                      if (mt4_copier_account.rowCount === 0) {
                        console.log("Tradelocker-master ----------> get copier account token from database error!");
                        return;
                      }
                      const follow_tp_st = mt4_copier_account.rows[0].follow_tp_st;
                      const symbol_name = await client.query(
                        `SELECT * FROM tradable_instrument_pairs
                          WHERE tradable_instrument_id = '${parseInt(current_position[1])}'`
                      );
                      await metatrader4Axios.get(`/SymbolParams`, {
                        params: {
                          id: mt4_copier_account.rows[0].token,
                          symbol: symbol_name.rows[0].symbol
                        }
                      }).then(async (info) => {
                        if (info.statusText === "OK") {
                          console.log(info.data.symbol.point);
                          const { stopLoss, takeProfit } = calc_tp_st(stop_loss, take_profit, follow_tp_st, info.data.symbol.point);

                          const order_pairs = mt4_copier_account.rows[0].order_pair;
                          const pair = order_pairs?.find(pair => pair.master_position_id === current_position[0]);

                          const prev_copier_order = mt4_copier_account.rows[0].history_orders?.find(item => item.ticket === pair.copier_order_id);
                          let prev_stop_loss = 0;
                          let prev_take_profit = 0;
                          if (prev_copier_order) {
                            prev_stop_loss = prev_copier_order.stopLoss;
                            prev_take_profit = prev_copier_order.takeProfit;
                          }
                          if (!pair) return;
                          let data = {};
                          if (stop_loss_flag && take_profit_flag) data = {
                            id: mt4_copier_account.rows[0].token,
                            ticket: pair.copier_order_id,
                            stoploss: stopLoss,
                            takeprofit: takeProfit
                          }
                          if (stop_loss_flag && !take_profit_flag) data = {
                            id: mt4_copier_account.rows[0].token,
                            ticket: pair.copier_order_id,
                            stoploss: stopLoss,
                            takeprofit: prev_take_profit
                          }
                          if (!stop_loss_flag && take_profit_flag) data = {
                            id: mt4_copier_account.rows[0].token,
                            ticket: pair.copier_order_id,
                            stoploss: prev_stop_loss,
                            takeprofit: takeProfit
                          }
                          console.log("data", data);
                          await metatrader4Axios.get('/OrderModify', {
                            params: data
                          }).then(async (modify_response) => {
                            if (modify_response.status === 200) {
                              const myDate = new Date();
                              const formattedDate = myDate.toISOString();
                              const my_secret_name = JSON.stringify({
                                time: moment(formattedDate).format('YYYY/MM/DD hh:mm:ss A'),
                                type: "modify_trade",
                                account_id: mt4_copier_account.rows[0].account_id,
                                user_id: mt4_copier_account.rows[0].user_id,
                              });
                              const uniqueId = uuidv5(my_secret_name, MY_NAMESPACE);
                              const messages = await client.query(
                                `INSERT INTO notifications
                              (id, receiver_id, message, read, time, type)
                              VALUES ($1, $2, $3, $4, $5, $6)
                              RETURNING *`,
                                [
                                  uniqueId,
                                  mt4_copier_account.rows[0].user_id,
                                  "Mt4 account " + mt4_copier_account.rows[0].account_name + " modified stop loss or take profit of order " + pair.copier_order_id + " at " + moment(formattedDate).format('YYYY/MM/DD hh:mm:ss A'),
                                  false,
                                  moment(formattedDate).format('YYYY/MM/DD hh:mm:ss A'),
                                  "modify_trade"
                                ]
                              );
                              if (socketUsers[mt4_copier_account.rows[0].user_id]) {
                                io.to(mt4_copier_account.rows[0].user_id).emit('notification', messages.rowCount > 0 ? messages.rows[0] : {});
                              }
                              console.log("Tradelocker-master ----------> metatrader4 modify success", performance.now());
                            }
                          }).catch(() => {
                            console.log("Tradelocker-master ----------> metatrader4 modify error");
                          })
                        }
                      }).catch(() => {
                        console.log("Tradelocker-master ---------> metatrader4 get symbol param error");
                      })
                    }
                    if (copier_acc_type === 'mt5') {
                      const mt5_copier_account = await client.query(
                        `SELECT * FROM metatrader5_copiers 
                          WHERE account_id = '${copier_acc_id}'`
                      );
                      if (mt5_copier_account.rowCount === 0) {
                        console.log("Tradelocker-master ----------> get copier account token from database error!");
                        return;
                      }
                      const follow_tp_st = mt5_copier_account.rows[0].follow_tp_st;
                      const symbol_name = await client.query(
                        `SELECT * FROM tradable_instrument_pairs
                          WHERE tradable_instrument_id = '${parseInt(current_position[1])}'`
                      );
                      await metatrader5Axios.get(`/SymbolParams`, {
                        params: {
                          id: mt5_copier_account.rows[0].token,
                          symbol: symbol_name.rows[0].symbol
                        }
                      }).then(async (info) => {
                        if (info.statusText === "OK") {
                          console.log(info.data.symbolInfo.points);
                          const { stopLoss, takeProfit } = calc_tp_st(stop_loss, take_profit, follow_tp_st, info.data.symbolInfo.points);
                          const order_pairs = mt5_copier_account.rows[0].order_pair;
                          const pair = order_pairs?.find(pair => pair.master_position_id === current_position[0]);

                          const prev_copier_order = mt5_copier_account.rows[0].history_orders?.find(item => item.ticket === pair.copier_order_id);
                          let prev_stop_loss = 0;
                          let prev_take_profit = 0;
                          if (prev_copier_order) {
                            prev_stop_loss = prev_copier_order.stopLoss;
                            prev_take_profit = prev_copier_order.takeProfit;
                          }
                          if (!pair) return;
                          let data = {};
                          if (stop_loss_flag && take_profit_flag) data = {
                            id: mt5_copier_account.rows[0].token,
                            ticket: pair.copier_order_id,
                            stoploss: stopLoss,
                            takeprofit: takeProfit
                          }
                          if (stop_loss_flag && !take_profit_flag) data = {
                            id: mt5_copier_account.rows[0].token,
                            ticket: pair.copier_order_id,
                            stoploss: stopLoss,
                            takeprofit: prev_take_profit
                          }
                          if (!stop_loss_flag && take_profit_flag) data = {
                            id: mt5_copier_account.rows[0].token,
                            ticket: pair.copier_order_id,
                            stoploss: prev_stop_loss,
                            takeprofit: takeProfit
                          }

                          await metatrader5Axios.get('/OrderModify', {
                            params: data
                          }).then(async (modify_response) => {
                            if (modify_response.status === 200) {
                              const myDate = new Date();
                              const formattedDate = myDate.toISOString();
                              const my_secret_name = JSON.stringify({
                                time: moment(formattedDate).format('YYYY/MM/DD hh:mm:ss A'),
                                type: "modify_trade",
                                account_id: mt5_copier_account.rows[0].account_id,
                                user_id: mt5_copier_account.rows[0].user_id,
                              });
                              const uniqueId = uuidv5(my_secret_name, MY_NAMESPACE);
                              const messages = await client.query(
                                `INSERT INTO notifications
                                (id, receiver_id, message, read, time, type)
                                VALUES ($1, $2, $3, $4, $5, $6)
                                RETURNING *`,
                                [
                                  uniqueId,
                                  mt5_copier_account.rows[0].user_id,
                                  "Mt4 account " + mt5_copier_account.rows[0].account_name + " modified stop loss or take profit of order " + pair.copier_order_id + " at " + moment(formattedDate).format('YYYY/MM/DD hh:mm:ss A'),
                                  false,
                                  moment(formattedDate).format('YYYY/MM/DD hh:mm:ss A'),
                                  "modify_trade"
                                ]
                              );
                              if (socketUsers[mt5_copier_account.rows[0].user_id]) {
                                io.to(mt5_copier_account.rows[0].user_id).emit('notification', messages.rowCount > 0 ? messages.rows[0] : {});
                              }
                              console.log("Tradelocker-master ----------> metatrader5 modify success", performance.now());
                            }
                          }).catch((err) => {
                            console.log("Tradelocker-master ----------> metatrader5 modify error", err);
                          })
                        }
                      }).catch(() => {
                        console.log("Tradelocker-master ----------> metatrader5 get symbol param error");
                      })
                    }
                  }

                })
                callback();
              }
              if (current_position[6] || current_position[7]) {

                const take_stop = master.take_stop;
                const one_take_stop = take_stop?.find(item => item.position_id === current_position[0]);
                let stop_loss_flag = false;
                let take_profit_flag = false;
                if (current_position[6]) {
                  const stop_loss_my_order = master_orders?.find(order => order[0] === current_position[6]);
                  if (stop_loss_my_order) {
                    stop_loss = parseFloat(stop_loss_my_order[10]);
                    if (one_take_stop && stop_loss !== parseFloat(one_take_stop.stop_loss)) stop_loss_flag = true;
                  }
                }
                if (current_position[7]) {
                  const take_profit_my_order = master_orders?.find(order => order[0] === current_position[7]);
                  if (take_profit_my_order) {
                    take_profit = parseFloat(take_profit_my_order[9]);
                    if (one_take_stop && take_profit !== parseFloat(one_take_stop.take_profit)) take_profit_flag = true;
                  }
                }

                if (!one_take_stop) {
                  order_function(function () {
                    set_database_master();
                  })
                }
                else {
                  if (!stop_loss_flag && !take_profit_flag) return;
                  const take_stop_update_func = async () => {
                    await client.query(
                      `UPDATE masters 
                        SET take_stop = array_remove(take_stop, $1) 
                        WHERE id = '${master.id}'`,
                      [
                        one_take_stop
                      ]
                    );
                    const new_take_stop = {
                      position_id: current_position[0],
                      take_profit: take_profit,
                      stop_loss: stop_loss
                    }
                    console.log("new take stop", new_take_stop);
                    await client.query(
                      `UPDATE masters 
                        SET take_stop = array_append(take_stop, $1) 
                        WHERE id = '${master.id}'`,
                      [
                        new_take_stop
                      ]
                    );
                  }
                  order_modify(
                    stop_loss_flag,
                    take_profit_flag,
                    function () {
                      take_stop_update_func();
                    })
                }

              }
              else {
                if (!cur_position) {
                  order_function(function () {
                    set_database_master();
                  });
                }
              }
            });
            callback();
          }

          const history_position_set = async () => {
            await client.query(
              `UPDATE masters 
                SET history_positions = $1 
                WHERE id = '${master.id}'`,
              [
                master_positions
              ]
            );
          }

          add_remove_requests(function () {
            history_position_set();
          })
        }).catch((err) => {
          console.log("Tradelocker-master -----------> get orders error!", err.response?.data)
        })

      })
      .catch(async (err) => {
        console.log(indexNum, "Tradelocker-master ----------> error status2", err.response?.data);
      })
  })
  await Promise.all(promises);
  // setTimeout(runTradingFunction, 3000);
};

module.exports = { getTradelockerMasterHistoryPositions, getTradelockerMasterHistoryOrders, getTradelockerPositionPair, runTradelockerTradingFunction };
