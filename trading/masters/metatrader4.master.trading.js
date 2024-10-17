const client = require("../../config/db/db.js");
const axios = require("axios");
const moment = require("moment");
const { v5: uuidv5 } = require('uuid');
const { metatrader4Axios } = require("../config/metatrader4.config.js");
const { metatrader5Axios } = require("../config/metatrader5.config.js");
const { TRADELOCKER_DEMO_BASIC_URL, TRADELOCKER_LIVE_BASIC_URL, tradelockerDemoAxios, tradelockerLiveAxios } = require("../config/tradelocker.config.js");

const MY_NAMESPACE = uuidv5("https://tradingatmstg.wpenginepowered.com/", uuidv5.DNS);

//This function is to initialize the previous positions (history_positions) of metatrader_masters in database before start trading

const getMetatrader4MasterHistoryOrders = async (callback) => {
  console.log("getMetatrader4MasterHistoryOrders ---------> Start", performance.now());
  const masterData = await client.query(
    `SELECT * FROM metatrader_masters`
  );

  const getMasterHistoryP = masterData.rows?.map(async (master) => {
    await metatrader4Axios.get('/OpenedOrders', {
      params: {
        id: master.token
      }
    }).then(async (res) => {
      if (res.status !== 200) {
        console.log("getMetatrader4MasterHistoryOrders -------------> get Opened Orders Request Error", res.data);
        return;
      }

      await client.query(
        `UPDATE metatrader_masters 
          SET history_orders = $1
          WHERE account_id = '${master.account_id}'`,
        [
          res.data,
        ]
      );
      console.log("getMetatrader4MasterHistoryOrders ------------> get Opened Orders Success", performance.now());
    }).catch((err) => {
      console.log("getMetatrader4MasterHistoryOrders -------------> get Opened Orders Error", err);
    })
  })
  await Promise.all(getMasterHistoryP);
  callback();
}

//This function is to initialize the order_pair of copiers in database before start trading

