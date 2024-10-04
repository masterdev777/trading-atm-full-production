const client = require("../../config/db/db.js");
const axios = require("axios");
const { metatrader4Axios } = require("../config/metatrader4.config.js");
const { metatrader5Axios } = require("../config/metatrader5.config.js");
const { TRADELOCKER_DEMO_BASIC_URL, TRADELOCKER_LIVE_BASIC_URL, tradelockerDemoAxios, tradelockerLiveAxios } = require("../config/tradelocker.config.js");

//This function is to initialize the previous positions (history_positions) of metatrader_masters in database before start trading

const getMetatrader5MasterHistoryOrders = async (callback) => {
  console.log("getMetatrader5MasterHistoryOrders ---------> Start", performance.now());
  const masterData = await client.query(
    `SELECT * FROM metatrader5_masters`
  );

  const getMasterHistoryP = masterData.rows?.map(async (master) => {
    await metatrader5Axios.get('/OpenedOrders', {
      params: {
        id: master.token
      }
    }).then(async (res) => {
      if (res.status !== 200) {
        console.log("getMetatrader5MasterHistoryOrders -------------> get Opened Orders Request Error", res.data);
        return;
      }
      const master_orders = res.data;
      await client.query(
        `UPDATE metatrader5_masters 
          SET history_orders = $1
          WHERE id = '${master.id}'`,
        [
          master_orders
        ]
      );
      console.log("getMetatrader5MasterHistoryOrders ------------> get Opened Orders Success", performance.now());
    }).catch((err) => {
      console.log("getMetatrader5MasterHistoryOrders -------------> get Opened Orders Error", err.data);
    })
  })
  await Promise.all(getMasterHistoryP);
  callback();
}

//This function is to initialize the order_pair of copiers in database before start trading

