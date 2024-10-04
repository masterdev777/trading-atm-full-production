const client = require("../../config/db/db.js");
const { metatrader4Axios } = require("../config/metatrader4.config.js");

//Catch the change event of Metatrader4 Copier Account and get information Function
const getMetatrader4CopiersPL = async () => {
  const copierData = await client.query(
    `SELECT * FROM metatrader_copiers`
  );
  if (copierData.rowCount === 0) {
    console.log("getCopiersPL -----------> get copierData from database Error!");
    return;
  }
  const promises = copierData.rows.map(async (copier) => {
    await metatrader4Axios.get(`/AccountSummary`, {
      params: {
        id: copier.token
      }
    }).then(async (res) => {
      await client.query(
        `UPDATE metatrader_copiers
          SET account_balance = $1,
          account_profit = $2,
          account_margin = $3,
          prev_account_margin = account_margin
          WHERE account_id = '${copier.account_id}'`,
        [
          res.data.balance,
          res.data.profit,
          res.data.margin
        ]
      );
    }).catch(() => {
      console.log("mt4 getCopiersPL ----------> Get Copiers PL Account Summary Request Error!");
    });
    await metatrader4Axios.get(`/OpenedOrders`, {
      params: {
        id: copier.token
      }
    }).then(async (copier_orders_res) => {
      if (copier_orders_res.status !== 200) {
        console.log("mt4 getCopiersPL ----------> Get Opened Orders Request Error!");
        return;
      }

      const copier_orders = copier_orders_res.data;
      const history_orders = copier.history_orders;
      const add_remove_requests = (callback) => {
        history_orders?.map(async (history_order) => {
          const cur_order = copier_orders?.find(order => history_order.ticket === order.ticket)
          if (!cur_order) {
            const myDate = new Date();
            const formattedDate = myDate.toISOString();
            const account_pl = await client.query(
              `SELECT account_balance,
                total_pl_amount,
                prev_account_margin,
                order_pair
                FROM metatrader_copiers
                WHERE account_id = '${copier.account_id}'`
            );
            const remove_pair = account_pl.rows[0].order_pair?.find(item => item?.copier_order_id === history_order.ticket);
            const order_pair = account_pl.rows[0].order_pair?.find(item => item?.old_copier_order_id === history_order.ticket);
            if (!remove_pair && !order_pair) return;
            const pl = history_order.profit;
            const account_balance = account_pl.rows[0].account_balance;
            const lot_size = order_pair ? order_pair.lot_size : history_order.lots;
            const real_pl = order_pair ? (lot_size * 100) / (history_order.lots * 100) * pl : pl;
            const margin = account_pl.rows[0].prev_account_margin;
            const total_pl = account_pl.rows[0].total_pl_amount + real_pl;
            if (real_pl > 0) {
              await client.query(
                `UPDATE metatrader_copiers 
                  SET win_count = win_count + 1 
                  WHERE account_id = '${copier.account_id}'`
              )
            }
            else {
              await client.query(
                `UPDATE metatrader_copiers 
                  SET lose_count = lose_count + 1 
                  WHERE account_id = '${copier.account_id}'`
              )
            }
            const cur_pl = {
              date: formattedDate,
              balance: account_balance,
              pl: real_pl,
              margin: margin
            }
            await client.query(
              `UPDATE metatrader_copiers 
                SET copier_pl = array_append(copier_pl, $1),
                total_pl_amount = $2
                WHERE account_id = '${copier.account_id}'`,
              [
                cur_pl,
                total_pl
              ]
            );
            if (!order_pair) {
              await client.query(
                `UPDATE metatrader_copiers 
                  SET order_pair = array_remove(order_pair, $1)
                  WHERE account_id = '${copier.account_id}'`,
                [
                  remove_pair
                ]
              );
            }
          }
        })
        copier_orders.map(async (current_order) => {
          const cur_order = history_orders?.find(order => current_order.ticket === order.ticket);
          if (cur_order) return;
          // console.log(new Date(new Date(current_order.openTime) - 500000))
          const copier_data = await client.query(
            `SELECT order_pair 
            FROM metatrader_copiers
            WHERE account_id = '${copier.account_id}'`
          );
          const exist_order_pair = copier_data.rows[0].order_pair?.find(item => item.copier_order_id === current_order.ticket);
          if (exist_order_pair) {
            let update_pair;
            if (exist_order_pair.master_position_id) {
              update_pair = {
                master_position_id: exist_order_pair.master_position_id,
                copier_order_id: current_order.ticket
              }
            }
            else {
              update_pair = {
                master_order_id: exist_order_pair.master_order_id,
                copier_order_id: current_order.ticket
              }
            }
            await client.query(
              `UPDATE metatrader_copiers
                SET order_pair = array_remove(order_pair, $1)
                WHERE account_id = '${copier.account_id}'`,
              [
                exist_order_pair
              ]
            );
            await client.query(
              `UPDATE metatrader_copiers
                SET order_pair = array_append(order_pair, $1)
                WHERE account_id = '${copier.account_id}'`,
              [
                update_pair
              ]
            );
          }
        })
        callback();
      }
      const set_history_orders = async () => {
        await client.query(
          `UPDATE metatrader_copiers 
            SET history_orders = $1 
            WHERE account_id = '${copier.account_id}'
            AND type = '${copier.type}'`,
          [
            copier_orders
          ]
        );
      }
      add_remove_requests(function () {
        set_history_orders();
      })
    }).catch(() => {
      console.log("mt4 getCopiersPL ----------> Get Opened Orders Request Error")
    })
  });
  await Promise.all(promises);
}

module.exports = { getMetatrader4CopiersPL };