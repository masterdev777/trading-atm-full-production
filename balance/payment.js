const client = require("../config/db/db.js");
const { v5: uuidv5 } = require('uuid');
const moment = require("moment");

const MY_NAMESPACE = uuidv5("https://tradingatmstg.wpenginepowered.com/", uuidv5.DNS);

const calc_nearest_int = (input_number) => {
  if (((input_number * 10) - Math.floor(input_number * 10)) >= 0.5) return (Math.floor(input_number * 10) + 1) / 10;
  else return Math.floor(input_number * 10) / 10;
}

const Payment = async (io, socketUsers, interval) => {
  try {
    const contracts = await client.query(
      `SELECT * FROM contract`
    );
    const promises = contracts.rows?.map(async (contract) => {
      if (contract.status === 'Running') {
        const master_type = contract.master_acc_type;
        const master_table_name = (master_type === 'tld' || master_type === 'tll') ? 'masters' : master_type === "mt4" ? 'metatrader_masters' : 'metatrader5_masters';
        const master_acc_id = contract.master_acc_id;
        const master = await client.query(
          `SELECT account_name,
          is_profit_share,
          profit_share,
          user_id
          FROM ${master_table_name}
          WHERE account_id = $1`,
          [
            master_acc_id
          ]
        );
        const is_profit_share = master.rows[0].is_profit_share;
        if (is_profit_share === 0) {
          const run_time = Math.floor(calc_nearest_int(contract.run_time));
          const pay_history = contract.pay_history;
          const one = pay_history?.find(history => history.run_time === run_time);
          if (!one) {
            const copier_acc_id = contract.copier_acc_id;
            const copier_acc_type = contract.copier_acc_type;
            const copier_user_id = contract.user_id;
            const user = await client.query(
              `SELECT balance
            FROM users
            WHERE id = $1`,
              [
                copier_user_id
              ]
            );
            const master_user_id = master.rows[0].user_id;
            const master_acc_name = master.rows[0].account_name;
            const profit_share_amount = master.rows[0].profit_share?.per_hour ? parseFloat(master.rows[0].profit_share?.per_hour) : 0;
            const current_balance = user.rows[0].balance;
            if (current_balance > profit_share_amount) {
              const myDate = new Date();
              const formattedDate = myDate.toISOString();
              const copier_table_name = (copier_acc_type === 'tld' || copier_acc_type === 'tll') ? 'copiers' : copier_acc_type === "mt4" ? 'metatrader_copiers' : 'metatrader5_copiers';
              const copier = await client.query(
                `SELECT id,
              account_name
              FROM ${copier_table_name}
              WHERE account_id = $1`,
                [
                  copier_acc_id
                ]
              );
              const copier_acc_name = copier.rows[0].account_name;
              // for copier
              await client.query(
                `UPDATE contract
              SET run_time = $1,
              pay_history = array_append(pay_history, $2)
              WHERE id = $3`,
                [
                  run_time + interval,
                  {
                    payment_date: formattedDate,
                    run_time: run_time,
                    amount: profit_share_amount,
                    master_acc_name: master_acc_name,
                    copier_acc_name: copier_acc_name,
                    kind: 'USD',
                    pay_type: 'hourly'
                  },
                  contract.id
                ]
              );
              const copier_balance = await client.query(
                `UPDATE users
              SET balance = balance - $1
              WHERE id = $2
              RETURNING balance`,
                [
                  profit_share_amount,
                  copier_user_id
                ]
              );
              const copier_secret_name = JSON.stringify({
                time: moment(formattedDate).format('YYYY/MM/DD hh:mm:ss A'),
                type: "hourly_payout_success",
                copier_account_id: copier_acc_id,
                master_account_id: master_acc_id,
                user_id: copier_user_id,
                to: "copier"
              });
              const uniqueId = uuidv5(copier_secret_name, MY_NAMESPACE);
              const copierMessages = await client.query(
                `INSERT INTO notifications
                (id, receiver_id, message, read, time, type)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *`,
                [
                  uniqueId,
                  copier_user_id,
                  "You successfully completed a payment of $" + profit_share_amount + " for copy trading of Copier Account ID " + copier_acc_id + " at " + moment(formattedDate).format('YYYY/MM/DD hh:mm:ss A'),
                  false,
                  formattedDate,
                  "hourly_payout_success"
                ]
              );
              await client.query(
                `UPDATE users
              SET trading_history = array_append(trading_history, $1)
              WHERE id = $2`,
                [
                  {
                    amount: profit_share_amount,
                    type: "copier_trade",
                    payment_date: formattedDate,
                    copier_acc_name: copier_acc_name,
                    master_acc_name: master_acc_name,
                    kind: 'USD',
                    pay_type: 'hourly'
                  },
                  copier_user_id
                ]
              )
              const copierData = {
                messages: copierMessages.rows[0],
                balance: copier_balance.rows[0].balance
              }
              if (socketUsers[copier_user_id]) {
                io.to(copier_user_id).emit('update_balance', copierData);
              }

              // for
              const master_balance = await client.query(
                `UPDATE users
              SET balance = balance + $1
              WHERE id = $2
              RETURNING balance`,
                [
                  profit_share_amount,
                  master.rows[0].user_id
                ]
              );
              const master_secret_name = JSON.stringify({
                time: moment(formattedDate).format('YYYY/MM/DD hh:mm:ss A'),
                type: "hourly_income_success",
                copier_account_id: copier_acc_id,
                master_account_id: master_acc_id,
                user_id: master_user_id,
                to: "master"
              });
              const masterUniqueId = uuidv5(master_secret_name, MY_NAMESPACE);
              const masterMessages = await client.query(
                `INSERT INTO notifications
                (id, receiver_id, message, read, time, type)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *`,
                [
                  masterUniqueId,
                  master_user_id,
                  "You successfully get pid of $" + profit_share_amount + " for copy trading of Master Account ID " + master_acc_id + " at " + moment(formattedDate).format('YYYY/MM/DD hh:mm:ss A'),
                  false,
                  formattedDate,
                  "hourly_income_success"
                ]
              );
              await client.query(
                `UPDATE users
              SET trading_history = array_append(trading_history, $1)
              WHERE  id = $2`,
                [
                  {
                    amount: profit_share_amount,
                    type: "master_trade",
                    payment_date: formattedDate,
                    copier_acc_name: copier_acc_name,
                    master_acc_name: master_acc_name,
                    kind: 'USD',
                    pay_type: 'hourly'
                  },
                  master_user_id
                ]
              );
              console.log(master_balance.rows[0])
              const masterData = {
                messages: masterMessages.rows[0],
                balance: master_balance.rows[0].balance
              }
              if (socketUsers[master_user_id]) {
                io.to(master_user_id).emit('update_balance', masterData);
              }
            }
            else {
              const my_secret_name = JSON.stringify({
                time: moment(formattedDate).format('YYYY/MM/DD hh:mm:ss A'),
                type: "hourly_payout_failed",
                copier_account_id: copier_acc_id,
                master_account_id: master_acc_id,
                user_id: master_user_id,
                to: "copier"
              });
              const uniqueId = uuidv5(my_secret_name, MY_NAMESPACE);
              const myDate = new Date();
              const formattedDate = myDate.toISOString();
              const message = await client.query(
                `INSERT INTO notifications
                (id, receiver_id, message, read, time, type)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *`,
                [
                  uniqueId,
                  copier_user_id,
                  "Your account " + copier_acc_id + " has been stopped due to insufficient balance to cover the payment for copying the master account at" + moment(formattedDate).format('YYYY/MM/DD hh:mm:ss A'),
                  false,
                  formattedDate,
                  "hourly_payout_failed"
                ]
              )
              if (socketUsers[copier_user_id]) {
                io.to(copier_user_id).emit('notification', message.rowCount > 0 ? message.rows[0] : {});
              }
              await client.query(
                `UPDATE contract
               SET status = $1
               WHERE id = $2`,
                [
                  'Stopped',
                  contract.id
                ]
              )
            }

          }
          else {
            await client.query(
              `UPDATE contract
            SET run_time = run_time + $1
            WHERE id = $2`,
              [
                interval,
                contract.id
              ]
            )
          }
        }
      }
    });

    Promise.all(promises);
  }
  catch {
    return;
  }
}

module.exports = { Payment } 