const getMetatrader5OrderPair = async (callback) => {
  console.log("getMetatrader5OrderPair --------> Start get Order Pair", performance.now());
  const copierData = await client.query(
    `SELECT id,
      order_pair, 
      account_id, 
      my_master_id, 
      my_master_type, 
      token, 
      type FROM metatrader5_copiers`
  );

  for (let i = 0; i < copierData.rowCount; i++) {
    const copier = copierData.rows[i];
    if (copier.my_master_type === 'mt5') {
      const master = await client.query(
        `SELECT token 
          FROM metatrader5_masters 
          WHERE account_id = $1`,
        [
          copier.my_master_id,
        ]
      );
      if (master.rowCount === 0) {
        console.log("getMetatrader5OrderPair ---------> Get Master Data from database Error!");
        return;
      }
      await metatrader5Axios.get(`/OpenedOrders`, {
        params: {
          id: copier.token
        }
      }).then(async (response) => {
        if (response.status !== 200) {
          console.log("getMetatrader5OrderPair ------> Get Opened Orders Request Error!");
        }
        await metatrader5Axios.get(`/OpenedOrders`, {
          params: {
            id: master.rows[0].token
          }
        }).then(async (master_response) => {
          if (master_response.status !== 200) {
            console.log("getMetatrader5OrderPair ------> Get Opened Orders Request Error!");
            return;
          }
          await copier.order_pair?.map(async (pair) => {
            const exist_copier_order = await response.data.find(item => item.ticket === pair.copier_order_id);
            const exist_master_order = await master_response.data.find(item => item.ticket === pair.master_order_id);
            if (!exist_copier_order || !exist_master_order) {
              await client.query(
                `UPDATE metatrader5_copiers 
                  SET order_pair = array_remove(order_pair, $1) 
                  WHERE id = $2`,
                [
                  pair,
                  copier.id
                ]
              )
            }
          });
          console.log("Get Metatrader5 Order Pair success", performance.now());
        })
      }).catch(() => {
        console.log("!!!!!!!!!!!Get Metatrader5 Opened Order Error.");
      })
    }
    if (copier.my_master_type === 'mt4') {
      const master = await client.query(
        `SELECT token 
          FROM metatrader_masters 
          WHERE account_id = $1`,
        [
          copier.my_master_id,
        ]
      );
      if (master.rowCount === 0) {
        console.log("getMetatrader5OrderPair ---------> Get Master Data from database Error!");
        return;
      }
      await metatrader5Axios.get(`/OpenedOrders`, {
        params: {
          id: copier.token
        }
      }).then(async (response) => {
        if (response.status !== 200) {
          console.log("getMetatrader5OrderPair ------> Get Opened Orders Request Error!");
        }
        await metatrader4Axios.get(`/OpenedOrders`, {
          params: {
            id: master.rows[0].token
          }
        }).then(async (master_response) => {
          if (master_response.status !== 200) {
            console.log("getMetatrader5OrderPair ------> Get Opened Orders Request Error!");
            return;
          }
          await copier.order_pair?.map(async (pair) => {
            const exist_copier_order = await response.data.find(item => item.ticket === pair.copier_order_id);
            const exist_master_order = await master_response.data.find(item => item.ticket === pair.master_order_id);
            if (!exist_copier_order || !exist_master_order) {
              await client.query(
                `UPDATE metatrader5_copiers 
                  SET order_pair = array_remove(order_pair, $1) 
                  WHERE id = $2`,
                [
                  pair,
                  copier.id
                ]
              )
            }
          });
          console.log("Get Metatrader5 Order Pair success", performance.now());
        })
      }).catch(() => {
        console.log("!!!!!!!!!!!Get Metatrader5 Opened Order Error.");
      })
    }
    if (copier.my_master_type === 'tld' || copier.my_master_type === 'tll') {
      const master = await client.query(
        `SELECT acc_num,
          access_token
          FROM masters
          WHERE account_id = $1`,
        [
          copier.my_master_id
        ]
      );
      if (master.rowCount === 0) {
        return;
      }
      await metatrader5Axios.get(`/OpenedOrders`, {
        params: {
          id: copier.token
        }
      }).then(async (response) => {
        if (response.status !== 200) {
          console.log("getMetatrader5OrderPair ------> Get Opened Orders Request Error!");
        }
        const myAxiosRequest = copier.my_master_type === "tld" ? tradelockerDemoAxios : copier.my_master_type === "tll" ? tradelockerLiveAxios : "";
        await myAxiosRequest.get(`/trade/accounts/${copier.my_master_id}/positions`, {
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${master.rows[0].access_token}`,
            'accNum': `${master.rows[0].acc_num}`
          }
        }).then(async (master_response) => {
          if (master_response.data.s !== "ok") {
            console.log("getMetatrader5OrderPair ----------> get Accounts positions not success");
            return;
          }
          await copier.order_pair?.map(async (pair) => {
            const exist_copier_position = await response.data.find(item => item.ticket === pair.copier_order_id);
            const exist_master_position = await master_response.data.d.positions.find(item => item[0] === pair.master_position_id);
            if (!exist_copier_position || !exist_master_position) {
              await client.query(
                `UPDATE metatrader5_copiers 
                  SET order_pair = array_remove(order_pair, $1)
                  WHERE id = $2`,
                [
                  pair,
                  copier.id
                ]
              )
            }
          });
          console.log("getMetatrader5OrderPair ----------> Get Accounts Position Pair success", performance.now());
        }).catch((err) => {
          console.log("!!!!!!!!!!getMetatrader5OrderPair ----------> get master accounts positions request error", err.response);
        })
      })
    }
    console.log("mt5 my master id", copier.my_master_id)
    console.log("---------------> performance <----------------", performance.now())
  }
  callback();
}

let indexNum = 0;
//This function is the main function that trade by interval
//First, get all masters data from masters table of database and get all copiers corresponding to each master from tData table of database

function getRandomNumber(min, max, criteria) {
  return (max - min) > criteria ? Math.floor(Math.random() * criteria * 1000) / 1000 : Math.floor(Math.random() * (max - min) * 1000) / 1000 + min;
}

/* functions being used when trading */

//this function is for risk setting when order position

const risk_setting_func = (master_account_balance, copier_account, opened_order, pip_value) => {
  const risk_type = copier_account.risk_type;
  const follow_tp_st = copier_account.follow_tp_st;
  const force_min_max = copier_account.force_min_max;
  const risk_setting = copier_account.risk_setting;
  const copier_account_balance = copier_account.account_balance;
  let volume = opened_order.lots;
  switch (risk_type) {
    case 'fixed_lot':
      volume = opened_order.lots;
      break;
    case 'balance_multiplier':
      volume = Math.floor(((copier_account_balance * 100) / (master_account_balance * 100)) * opened_order.lots * 100) / 100;
      break;
    case 'lot_multiplier':
      volume = Math.floor(opened_order.lots * risk_setting) / 100;
      break;
    case 'fixed_balance_multiplier':
      volume = Math.floor((copier_account_balance * 100) / (risk_setting * 100) * opened_order.lots * 100) / 100;
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
      stopLoss = opened_order.stopLoss > 0 ? (follow_tp_st?.stop_loss_refinement ? (opened_order.stopLoss + parseFloat(follow_tp_st?.stop_loss_refinement_size) * pip_value) : opened_order.stopLoss) : 0;
    }
  }
  if (follow_tp_st?.take_profit) {
    if (follow_tp_st?.fixed_take_profit) {
      if (opened_position[3] === 'sell') takeProfit = parseFloat(opened_position[5]) - parseFloat(follow_tp_st?.fixed_take_profit_size) * pip_value;
      else takeProfit = parseFloat(opened_position[5]) + parseFloat(follow_tp_st?.fixed_take_profit_size) * pip_value;
    }
    else {
      takeProfit = opened_order.takeProfit > 0 ? (follow_tp_st?.take_profit_refinement ? (opened_order.takeProfit + parseFloat(follow_tp_st?.take_profit_refinement_size) * pip_value) : opened_order.takeProfit) : 0;
    }
  }
  return { volume, stopLoss, takeProfit };
}

const calc_tp_st = (follow_tp_st, exist_order, pip_value) => {
  let stopLoss = 0;
  let takeProfit = 0;
  if (follow_tp_st?.stop_loss) {
    if (follow_tp_st?.fixed_stop_loss) stopLoss = parseFloat(follow_tp_st?.fixed_stop_loss_size) * pip_value;
    else {
      stopLoss = exist_order.stopLoss > 0 ? (follow_tp_st?.stop_loss_refinement ? (exist_order.stopLoss + parseFloat(follow_tp_st?.stop_loss_refinement_size) * pip_value) : exist_order.stopLoss) : 0;
    }
  };
  if (follow_tp_st?.take_profit) {
    if (follow_tp_st?.fixed_take_profit) takeProfit = parseFloat(follow_tp_st?.fixed_take_profit_size) * pip_value;
    else {
      takeProfit = exist_order.takeProfit > 0 ? (follow_tp_st?.take_profit_refinement ? (exist_order.takeProfit + parseFloat(follow_tp_st?.take_profit_refinement_size) * pip_value) : exist_order.takeProfit) : 0;
    }
  };
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

const runMetatrader5TradingFunction = async () => {
  indexNum++;
  console.log(indexNum, "metatrader5-master ----------> Start Run Trading Function", performance.now());
  //get all masters data
  const masterData = await client.query(
    `SELECT * FROM metatrader5_masters`
  );

  //for each master
  const promises = masterData.rows.map(async (master) => {
    const contractData = await client.query(
      `SELECT * FROM contract 
        WHERE master_acc_id = $1 
        AND master_acc_type = $2`,
      [
        master.account_id,
        master.type
      ]
    );

    await metatrader5Axios.get('/CheckConnect', {
      params: {
        id: master.token
      }
    }).then(async (isConnected) => {

      if (isConnected.status !== 200) {
        console.log("metatrader5-master ----------> connection to server error");
        return;
      }
      await metatrader5Axios.get('/AccountSummary', {
        params: {
          id: master.token
        }
      }).then(async (summary) => {
        if (summary.status !== 200) {
          console.log("metatrader5-master ----------> get Account Summary Request Error");
          return;
        }
        await client.query(
          `UPDATE metatrader5_masters
            SET account_balance = $1,
            account_profit = $2,
            account_margin = $3,
            prev_account_margin = account_margin
            WHERE id = '${master.id}'`,
          [
            summary.data.balance,
            summary.data.profit,
            summary.data.margin
          ]
        );
      }).catch(() => {
        console.log("metatrader5-master ----------> get Account Summary Time out error");
      });
      if (master.follows === 0) return;

      await metatrader5Axios.get('/OpenedOrders', {
        params: {
          id: master.token
        }
      }).then(async (response) => {
        if (response.status !== 200) {
          console.log("metatrader5-master ----------> get Opened Orders Error!");
          return;
        }

        const master_opened_orders = response.data;
        const history_orders = master.history_orders;

        //this is the main part that can add, modify or remove orders
        const add_remove_requests = async (callback) => {

          //remove or modify part
          history_orders?.map(async (history_order) => {
            const exist_order = master_opened_orders.find(item => item.ticket === history_order.ticket);
            if (
              exist_order &&
              exist_order.takeProfit === history_order.takeProfit &&
              exist_order.stopLoss === history_order.stopLoss &&
              exist_order.lots === history_order.lots
            ) return;
            const master_database_set = async () => {
              const myDate = new Date();
              const formattedDate = myDate.toISOString();
              const pair_data = await client.query(
                `SELECT account_balance, 
                  total_pl_amount, 
                  win_count, 
                  lose_count,
                  prev_account_margin
                  FROM metatrader5_masters 
                  WHERE account_id = '${master.account_id}'`
              );
              const pl = history_order.profit;
              const account_balance = pair_data.rows[0].account_balance;
              const lot_size = exist_order ? history_order.lots - exist_order.lots : history_order.lots;
              const real_pl = exist_order ? (lot_size * 100) / (history_order.lots * 100) * pl : pl;
              const margin = pair_data.rows[0].prev_account_margin;
              const total_pl = pair_data.rows[0].total_pl_amount + real_pl;
              const cur_pl = {
                balance: account_balance,
                margin: margin,
                pl: real_pl,
                date: formattedDate
              }
              await client.query(
                `UPDATE metatrader5_masters
                  SET master_pl = array_append(master_pl, $1),                  
                  total_pl_amount = $2,
                  win_count = $3,
                  lose_count = $4
                  WHERE account_id = '${master.account_id}'`,
                [
                  JSON.stringify(cur_pl),
                  total_pl,
                  real_pl >= 0 ? parseInt(pair_data.rows[0].win_count) + 1 : parseInt(pair_data.rows[0].win_count),
                  real_pl < 0 ? parseInt(pair_data.rows[0].lose_count) + 1 : parseInt(pair_data.rows[0].lose_count)
                ]
              );
            }
            if (!exist_order || (exist_order.lots !== history_order.lots)) master_database_set();

            const order_remove = async () => {
              contractData.rows.map(async (row) => {
                const copier_acc_id = row.copier_acc_id;
                const copier_acc_type = row.copier_acc_type;
                if (copier_acc_type === "mt4") {
                  const mt4_copier_account = await client.query(
                    `SELECT * FROM metatrader_copiers 
                      WHERE account_id = '${copier_acc_id}'`
                  );
                  if (mt4_copier_account.rowCount === 0) return;
                  const order_pairs = mt4_copier_account.rows[0].order_pair;
                  const pair = order_pairs?.find(item => item.master_order_id === history_order.ticket);
                  if (pair) {
                    if (row.status === 'Running') {
                      if (exist_order && (exist_order.takeProfit !== history_order.takeProfit || exist_order.stopLoss !== history_order.stopLoss)) {
                        await metatrader4Axios.get(`/SymbolParams`, {
                          params: {
                            id: token,
                            symbol: exist_order.symbol
                          }
                        }).then(async (info) => {
                          if (info.statusText === "OK") {
                            console.log(info.data.symbolInfo.points);
                            const { stopLoss, takeProfit } = calc_tp_st(mt4_copier_account.rows[0].follow_tp_st, exist_order, info.data.symbolInfo.points);
                            await metatrader4Axios.get('/OrderModify', {
                              params: {
                                id: mt4_copier_account.rows[0].token,
                                ticket: pair.copier_order_id,
                                stoploss: stopLoss,
                                takeprofit: takeProfit,
                              }
                            }).then(async (modify_response) => {
                              if (modify_response.status === 200) {
                                console.log("metatrader5-master ----------> metatrader4 modify success", performance.now());
                              }
                            }).catch(() => {
                              console.log("metatrader5-master ----------> metatrader4 modify error");
                            })
                          }
                        }).catch(() => {
                          console.log("metatrader5-master ----------> metatrader4 get symbol error");
                        })
                      }
                      if (!exist_order || exist_order.lots !== history_order.lots) {
                        const copier_order = mt4_copier_account.rows[0].history_orders?.find(item => item.ticket === pair.copier_order_id);
                        let volume = 0;
                        if (exist_order) {
                          volume = calc_volume(master.account_balance, mt4_copier_account.rows[0].account_balance, mt4_copier_account.rows[0].risk_type, mt4_copier_account.rows[0].risk_setting, history_order.lots, exist_order.lots);
                          if (volume === 0) return;
                        }
                        const real_lot_size = (copier_order && copier_order.lots <= volume) ? 0 : volume;
                        await metatrader4Axios.get('/OrderClose', {
                          params: {
                            id: mt4_copier_account.rows[0].token,
                            ticket: pair.copier_order_id,
                            lots: real_lot_size
                          }
                        }).then(async (closed_order) => {
                          if (closed_order.status !== 200) {
                            console.log("metatrader5-master ----------> metatrader4 Order Close Error");
                            return;
                          }
                          const closed_order_comment = closed_order.data.comment;
                          if (real_lot_size > 0 && closed_order_comment.includes("to")) {
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
                              master_order_id: pair.master_order_id,
                              copier_order_id: new_order_id,
                              old_copier_order_id: pair.copier_order_id,
                              lot_size: real_lot_size,
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
                          console.log("metatrader5-master ----------> close metatrader4 success", performance.now())
                        }).catch(() => {
                          console.log("metatrader5-master ----------> metatrader4 order close error");
                        })
                      }
                    }
                    else {
                      if (!exist_order && pair) {
                        await client.query(
                          `UPDATE metatrader_copiers 
                            SET order_pair = array_remove(order_pair, $1) 
                            WHERE account_id = '${copier_acc_id}'`,
                          [
                            JSON.stringify(pair)
                          ]
                        )
                      }
                    }
                  }
                }
                if (copier_acc_type === "mt5") {
                  const mt5_copier_account = await client.query(
                    `SELECT * FROM metatrader5_copiers 
                      WHERE account_id = '${copier_acc_id}'`
                  );
                  if (mt5_copier_account.rowCount === 0) return;
                  const order_pairs = mt5_copier_account.rows[0].order_pair;
                  const pair = order_pairs?.find(item => item.master_order_id === history_order.ticket);
                  if (pair) {
                    if (row.status === 'Running') {
                      if (exist_order && (exist_order.takeProfit !== history_order.takeProfit || exist_order.stopLoss !== history_order.stopLoss)) {
                        await metatrader5Axios.get(`/SymbolParams`, {
                          params: {
                            id: token,
                            symbol: exist_order.symbol
                          }
                        }).then(async (info) => {
                          if (info.statusText === "OK") {
                            console.log(info.data.symbolInfo.points);
                            const { stopLoss, takeProfit } = calc_tp_st(mt5_copier_account.rows[0].follow_tp_st, exist_order, info.data.symbolInfo.points);
                            await metatrader5Axios.get('/OrderModify', {
                              params: {
                                id: mt5_copier_account.rows[0].token,
                                ticket: pair.copier_order_id,
                                stoploss: stopLoss,
                                takeprofit: takeProfit,
                              }
                            }).then(async (modify_response) => {
                              if (modify_response.status === 200) {
                                console.log("metatrader5-master ----------> metatrader5 modify success", performance.now());
                              }
                            }).catch(() => {
                              console.log("metatrader5-master ----------> metatrader5 modify error");
                            })
                          }
                        }).catch(() => {
                          console.log("metatrader5-master ----------> metatrader4 get symbol error");
                        })
                      }
                      if (!exist_order || exist_order.lots !== history_order.lots) {
                        const copier_order = mt5_copier_account.rows[0].history_orders?.find(item => item.ticket === pair.copier_order_id);
                        let volume = 0;
                        if (exist_order) {
                          volume = calc_volume(master.account_balance, mt5_copier_account.rows[0].account_balance, mt5_copier_account.rows[0].risk_type, mt5_copier_account.rows[0].risk_setting, history_order.lots, exist_order.lots);
                          if (volume === 0) return;
                        }
                        const real_lot_size = (copier_order && copier_order.lots <= volume) ? 0 : volume;
                        await metatrader5Axios.get('/OrderClose', {
                          params: {
                            id: mt5_copier_account.rows[0].token,
                            ticket: pair.copier_order_id,
                            lots: real_lot_size
                          }
                        }).then(async (close_response) => {
                          if (close_response.status !== 200) {
                            console.log("metatrader5-master ----------> metatrader5 Order Close Error");
                            return;
                          }
                          console.log("metatrader5-master ----------> close metatrader5 success", performance.now())
                        }).catch(() => {
                          console.log("metatrader5-master ----------> metatrader5 order close error");
                        })
                      }
                    }
                    else {
                      if (!exist_order && pair) {
                        await client.query(
                          `UPDATE metatrader5_copiers 
                            SET order_pair = array_remove(order_pair, $1) 
                            WHERE account_id = '${copier_acc_id}'
                            AND type = '${copier_acc_type}'`,
                          [
                            JSON.stringify(pair)
                          ]
                        )
                      }
                    }
                  }
                }
                if (copier_acc_type === "tld" || copier_acc_type === "tll") {
                  const tl_copier_account = await client.query(
                    `SELECT * FROM copiers 
                      WHERE account_id = '${copier_acc_id}'`
                  );
                  if (copier_acc_type.rowCount === 0) return;
                  const position_pairs = tl_copier_account.rows[0].position_pair;
                  const copier_acc_num = tl_copier_account.rows[0].acc_num;
                  const pair = position_pairs?.find(item => item.master_order_id === history_order?.ticket);
                  if (!pair) return;
                  const basic_url = copier_acc_type === "tld" ? TRADELOCKER_DEMO_BASIC_URL : copier_acc_type === "tll" ? TRADELOCKER_LIVE_BASIC_URL : "";
                  if (row.status === 'Running') {
                    if (exist_order && (exist_order.takeProfit !== history_order.takeProfit || exist_order.stopLoss !== history_order.stopLoss)) {
                      const symbol_id = await client.query(
                        `SELECT * FROM tradable_instrument_pairs
                          WHERE symbol = '${exist_order.symbol}'`
                      );
                      if (symbol_id.rowCount === 0) return;
                      const { stopLoss, takeProfit } = calc_tp_st(tl_copier_account.rows[0].follow_tp_st, exist_order, symbol_id.rows[0].pip_value);
                      const config = {
                        method: 'patch',
                        url: `${basic_url}/trade/positions/${pair.copier_position_id}`,
                        headers: {
                          'accept': 'application/json',
                          'Authorization': `Bearer ${tl_copier_account.rows[0].access_token}`,
                          'accNum': `${copier_acc_num}`,
                          'Content-Type': 'application/json'
                        },
                        data: {
                          "stopLoss": stopLoss,
                          "takeProfit": takeProfit
                        }
                      };

                      axios(config)
                        .then(async (response) => {
                          if (response.status === 200 || (response.data.s === "error" && response.data.errmsg === "Reason for rejection: Nothing to change.")) {
                            console.log(indexNum + "metatrader5-master ----------> Tradelocker Modify Position Success", performance.now());
                          }
                        })
                        .catch(async () => {
                          console.log(indexNum, "metatrader5-master ----------> Tradelocker Modify Position Error", performance.now());
                        });
                    }
                    if (!exist_order || exist_order.lots !== history_order.lots) {
                      const copier_order = tl_copier_account.rows[0].history_positions?.find(item => item[0] === pair.copier_position_id);
                      let volume = 0;
                      if (exist_order) {
                        volume = calc_volume(master.account_balance, tl_copier_account.rows[0].account_balance, tl_copier_account.rows[0].risk_type, tl_copier_account.rows[0].risk_setting, history_order.lots, exist_order.lots);
                        if (volume === 0) return;
                      }
                      const real_lot_size = (copier_order && parseFloat(copier_order[4]) <= volume) ? 0 : volume;
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
                          "qty": parseFloat(real_lot_size)
                        }
                      };
                      axios(config)
                        .then(async (response) => {
                          console.log("copier position", response.data);
                        })
                        .catch(() => {
                          console.log(indexNum, "metatrader5-master ----------> Tradelocker Delete Position Failed.", performance.now());
                        });
                    }
                  }
                  else {
                    if (!exist_order && pair) {
                      await client.query(
                        `UPDATE copiers 
                          SET position_pair = array_remove(position_pair, $1) 
                          WHERE account_id = '${copier_acc_id}'`,
                        [
                          JSON.stringify(pair)
                        ]
                      )
                    }
                  }
                }
              });
            };

            order_remove();

          });

          master_opened_orders?.map(async (opened_order) => {
            const exist_order = history_orders?.find(item => item.ticket === opened_order.ticket);
            if (exist_order) return;
            //order
            const order_function = async () => {
              contractData.rows.map(async (row) => {
                if (row.status === 'Running') {
                  const copier_acc_id = row.copier_acc_id;
                  const copier_acc_type = row.copier_acc_type;
                  if (copier_acc_type === "mt4") {
                    const mt4_copier_account = await client.query(
                      `SELECT * FROM metatrader_copiers 
                        WHERE account_id = '${copier_acc_id}'`
                    );
                    if (mt4_copier_account.rowCount === 0) {
                      console.log("metatrader5-master ----------> get copier account token from database error!");
                      return;
                    }
                    console.log("metatrader5-master ---------->  get data success and order start", performance.now());
                    await metatrader4Axios.get(`/SymbolParams`, {
                      params: {
                        id: token,
                        symbol: exist_order.symbol
                      }
                    }).then(async (info) => {
                      if (info.statusText === "OK") {
                        console.log(info.data.symbol.point)
                        const { volume, stopLoss, takeProfit } = risk_setting_func(master.account_balance, mt4_copier_account.rows[0], opened_order, info.data.symbol.point);
                        if (volume === 0) return;
                        await metatrader4Axios.get('/OrderSend', {
                          params: {
                            id: mt4_copier_account.rows[0].token,
                            symbol: opened_order.symbol,
                            operation: opened_order.orderType,
                            volume: volume,
                            stoploss: stopLoss,
                            takeprofit: takeProfit,
                          }
                        }).then(async (order_response) => {
                          if (order_response.status === 200) {
                            await client.query(
                              `UPDATE metatrader_copiers
                              SET order_pair = array_append(order_pair, $1)
                              WHERE account_id = '${copier_acc_id}'`,
                              [
                                JSON.stringify({
                                  copier_order_id: order_response.data.ticket,
                                  master_order_id: opened_order.ticket
                                })
                              ]
                            );
                            console.log(indexNum, "metatrader5-master ----------> metatrader5 order success", performance.now())
                          }
                        }).catch(() => {
                          console.log("metatrader5-master ----------> metatrader5 order send error");
                        });
                      }
                    }).catch(() => {
                      console.log("metatrader5-master ----------> metatrader5 get symbol params error");
                    })
                  }
                  if (copier_acc_type === "mt5") {
                    const mt5_copier_account = await client.query(
                      `SELECT * FROM metatrader5_copiers 
                        WHERE account_id = '${copier_acc_id}'`
                    );
                    if (mt5_copier_account.rowCount === 0) {
                      console.log("metatrader5-master ----------> get copier account token from database error!");
                      return;
                    }
                    console.log("metatrader5-master ---------->  get data success and order start", performance.now());
                    await metatrader5Axios.get(`/SymbolParams`, {
                      params: {
                        id: token,
                        symbol: exist_order.symbol
                      }
                    }).then(async (info) => {
                      if (info.statusText === "OK") {
                        console.log(info.data.symbol.point);
                        const { volume, stopLoss, takeProfit } = risk_setting_func(master.account_balance, mt5_copier_account.rows[0], opened_order, info.data.symbol.point);
                        if (volume === 0) return;
                        await metatrader5Axios.get('/OrderSend', {
                          params: {
                            id: mt5_copier_account.rows[0].token,
                            symbol: opened_order.symbol,
                            operation: opened_order.orderType,
                            volume: volume,
                            stoploss: stopLoss,
                            takeprofit: takeProfit,
                          }
                        }).then(async (order_response) => {
                          if (order_response.status === 200) {
                            await client.query(
                              `UPDATE metatrader5_copiers
                              SET order_pair = array_append(order_pair, $1)
                              WHERE account_id = '${copier_acc_id}'`,
                              [
                                JSON.stringify({
                                  copier_order_id: order_response.data.ticket,
                                  master_order_id: opened_order.ticket
                                })
                              ]
                            );
                            console.log("metatrader5-master ----------> metatrader5 order success", performance.now())
                          }
                        }).catch(() => {
                          console.log("metatrader5-master ----------> metatrader5 order send error");
                        });
                      }
                    }).catch(() => {
                      console.log("metatrader5-master ----------> metatrader5 get symbol params error");
                    })
                  }
                  if (copier_acc_type === "tld" || copier_acc_type === "tll") {
                    const tl_copier_account = await client.query(
                      `SELECT * FROM copiers 
                        WHERE account_id = '${copier_acc_id}'`
                    );
                    if (tl_copier_account.rowCount === 0) {
                      console.log("metatrader5-master ----------> get tradelocker copier account error!");
                      return;
                    }
                    console.log("metatrader5-master ----------> get data tradelocker success", performance.now());

                    const copier_acc_num = row.copier_acc_num;
                    const basic_url = copier_acc_type === "tld" ? TRADELOCKER_DEMO_BASIC_URL : copier_acc_type === "tll" ? TRADELOCKER_LIVE_BASIC_URL : "";
                    const symbol_id = await client.query(
                      `SELECT * FROM tradable_instrument_pairs
                        WHERE symbol = '${opened_order.symbol}'`
                    );
                    if (symbol_id.rowCount === 0) return;
                    const { volume, stopLoss, takeProfit } = risk_setting_func(master.account_balance, tl_copier_account.rows[0], opened_order, symbol_id.rows[0].pip_value);
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
                        "routeId": 9912,
                        "side": opened_order.orderType,
                        "stopLoss": stopLoss,
                        "stopLossType": "absolute",
                        "stopPrice": 0,
                        "takeProfit": takeProfit,
                        "takeProfitType": "absolute",
                        "trStopOffset": 0,
                        "tradableInstrumentId": symbol_id.rows[0].tradable_instrument_id,
                        "type": "market",
                        "validity": "IOC"
                      }
                    }
                    axios(config)
                      .then(async (order_response) => {
                        if (order_response.data.s === "ok") {
                          console.log("metatrader5-master ----------> order_response success");
                          //get position id from orderId in tradelocker
                          const orderId = order_response.data.d.orderId;
                          const config1 = {
                            method: 'get',
                            url: `${basic_url}/trade/accounts/${copier_acc_id}/ordersHistory?tradableInstrumentId=${symbol_id.rows[0].tradable_instrument_id}`,
                            headers: {
                              'accept': 'application/json',
                              'Authorization': `Bearer ${tl_copier_account.rows[0].access_token}`,
                              'accNum': `${copier_acc_num}`,
                              'Content-Type': 'application/json'
                            }
                          }
                          axios(config1)
                            .then(async (response) => {
                              if (response.data.s === "ok") {
                                const remove_order = response.data.d.ordersHistory.find(orhistory => orhistory[0] === orderId);
                                const pair = {
                                  master_order_id: opened_order.ticket,
                                  copier_position_id: remove_order[16]
                                }
                                const jsonPair = JSON.stringify(pair);
                                await client.query(
                                  `UPDATE copiers 
                                      SET position_pair = array_append(position_pair, $1) 
                                      WHERE account_id = '${copier_acc_id}'`,
                                  [jsonPair]
                                );
                                console.log(indexNum + "metatrader5-master ----------> Set Order Pair Success", performance.now())
                              }
                            })
                            .catch((err) => {
                              console.log(indexNum + " Error", err.response.data);
                            })
                        }
                      }).catch((err) => {
                        console.log("tradelocker order error", err);
                      })
                  }
                }
              });
            }
            order_function();
          });
          callback();
        }

        const history_orders_set = async () => {
          await client.query(
            `UPDATE metatrader5_masters 
              SET history_orders = $1
              WHERE account_id = '${master.account_id}'`,
            [
              master_opened_orders
            ]
          );
        }
        add_remove_requests(function () {
          history_orders_set();
        })
      }).catch(() => {
        console.log("metatrader5-master ----------> Opened Orders Time out error");
      })

    }).catch(() => {
      console.log("metatrader5-master ----------> Check Connect Time out error")
    })
  });
  await Promise.all(promises);
}

// getMetatrader5MasterHistoryOrders(function () {
//   getMetatrader5OrderPair();
// });

// setTimeout(function () {
//   setInterval(runMetatrader5TradingFunction, 3 * 1000);
// }, 10 * 1000);

module.exports = { getMetatrader5MasterHistoryOrders, getMetatrader5OrderPair, runMetatrader5TradingFunction }