const getMetatrader4OrderPair = async (callback) => {
  console.log("getMetatrader4OrderPair --------> Start get Order Pair", performance.now());
  const copierData = await client.query(
    `SELECT order_pair, 
      account_id, 
      my_master_id, 
      my_master_type, 
      token, 
      type FROM metatrader_copiers`
  );
  if (copierData.rowCount === 0) {
    console.log("getMetatrader4OrderPair ------> Get Copier Data from database Error!");
    return;
  }
  for (let i = 0; i < copierData.rowCount; i++) {
    const copier = copierData.rows[i];
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
      await metatrader4Axios.get(`/OpenedOrders`, {
        params: {
          id: copier.token
        }
      }).then(async (response) => {
        if (response.status !== 200) {
          console.log("getMetatrader4OrderPair ------> Get Opened Orders Request Error!");
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
          await copier.order_pair?.map(async (pair) => {
            const exist_copier_order = await response.data?.find(item => item.ticket === pair.copier_order_id);
            const exist_master_order = await master_response.data?.find(item => item.ticket === pair.master_order_id);
            if (!exist_copier_order || !exist_master_order) {
              await client.query(
                `UPDATE metatrader_copiers 
                  SET order_pair = array_remove(order_pair, $1) 
                  WHERE account_id = $2`,
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
        console.log("getMetatrader4OrderPair ---------> Get Master Data from mt5 database Error!");
        return;
      }
      await metatrader4Axios.get(`/OpenedOrders`, {
        params: {
          id: copier.token
        }
      }).then(async (response) => {
        if (response.status !== 200) {
          console.log("getMetatrader4OrderPair ------> Get Opened Orders Request Error!");
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

          await copier.order_pair?.map(async (pair) => {
            const exist_copier_order = await response.data.find(item => item.ticket === pair.copier_order_id);
            const exist_master_order = await master_response.data.find(item => item.ticket === pair.master_order_id);
            if (!exist_copier_order || !exist_master_order) {
              await client.query(
                `UPDATE metatrader_copiers 
                  SET order_pair = array_remove(order_pair, $1) 
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
      await metatrader4Axios.get(`/OpenedOrders`, {
        params: {
          id: copier.token
        }
      }).then(async (response) => {
        if (response.status !== 200) {
          console.log("getMetatrader4OrderPair ------> Get Opened Orders Request Error!");
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
            console.log("getMetatrader4OrderPair ----------> get Accounts positions not success");
            return;
          }
          await copier.order_pair?.map(async (pair) => {
            const exist_copier_position = await response.data.find(item => item.ticket === pair.copier_order_id);
            const exist_master_position = await master_response.data.d.positions.find(item => item[0] === pair.master_position_id);
            if (!exist_copier_position || !exist_master_position) {
              await client.query(
                `UPDATE metatrader_copiers 
                  SET order_pair = array_remove(order_pair, $1) 
                  WHERE account_id = $2`,
                [
                  pair,
                  copier.account_id
                ]
              )
            }
          });
          console.log("getMetatrader4OrderPair ----------> Get Accounts Position Pair success", performance.now());
        }).catch((err) => {
          console.log("!!!!!!!!!!getMetatrader4OrderPair ----------> get master accounts positions request error", err.response);
        })
      })
    }
    console.log("mt4 my master id", copier.my_master_id)
    console.log("---------------> performance <----------------", performance.now())
  }
  callback();
}

let indexNum = 0;
//This function is the main function that trade by interval
//First, get all masters data from masters table of database and get all copiers corresponding to each master from tData table of database

//this function is to get random number for takeProfit and stopLoss
// function getRandomNumber(min, max, criteria) {
//   console.log(max - min, criteria);
//   return (max - min) > criteria ? Math.floor(Math.random() * criteria * 1000) / 1000 : Math.floor(Math.random() * (max - min) * 1000) / 1000 + min;
// }

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
      // volume = opened_order.lots;
      volume = risk_setting;
      break;
    case 'balance_multiplier':
      // volume = Math.floor(((copier_account_balance * 100) / (master_account_balance * 100)) * opened_order.lots * 100) / 100;
      volume = opened_order.lots;
      break;
    case 'lot_multiplier':
      volume = risk_setting ? opened_order.lots : Math.floor(opened_order.lots * risk_setting) / 100;
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
      if (opened_order.type === 'Sell') stopLoss = opened_order.closePrice + parseFloat(follow_tp_st?.fixed_stop_loss_size) * pip_value;
      else stopLoss = opened_order.closePrice - parseFloat(follow_tp_st?.fixed_stop_loss_size) * pip_value;
    }
    else {
      if (risk_type !== "balance_multiplier") stopLoss = opened_order.stopLoss > 0 ? (follow_tp_st?.stop_loss_refinement ? (opened_order.stopLoss + parseFloat(follow_tp_st?.stop_loss_refinement_size) * pip_value) : opened_order.stopLoss) : 0;
      else {
        if (opened_order.type === 'Sell') {
          const diff = opened_order.stopLoss - opened_order.closePrice;
          const master_risk = master_account_balance !== 0 ? (diff / master_account_balance) : 0;
          const copier_risk = master_risk * risk_setting / 100;
          const copier_diff = copier_risk * copier_account_balance;
          const temp_stop_loss = opened_order.closePrice + copier_diff;
          stopLoss = opened_order.stopLoss > 0 ? (follow_tp_st?.stop_loss_refinement ?
            (temp_stop_loss + parseFloat(follow_tp_st?.stop_loss_refinement_size) * pip_value) : temp_stop_loss) : 0;
        }
        else {
          const diff = opened_order.closePrice - opened_order.stopLoss;
          const master_risk = master_account_balance !== 0 ? (diff / master_account_balance) : 0;
          const copier_risk = master_risk * risk_setting / 100;
          const copier_diff = copier_risk * copier_account_balance;
          const temp_stop_loss = opened_order.closePrice - copier_diff;
          stopLoss = opened_order.stopLoss > 0 ? (follow_tp_st?.stop_loss_refinement ?
            (temp_stop_loss + parseFloat(follow_tp_st?.stop_loss_refinement_size) * pip_value) : temp_stop_loss) : 0;
        }
      }
    }
  }
  if (follow_tp_st?.take_profit) {
    if (follow_tp_st?.fixed_take_profit) {
      if (opened_order.type === 'Sell') takeProfit = opened_order.openPrice - parseFloat(follow_tp_st?.fixed_take_profit_size) * pip_value;
      else takeProfit = opened_order.openPrice + parseFloat(follow_tp_st?.fixed_take_profit_size) * pip_value;
    }
    else {
      if (risk_type !== "balance_multiplier") takeProfit = opened_order.takeProfit > 0 ? (follow_tp_st?.take_profit_refinement ? (opened_order.takeProfit + parseFloat(follow_tp_st?.take_profit_refinement_size) * pip_value) : opened_order.takeProfit) : 0;
      else {
        if (opened_order.type === 'Sell') {
          const diff = opened_order.openPrice - opened_order.takeProfit;
          const master_risk = master_account_balance !== 0 ? (diff / master_account_balance) : 0;
          const copier_risk = master_risk * risk_setting / 100;
          const copier_diff = copier_risk * copier_account_balance;
          const temp_take_profit = opened_order.openPrice - copier_diff;
          takeProfit = opened_order.takeProfit > 0 ? (follow_tp_st?.take_profit_refinement ?
            (temp_take_profit + parseFloat(follow_tp_st?.take_profit_refinement_size) * pip_value) : temp_take_profit) : 0;
        }
        else {
          const diff = opened_order.takeProfit - opened_order.openPrice;
          const master_risk = master_account_balance !== 0 ? (diff / master_account_balance) : 0;
          const copier_risk = master_risk * risk_setting / 100;
          const copier_diff = copier_risk * copier_account_balance;
          const temp_take_profit = opened_order.openPrice + copier_diff;
          takeProfit = opened_order.takeProfit > 0 ? (follow_tp_st?.take_profit_refinement ?
            (temp_take_profit + parseFloat(follow_tp_st?.take_profit_refinement_size) * pip_value) : temp_take_profit) : 0;
        }
      }
    }
  }
  return { volume, stopLoss, takeProfit };
}

const calc_tp_st = (master_account_balance, copier_account, exist_order, pip_value) => {
  const risk_type = copier_account.risk_type;
  const follow_tp_st = copier_account.follow_tp_st;
  const risk_setting = copier_account.risk_setting;
  const copier_account_balance = copier_account.account_balance;
  let stopLoss = 0;
  let takeProfit = 0;
  if (follow_tp_st?.stop_loss) {
    if (follow_tp_st?.fixed_stop_loss) {
      if (exist_order.type === 'Sell') stopLoss = exist_order.closePrice + parseFloat(follow_tp_st?.fixed_stop_loss_size) * pip_value;
      else stopLoss = exist_order.closePrice - parseFloat(follow_tp_st?.fixed_stop_loss_size) * pip_value;
    }
    else {
      if (risk_type !== "balance_multiplier") stopLoss = exist_order.stopLoss > 0 ? (follow_tp_st?.stop_loss_refinement ? (exist_order.stopLoss + parseFloat(follow_tp_st?.stop_loss_refinement_size) * pip_value) : exist_order.stopLoss) : 0;
      else {
        if (exist_order.type === 'Sell') {
          const diff = exist_order.stopLoss - exist_order.closePrice;
          const master_risk = master_account_balance !== 0 ? (diff / master_account_balance) : 0;
          const copier_risk = master_risk * risk_setting / 100;
          const copier_diff = copier_risk * copier_account_balance;
          const temp_stop_loss = exist_order.closePrice + copier_diff;
          stopLoss = exist_order.stopLoss > 0 ? (follow_tp_st?.stop_loss_refinement ?
            (temp_stop_loss + parseFloat(follow_tp_st?.stop_loss_refinement_size) * pip_value) : temp_stop_loss) : 0;
        }
        else {
          const diff = exist_order.closePrice - exist_order.stopLoss;
          const master_risk = master_account_balance !== 0 ? (diff / master_account_balance) : 0;
          const copier_risk = master_risk * risk_setting / 100;
          const copier_diff = copier_risk * copier_account_balance;
          const temp_stop_loss = exist_order.closePrice - copier_diff;
          stopLoss = exist_order.stopLoss > 0 ? (follow_tp_st?.stop_loss_refinement ?
            (temp_stop_loss + parseFloat(follow_tp_st?.stop_loss_refinement_size) * pip_value) : temp_stop_loss) : 0;
        }
      }
    }
  };
  if (follow_tp_st?.take_profit) {
    if (follow_tp_st?.fixed_take_profit) {
      if (exist_order.type === 'Sell') takeProfit = exist_order.openPrice - parseFloat(follow_tp_st?.fixed_take_profit_size) * pip_value;
      else takeProfit = exist_order.openPrice + parseFloat(follow_tp_st?.fixed_take_profit_size) * pip_value;
    }
    else {
      if (risk_type !== "balance_multiplier") takeProfit = exist_order.takeProfit > 0 ? (follow_tp_st?.take_profit_refinement ? (exist_order.takeProfit + parseFloat(follow_tp_st?.take_profit_refinement_size) * pip_value) : exist_order.takeProfit) : 0;
      else {
        if (exist_order.type === 'Sell') {
          const diff = exist_order.openPrice - exist_order.takeProfit;
          const master_risk = master_account_balance !== 0 ? (diff / master_account_balance) : 0;
          const copier_risk = master_risk * risk_setting / 100;
          const copier_diff = copier_risk * copier_account_balance;
          const temp_take_profit = exist_order.openPrice - copier_diff;
          takeProfit = exist_order.takeProfit > 0 ? (follow_tp_st?.take_profit_refinement ?
            (temp_take_profit + parseFloat(follow_tp_st?.take_profit_refinement_size) * pip_value) : temp_take_profit) : 0;
        }
        else {
          const diff = exist_order.takeProfit - exist_order.openPrice;
          const master_risk = master_account_balance !== 0 ? (diff / master_account_balance) : 0;
          const copier_risk = master_risk * risk_setting / 100;
          const copier_diff = copier_risk * copier_account_balance;
          const temp_take_profit = exist_order.openPrice + copier_diff;
          takeProfit = exist_order.takeProfit > 0 ? (follow_tp_st?.take_profit_refinement ?
            (temp_take_profit + parseFloat(follow_tp_st?.take_profit_refinement_size) * pip_value) : temp_take_profit) : 0;
        }
      }
    }
  };
  return { stopLoss, takeProfit };
}

const calc_volume = (copier_account_balance, risk_type, risk_setting, exist_order_lot) => {
  switch (risk_type) {
    case 'fixed_lot':
      volume = risk_setting;
      break;
    case 'balance_multiplier':
      // volume = Math.floor((copier_account_balance / master_account_balance) * exist_order_lot * 100) / 100;
      volume = exist_order_lot;
      break;
    case 'lot_multiplier':
      volume = risk_setting === 100 ? exist_order_lot : Math.floor(exist_order_lot * risk_setting) / 100;
      break;
    case 'fixed_balance_multiplier':
      volume = Math.floor(copier_account_balance / risk_setting * 100 * exist_order_lot) / 100;
      break;
  }
  return volume;
}

const calc_nearest_int = (input_number) => {
  if (((input_number * 100) - Math.floor(input_number * 100)) >= 0.5) return (Math.floor(input_number * 100) + 1) / 100;
  else return Math.floor(input_number * 100) / 100;
}

const runMetatrader4TradingFunction = async (io, socketUsers) => {
  indexNum++;
  console.log(indexNum, "metatrader4-master ----------> Start Run Trading Function", performance.now());
  //get all masters data
  const masterData = await client.query(
    `SELECT * FROM metatrader_masters`
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
    await metatrader4Axios.get('/CheckConnect', {
      params: {
        id: master.token
      }
    }).then(async (isConnected) => {
      if (isConnected.status !== 200) {
        console.log("metatrader4-master ----------> connection to server error");
        return;
      }
      await metatrader4Axios.get('/AccountSummary', {
        params: {
          id: master.token
        }
      }).then(async (summary) => {
        if (summary.status !== 200) {
          console.log("metatrader4-master ----------> get Account Summary Request Error");
          return;
        }
        await client.query(
          `UPDATE metatrader_masters 
            SET account_balance = $1,
            account_profit = $2,
            account_margin = $3,
            prev_account_margin = account_margin
            WHERE account_id = '${master.account_id}'
            AND type = '${master.type}'`,
          [
            summary.data.balance,
            summary.data.profit,
            summary.data.margin
          ]
        );
      }).catch(() => {
        console.log("metatrader4-master ----------> get Account Summary Time out error");
      });
      if (master.follows === 0) return;
      await metatrader4Axios.get('/OpenedOrders', {
        params: {
          id: master.token
        }
      }).then(async (response) => {
        if (response.status !== 200) {
          console.log("metatrader4-master ----------> get Opened Orders Error!");
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

            const master_database_set = async (isExist, exist_order_lot) => {
              const myDate = new Date();
              const formattedDate = myDate.toISOString();
              const pair_data = await client.query(
                `SELECT account_balance, 
                  total_pl_amount, 
                  win_count, 
                  lose_count,
                  prev_account_margin
                  FROM metatrader_masters 
                  WHERE account_id = '${master.account_id}'`
              );
              const pl = history_order.profit;
              const account_balance = pair_data.rows[0].account_balance;
              const lot_size = isExist ? history_order.lots - exist_order_lot : history_order.lots;
              const real_pl = isExist ? (lot_size * 100) / (history_order.lots * 100) * pl : pl;
              const margin = pair_data.rows[0].prev_account_margin;
              const total_pl = pair_data.rows[0].total_pl_amount + real_pl;
              const cur_pl = {
                balance: account_balance,
                margin: margin,
                pl: real_pl,
                date: formattedDate
              }
              await client.query(
                `UPDATE metatrader_masters
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
              )
            }

            const order_remove = async () => {
              contractData.rows.map(async (contract) => {
                const copier_acc_id = contract.copier_acc_id;
                const copier_acc_type = contract.copier_acc_type;
                if (copier_acc_type === "mt4") {
                  const mt4_copier_account = await client.query(
                    `SELECT * FROM metatrader_copiers 
                      WHERE account_id = '${copier_acc_id}'`
                  );
                  if (mt4_copier_account.rowCount === 0) return;
                  const order_pairs = mt4_copier_account.rows[0].order_pair;
                  const pair = order_pairs?.find(item => item.master_order_id === history_order.ticket);
                  if (exist_order && (exist_order.takeProfit !== history_order.takeProfit || exist_order.stopLoss !== history_order.stopLoss)) {
                    if (contract.status !== 'Running' || !pair) return;
                    await metatrader4Axios.get(`/SymbolParams`, {
                      params: {
                        id: mt4_copier_account.rows[0].token,
                        symbol: exist_order.symbol
                      }
                    }).then(async (info) => {
                      if (info.statusText === "OK") {
                        const { stopLoss, takeProfit } = calc_tp_st(master.account_balance, mt4_copier_account.rows[0], exist_order, info.data.symbol.point);
                        await metatrader4Axios.get('/OrderModify', {
                          params: {
                            id: mt4_copier_account.rows[0].token,
                            ticket: pair.copier_order_id,
                            stoploss: stopLoss,
                            takeprofit: takeProfit,
                          }
                        }).then(async (modify_response) => {
                          if (modify_response.status === 200) {
                            console.log("metatrader4-master ----------> metatrader4 modify success", performance.now());
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
                                "MT4 account " + mt4_copier_account.rows[0].account_name + " modified stop loss or take profit of order " + pair.copier_order_id + " at " + moment(formattedDate).format('YYYY/MM/DD hh:mm:ss A'),
                                false,
                                moment(formattedDate).format('YYYY/MM/DD hh:mm:ss A'),
                                "modify_trade"
                              ]
                            );
                            if (socketUsers[mt4_copier_account.rows[0].user_id]) {
                              io.to(mt4_copier_account.rows[0].user_id).emit('notification', messages.rowCount > 0 ? messages.rows[0] : {});
                            }
                          }
                        }).catch((err) => {
                          console.log("metatrader4-master ----------> metatrader4 modify error", err);
                        })
                      }
                    }).catch((err) => {
                      console.log("metatrader4-master ----------> metatrader4 get symbol error", err);
                    })
                  }
                  if (!exist_order) {
                    const master_orders_history = await metatrader4Axios.get(`/OrderHistory`, {
                      params: {
                        id: master.token,
                        from: new Date(new Date(history_order.openTime) - 5000000)
                      }
                    });
                    let real_lot_size;
                    let volume = -1;
                    let one_exist_order;
                    if (master_orders_history.status === 200) {
                      const master_orders_history_data = master_orders_history.data;
                      one_exist_order = master_orders_history_data.reverse().find(item => item.openTime === history_order.openTime);
                      if (one_exist_order.lots === history_order.lots) {
                        real_lot_size = 0;
                        master_database_set(false, one_exist_order.lots);
                        if (contract.status !== 'Running' && pair) {
                          await client.query(
                            `UPDATE metatrader_copiers
                              SET order_pair = array_remove(order_pair, $1)
                              WHERE account_id = '${copier_acc_id}'`,
                            [
                              pair
                            ]
                          );
                        }
                      }
                      else {
                        if (!pair) return;
                        master_database_set(true, one_exist_order.lots);
                        const copier_order = mt4_copier_account.rows[0].history_orders?.find(item => item.ticket === pair.copier_order_id);
                        const volume = calc_volume(mt4_copier_account.rows[0].account_balance, mt4_copier_account.rows[0].risk_type, mt4_copier_account.rows[0].risk_setting, one_exist_order.lots);
                        real_lot_size = (copier_order && copier_order.lots <= volume) ? 0 : volume;
                        console.log(real_lot_size, volume);
                      }
                    }
                    if (!pair) return;
                    const master_order_comment = one_exist_order.comment;
                    const master_split = master_order_comment.split("#");
                    const master_new_order_id = parseInt(master_split[1]);
                    if (real_lot_size === 0 && volume === 0) {
                      await client.query(
                        `UPDATE metatrader_copiers
                          SET order_pair = array_remove(order_pair, $1)
                          WHERE account_id = '${copier_acc_id}'`,
                        [
                          pair
                        ]
                      );
                      const update_pair = {
                        ...pair,
                        master_order_id: master_new_order_id
                      }
                      await client.query(
                        `UPDATE metatrader_copiers
                          SET order_pair = array_append(order_pair, $1)
                          WHERE account_id = '${copier_acc_id}'`,
                        [
                          update_pair
                        ]
                      );
                      return;
                    }
                    if (contract.status !== 'Running') return;
                    await metatrader4Axios.get('/OrderClose', {
                      params: {
                        id: mt4_copier_account.rows[0].token,
                        ticket: pair.copier_order_id,
                        lots: real_lot_size
                      }
                    }).then(async (closed_order) => {
                      if (closed_order.status !== 200) return;
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
                          "MT4 account " + mt4_copier_account.rows[0].account_name + " closed " + ((real_lot_size > 0 ? calc_nearest_int(real_lot_size) : "all") + " lots of order ") + pair.copier_order_id + " at " + moment(formattedDate).format('YYYY/MM/DD hh:mm:ss A'),
                          false,
                          moment(formattedDate).format('YYYY/MM/DD hh:mm:ss A'),
                          "close_trade"
                        ]
                      );
                      if (socketUsers[mt4_copier_account.rows[0].user_id]) {
                        io.to(mt4_copier_account.rows[0].user_id).emit('notification', messages.rowCount > 0 ? messages.rows[0] : {});
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
                          master_order_id: master_new_order_id,
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
                      console.log("metatrader4-master ----------> close metatrader4 success", performance.now())
                    }).catch(() => {
                      console.log("metatrader4-master ----------> metatrader4 order close error");
                    });
                  }
                }
                if (copier_acc_type === "mt5") {
                  const mt5_copier_account = await client.query(
                    `SELECT * FROM metatrader5_copiers 
                      WHERE account_id = '${copier_acc_id}' 
                      AND type = '${copier_acc_type}'`
                  );
                  if (mt5_copier_account.rowCount === 0) return;
                  const order_pairs = mt5_copier_account.rows[0].order_pair;
                  const pair = order_pairs?.find(item => item.master_order_id === history_order.ticket);
                  if (exist_order && (exist_order.takeProfit !== history_order.takeProfit || exist_order.stopLoss !== history_order.stopLoss)) {
                    if (contract.status !== 'Running' || !pair) return;
                    await metatrader5Axios.get(`/SymbolParams`, {
                      params: {
                        id: mt5_copier_account.rows[0].token,
                        symbol: exist_order.symbol
                      }
                    }).then(async (info) => {
                      if (info.statusText === "OK") {
                        console.log(info.data.symbolInfo.points);
                        const { stopLoss, takeProfit } = calc_tp_st(master.account_balance, mt5_copier_account.rows[0], exist_order, info.data.symbolInfo.points);
                        await metatrader5Axios.get('/OrderModify', {
                          params: {
                            id: mt5_copier_account.rows[0].token,
                            ticket: pair.copier_order_id,
                            stoploss: stopLoss,
                            takeprofit: takeProfit,
                          }
                        }).then(async (modify_response) => {
                          if (modify_response.status === 200) {
                            console.log("metatrader4-master ----------> metatrader5 modify success", performance.now());
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
                                "MT5 account " + mt5_copier_account.rows[0].account_name + " modified stop loss or take profit of order " + pair.copier_order_id + " at " + moment(formattedDate).format('YYYY/MM/DD hh:mm:ss A'),
                                false,
                                moment(formattedDate).format('YYYY/MM/DD hh:mm:ss A'),
                                "modify_trade"
                              ]
                            );
                            if (socketUsers[mt5_copier_account.rows[0].user_id]) {
                              io.to(mt5_copier_account.rows[0].user_id).emit('notification', messages.rowCount > 0 ? messages.rows[0] : {});
                            }
                          }
                        }).catch(() => {
                          console.log("metatrader4-master ----------> metatrader5 modify error");
                        })
                      }
                    }).catch(() => {
                      console.log("metatrader4-master ----------> metatrader5 get symbol error");
                    })
                  }
                  if (!exist_order) {
                    const master_orders_history = await metatrader4Axios.get(`/OrderHistory`, {
                      params: {
                        id: master.token,
                        from: new Date(new Date(history_order.openTime) - 5000000)
                      }
                    });
                    let real_lot_size;
                    let volume = -1;
                    let one_exist_order;
                    if (master_orders_history.status === 200) {
                      const master_orders_history_data = master_orders_history.data;
                      one_exist_order = master_orders_history_data.reverse().find(item => item.openTime === history_order.openTime);
                      if (one_exist_order.lots === history_order.lots) {
                        real_lot_size = 0;
                        master_database_set();
                        if (contract.status !== 'Running' && pair) {
                          await client.query(
                            `UPDATE metatrader5_copiers
                              SET order_pair = array_remove(order_pair, $1)
                              WHERE account_id = '${copier_acc_id}'`,
                            [
                              pair
                            ]
                          );
                        }
                      }
                      else {
                        if (!pair) return;
                        const copier_order = mt5_copier_account.rows[0].history_orders?.find(item => item.ticket === pair.copier_order_id);
                        const volume = calc_volume(mt5_copier_account.rows[0].account_balance, mt5_copier_account.rows[0].risk_type, mt5_copier_account.rows[0].risk_setting, one_exist_order.lots);
                        real_lot_size = (copier_order && copier_order.lots <= volume) ? 0 : volume;
                      }
                    }
                    if (!pair) return;
                    const master_order_comment = one_exist_order.comment;
                    console.log(indexNum, "master_order_comment", master_order_comment, performance.now());
                    const master_split = master_order_comment.split("#");
                    const master_new_order_id = parseInt(master_split[1]);
                    if (real_lot_size === 0 && volume === 0) {
                      await client.query(
                        `UPDATE metatrader5_copiers
                          SET order_pair = array_remove(order_pair, $1)
                          WHERE account_id = '${copier_acc_id}'`,
                        [
                          pair
                        ]
                      );
                      const update_pair = {
                        ...pair,
                        master_order_id: master_new_order_id
                      }
                      await client.query(
                        `UPDATE metatrader5_copiers
                          SET order_pair = array_append(order_pair, $1)
                          WHERE account_id = '${copier_acc_id}'`,
                        [
                          update_pair
                        ]
                      );
                      return;
                    }
                    if (contract.status !== 'Running') return;
                    await metatrader5Axios.get('/OrderClose', {
                      params: {
                        id: mt5_copier_account.rows[0].token,
                        ticket: pair.copier_order_id,
                        lots: real_lot_size
                      }
                    }).then(async (closed_order) => {
                      if (closed_order.status !== 200) return;
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
                          "MT5 account " + mt5_copier_account.rows[0].account_name + " closed " + ((real_lot_size > 0 ? calc_nearest_int(real_lot_size) : "all") + " lots of order ") + pair.copier_order_id + " at " + moment(formattedDate).format('YYYY/MM/DD hh:mm:ss A'),
                          false,
                          moment(formattedDate).format('YYYY/MM/DD hh:mm:ss A'),
                          "close_trade"
                        ]
                      );
                      if (socketUsers[mt5_copier_account.rows[0].user_id]) {
                        io.to(mt5_copier_account.rows[0].user_id).emit('notification', messages.rowCount > 0 ? messages.rows[0] : {});
                      }
                      if (real_lot_size > 0) {
                        await client.query(
                          `UPDATE metatrader5_copiers
                            SET order_pair = array_remove(order_pair, $1)
                            WHERE account_id = '${copier_acc_id}'`,
                          [
                            pair
                          ]
                        );
                        const update_pair = {
                          ...pair,
                          master_order_id: master_new_order_id,
                        }
                        await client.query(
                          `UPDATE metatrader5_copiers
                            SET order_pair = array_append(order_pair, $1)
                            WHERE account_id = '${copier_acc_id}'`,
                          [
                            update_pair
                          ]
                        );
                      }
                      console.log("metatrader4-master ----------> close metatrader4 success", performance.now())
                    }).catch(() => {
                      console.log("metatrader4-master ----------> metatrader4 order close error");
                    });
                  }
                }
                if (copier_acc_type === "tld" || copier_acc_type === "tll") {
                  const tl_copier_account = await client.query(
                    `SELECT * FROM copiers 
                      WHERE account_id = '${copier_acc_id}'`
                  );
                  if (tl_copier_account.rowCount === 0) return;
                  const position_pairs = tl_copier_account.rows[0].position_pair;
                  const copier_acc_num = tl_copier_account.rows[0].acc_num;
                  const pair = position_pairs?.find(item => item.master_order_id === history_order?.ticket);
                  const basic_url = copier_acc_type === "tld" ? TRADELOCKER_DEMO_BASIC_URL : copier_acc_type === "tll" ? TRADELOCKER_LIVE_BASIC_URL : "";
                  if (exist_order && (exist_order.takeProfit !== history_order.takeProfit || exist_order.stopLoss !== history_order.stopLoss)) {
                    if (contract.status !== 'Running' || !pair) return;
                    const symbol_id = await client.query(
                      `SELECT * FROM tradable_instrument_pairs
                        WHERE symbol = '${exist_order.symbol}'`
                    );
                    if (symbol_id.rowCount === 0) return;
                    const { stopLoss, takeProfit } = calc_tp_st(master.account_balance, tl_copier_account.rows[0], exist_order, symbol_id.rows[0].pip_value);
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
                          console.log(indexNum + "metatrader4-master ----------> Tradelocker Modify Position Success", performance.now());
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
                        }
                      })
                      .catch(async () => {
                        console.log(indexNum, "metatrader4-master ----------> Tradelocker Modify Position Error", performance.now());
                      });
                  }
                  if (!exist_order) {
                    const master_orders_history = await metatrader4Axios.get(`/OrderHistory`, {
                      params: {
                        id: master.token,
                        from: new Date(new Date(history_order.openTime) - 5000000)
                      }
                    });
                    let real_lot_size;
                    let volume = -1;
                    let one_exist_order;
                    if (master_orders_history.status === 200) {
                      const master_orders_history_data = master_orders_history.data;
                      one_exist_order = master_orders_history_data.reverse().find(item => item.openTime === history_order.openTime);
                      if (one_exist_order.lots === history_order.lots) {
                        real_lot_size = 0;
                        master_database_set();
                        if (contract.status !== 'Running' && pair) {
                          await client.query(
                            `UPDATE copiers 
                              SET position_pair = array_remove(position_pair, $1) 
                              WHERE account_id = '${copier_acc_id}'`,
                            [
                              pair
                            ]
                          );
                        }
                      }
                      else {
                        if (!pair) return;
                        const copier_order = tl_copier_account.rows[0].history_positions?.find(item => item[0] === pair.copier_position_id);
                        if (!copier_order) return;
                        const volume = calc_volume(tl_copier_account.rows[0].account_balance, tl_copier_account.rows[0].risk_type, tl_copier_account.rows[0].risk_setting, one_exist_order.lots);
                        real_lot_size = (copier_order && copier_order.lots <= volume) ? 0 : volume;
                      }
                    }
                    if (!pair) return;
                    const master_order_comment = one_exist_order.comment;
                    console.log(indexNum, "master_order_comment", master_order_comment, performance.now());
                    const master_split = master_order_comment.split("#");
                    const master_new_order_id = parseInt(master_split[1]);
                    if (real_lot_size === 0 && volume === 0) {
                      await client.query(
                        `UPDATE copiers
                          SET position_pair = array_remove(position_pair, $1)
                          WHERE account_id = '${copier_acc_id}'`,
                        [
                          pair
                        ]
                      );
                      const update_pair = {
                        ...pair,
                        master_order_id: master_new_order_id
                      }
                      await client.query(
                        `UPDATE copiers
                          SET position_pair = array_append(position_pair, $1)
                          WHERE account_id = '${copier_acc_id}'`,
                        [
                          update_pair
                        ]
                      );
                      return;
                    }
                    if (contract.status !== 'Running') return;
                    console.log("real lot size", real_lot_size)
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
                        console.log("=====================>")
                        if ((response.data.s === "ok") || (response.data.s === "error" && response.data.errmsg === "Position not found")) {
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
                              "Tradelocker account " + tl_copier_account.rows[0].account_name + " closed " + ((real_lot_size > 0 ? calc_nearest_int(real_lot_size) : "all") + " lots of order ") + pair.copier_position_id + " at " + moment(formattedDate).format('YYYY/MM/DD hh:mm:ss A'),
                              false,
                              moment(formattedDate).format('YYYY/MM/DD hh:mm:ss A'),
                              "close_trade"
                            ]
                          );
                          if (socketUsers[tl_copier_account.rows[0].user_id]) {
                            io.to(tl_copier_account.rows[0].user_id).emit('notification', messages.rowCount > 0 ? messages.rows[0] : {});
                          }
                          if (real_lot_size > 0) {
                            await client.query(
                              `UPDATE copiers
                                SET position_pair = array_remove(position_pair, $1)
                                WHERE account_id = '${copier_acc_id}'`,
                              [
                                pair
                              ]
                            );
                            const update_pair = {
                              ...pair,
                              master_order_id: master_new_order_id,
                            }
                            await client.query(
                              `UPDATE copiers
                                SET position_pair = array_append(position_pair, $1)
                                WHERE account_id = '${copier_acc_id}'`,
                              [
                                update_pair
                              ]
                            );
                          }
                        }
                      })
                      .catch(() => {
                        console.log(indexNum, "metatrader4-master ----------> Tradelocker Delete Position Failed.", performance.now());
                      });
                  }
                }
              });
              callback();
            };

            order_remove();
          });

          //add order part

          master_opened_orders?.map(async (opened_order) => {
            const exist_order = history_orders?.find(item => item.ticket === opened_order.ticket);
            if (exist_order) return;

            const comment = opened_order.comment;
            let old_account_id;
            if (comment.includes("from")) {
              const temp_list = comment.split("#");
              old_account_id = parseInt(temp_list[1]);
              console.log(old_account_id);
            }
            //order
            console.log("start order function");
            const order_function = async () => {
              contractData.rows.map(async (row) => {
                const copier_acc_id = row.copier_acc_id;
                const copier_acc_type = row.copier_acc_type;
                if (row.status === 'Running') {
                  if (copier_acc_type === "mt4") {
                    const mt4_copier_account = await client.query(
                      `SELECT * FROM metatrader_copiers 
                        WHERE account_id = '${copier_acc_id}'`
                    );
                    if (mt4_copier_account.rowCount === 0) {
                      console.log("metatrader4-master ----------> get copier account token from database error!");
                      return;
                    }
                    console.log("metatrader4-master ---------->  get data success and order start", performance.now());
                    console.log("metatrader5-master ---------->  get data success and order start", performance.now());
                    if (comment.includes("from")) return;
                    await metatrader4Axios.get(`/SymbolParams`, {
                      params: {
                        id: mt4_copier_account.rows[0].token,
                        symbol: opened_order.symbol
                      }
                    }).then(async (info) => {
                      if (info.statusText === "OK") {
                        console.log(info.data.symbol.point);

                        const { volume, stopLoss, takeProfit } = risk_setting_func(master.account_balance, mt4_copier_account.rows[0], opened_order, info.data.symbol.point);
                        if (volume === 0) return;
                        await metatrader4Axios.get('/OrderSend', {
                          params: {
                            id: mt4_copier_account.rows[0].token,
                            symbol: opened_order.symbol,
                            operation: opened_order.type,
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
                                  master_order_id: opened_order.ticket
                                }
                              ]
                            );
                            console.log("metatrader4-master ----------> metatrader4 order success", performance.now())
                          }
                        }).catch(() => {
                          console.log("metatrader4-master ----------> metatrader4 order send error");
                        });
                      }
                    }).catch(() => {
                      console.log("metatrader4-master ----------> metatrader4 get symbol error");
                    })
                  }
                  if (copier_acc_type === "mt5") {

                    const mt5_copier_account = await client.query(
                      `SELECT * FROM metatrader5_copiers 
                        WHERE account_id = '${copier_acc_id}'`
                    );
                    if (mt5_copier_account.rowCount === 0) {
                      console.log("metatrader4-master ----------> get copier account token from database error!");
                      return;
                    }
                    console.log("metatrader4-master ---------->  get data success and order start", performance.now());

                    if (comment.includes("from")) return;
                    await metatrader5Axios.get(`/SymbolParams`, {
                      params: {
                        id: mt5_copier_account.rows[0].token,
                        symbol: opened_order.symbol
                      }
                    }).then(async (info) => {
                      if (info.statusText === "OK") {
                        console.log(info.data.symbolInfo.points);
                        const { volume, stopLoss, takeProfit } = risk_setting_func(master.account_balance, mt5_copier_account.rows[0], opened_order, info.data.symbolInfo.points);
                        console.log(volume, stopLoss, takeProfit)
                        if (volume === 0) return;
                        await metatrader5Axios.get('/OrderSend', {
                          params: {
                            id: mt5_copier_account.rows[0].token,
                            symbol: opened_order.symbol,
                            operation: opened_order.type,
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
                            console.log(messages.rows[0])
                            if (socketUsers[mt5_copier_account.rows[0].user_id]) {
                              console.log("user id", socketUsers)
                              io.to(mt5_copier_account.rows[0].user_id).emit('notification', messages.rowCount > 0 ? messages.rows[0] : {});
                            }
                            await client.query(
                              `UPDATE metatrader5_copiers
                              SET order_pair = array_append(order_pair, $1)
                              WHERE account_id = '${copier_acc_id}'`,
                              [
                                {
                                  copier_order_id: order_response.data.ticket,
                                  master_order_id: opened_order.ticket
                                }
                              ]
                            );
                            console.log("metatrader4-master ----------> metatrader5 order success", performance.now())
                          }
                        }).catch(() => {
                          console.log("metatrader4-master ----------> metatrader5 order send error");
                        });
                      }
                    }).catch(() => {
                      console.log("metatrader4-master ----------> metatrader5 get symbol param error");
                    })
                  }
                  if (copier_acc_type === "tld" || copier_acc_type === "tll") {
                    const tl_copier_account = await client.query(
                      `SELECT * FROM copiers 
                        WHERE account_id = '${copier_acc_id}'`
                    );
                    if (tl_copier_account.rowCount === 0) {
                      console.log("metatrader4-master ----------> get tradelocker copier account error!");
                      return;
                    }
                    console.log("metatrader4-master ----------> get data tradelocker success", performance.now());

                    if (comment.includes("from")) {
                      return;
                    }

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
                        "side": opened_order.type,
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
                        console.log(order_response.data)
                        if (order_response.data.s === "ok") {
                          console.log("metatrader4-master ----------> order_response success");
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
                              "Tradelocker account " + tl_copier_account.rows[0].account_name + " opened a trade of id " + order_response.data.d.orderId + " at " + moment(formattedDate).format('YYYY/MM/DD hh:mm:ss A'),
                              false,
                              moment(formattedDate).format('YYYY/MM/DD hh:mm:ss A'),
                              "open_trade"
                            ]
                          );
                          if (socketUsers[tl_copier_account.rows[0].user_id]) {
                            io.to(tl_copier_account.rows[0].user_id).emit('notification', messages.rowCount > 0 ? messages.rows[0] : {});
                          }
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
                                console.log(pair);
                                const jsonPair = JSON.stringify(pair);
                                await client.query(
                                  `UPDATE copiers 
                                      SET position_pair = array_append(position_pair, $1) 
                                      WHERE account_id = '${copier_acc_id}'`,
                                  [jsonPair]
                                );
                                console.log(indexNum + "metatrader4-master ----------> Set Order Pair Success", performance.now())
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
                else {
                  const master_order_history = await metatrader4Axios.get(`/OrderHistory`, {
                    params: {
                      id: master.token,
                      from: new Date(new Date(opened_order.openTime) - 5000000)
                    }
                  });
                  if (master_order_history.status !== 200) return;
                  const master_order_history_data = master_order_history.data;
                  if (copier_acc_type === "mt4") {
                    const copier_data = await client.query(
                      `SELECT * FROM metatrader_copiers
                        WHERE account_id = '${copier_acc_id}'`
                    );
                    if (copier_data.rowCount === 0) return;
                    const exist_one = master_order_history_data.reverse().find(item => item.openTime === opened_order.openTime);
                    if (!exist_one) return;
                    const order_pair = copier_data.rows[0].order_pair;
                    const remove_pair = order_pair.find(item => item.master_order_id === exist_one.ticket);
                    if (!remove_pair) return;
                    const update_pair = {
                      copier_order_id: remove_pair.copier_order_id,
                      master_order_id: opened_order.ticket
                    }
                    await client.query(
                      `UPDATE metatrader_copiers
                        SET order_pair = array_remove(order_pair, $1)
                        WHERE account_id = '${copier_acc_id}'`,
                      [
                        remove_pair
                      ]
                    );
                    await client.query(
                      `UPDATE metatrader_copiers
                        SET order_pair = array_append(order_pair, $1)
                        WHERE account_id = '${copier_acc_id}'`,
                      [
                        update_pair
                      ]
                    );
                  }
                  if (copier_acc_type === "mt5") {
                    const copier_data = await client.query(
                      `SELECT * FROM metatrader5_copiers
                        WHERE account_id = '${copier_acc_id}'`
                    );
                    if (copier_data.rowCount === 0) return;
                    const exist_one = master_order_history_data.reverse().find(item => item.openTime === opened_order.openTime);
                    if (!exist_one) return;
                    const order_pair = copier_data.rows[0].order_pair;
                    const remove_pair = order_pair.find(item => item.master_order_id === exist_one.ticket);
                    if (!remove_pair) return;
                    const update_pair = {
                      copier_order_id: remove_pair.copier_order_id,
                      master_order_id: opened_order.ticket
                    }
                    await client.query(
                      `UPDATE metatrader5_copiers
                        SET order_pair = array_remove(order_pair, $1)
                        WHERE account_id = '${copier_acc_id}'`,
                      [
                        remove_pair
                      ]
                    );
                    await client.query(
                      `UPDATE metatrader5_copiers
                        SET order_pair = array_append(order_pair, $1)
                        WHERE account_id = '${copier_acc_id}'`,
                      [
                        update_pair
                      ]
                    );
                  }
                  if (copier_acc_type === "tld" || copier_acc_type === "tll") {
                    const copier_data = await client.query(
                      `SELECT * FROM copiers
                        WHERE account_id = '${copier_acc_id}'`
                    );
                    if (copier_data.rowCount === 0) return;
                    const exist_one = master_order_history_data.reverse().find(item => item.openTime === opened_order.openTime);
                    if (!exist_one) return;
                    const position_pair = copier_data.rows[0].position_pair;
                    const remove_pair = position_pair.find(item => item.master_order_id === exist_one.ticket);
                    if (!remove_pair) return;
                    const update_pair = {
                      copier_position_id: remove_pair.copier_position_id,
                      master_order_id: opened_order.ticket
                    }
                    await client.query(
                      `UPDATE copiers
                        SET position_pair = array_remove(position_pair, $1)
                        WHERE account_id = '${copier_acc_id}'`,
                      [
                        remove_pair
                      ]
                    );
                    await client.query(
                      `UPDATE copiers
                        SET position_pair = array_append(position_pair, $1)
                        WHERE account_id = '${copier_acc_id}'`,
                      [
                        update_pair
                      ]
                    );
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
            `UPDATE metatrader_masters 
              SET history_orders = $1
              WHERE account_id = '${master.account_id}'`,
            [master_opened_orders]
          );
        }

        add_remove_requests(function () {
          history_orders_set();
        })
      }).catch(() => {
        console.log("metatrader4-master ----------> Opened Orders Time out error");
      })

    }).catch(() => {
      console.log("metatrader4-master ----------> Check Connect Time out error")
    })
  });
  await Promise.all(promises);
}

// getMetatrader4MasterHistoryOrders(function () {
//   getMetatrader4OrderPair();
// });

// setTimeout(function () {
//   setInterval(runMetatrader4TradingFunction, 3 * 1000);
// }, 10 * 1000);

module.exports = { getMetatrader4MasterHistoryOrders, getMetatrader4OrderPair, runMetatrader4TradingFunction }