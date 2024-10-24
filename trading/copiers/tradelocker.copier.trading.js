const client = require("../../config/db/db.js");

const { tradelockerDemoAxios, tradelockerLiveAxios } = require("../config/tradelocker.config.js");

//Catch the change event of Tradelocker Copier Account and get information Function
const getTradelockerCopiersPL = async () => {
  const copierData = await client.query(
    `SELECT * FROM copiers`
  );
  if (copierData.rowCount === 0) {
    console.log("Tradelocker-master ----------> get copiers from database error");
    return;
  }
  const promises = copierData.rows.map(async (copier) => {
    const myAxiosRequest = copier.type === "tld" ? tradelockerDemoAxios : copier.type === "tll" ? tradelockerLiveAxios : "";
    await myAxiosRequest.get(`/trade/accounts/${copier.account_id}/positions`, {
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${copier.access_token}`,
        'accNum': `${copier.acc_num}`
      }
    }).then(async (copier_positions_res) => {
      if (copier_positions_res.data.s !== "ok") {
        console.log("Tradelocker-master ----------> get copier account positions request not success");
        return;
      }

      const all_accounts = await myAxiosRequest.get(`/auth/jwt/all-accounts`, {
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${copier.access_token}`
        }
      });
      const current_account = await all_accounts.data.accounts.find(acc => acc.id === copier.account_id);
      if (current_account) {
        await client.query(
          `UPDATE copiers
            SET account_balance = $1
            WHERE id = '${copier.id}'`,
          [
            parseFloat(current_account.accountBalance)
          ]
        )
      }

      const copier_positions = copier_positions_res.data.d.positions;
      const history_positions = copier.history_positions;
      const add_remove_requests = (callback) => {
        history_positions?.map(async (history_position) => {
          const cur_position = copier_positions?.find(position => history_position[0] === position[0])
          if (!cur_position || (cur_position[4] !== history_position[4])) {
            const myDate = new Date();
            const formattedDate = myDate.toISOString();
            const account_pl = await client.query(
              `SELECT account_balance, 
                total_pl_amount,
                position_pair 
                FROM copiers 
                WHERE id = '${copier.id}'`
            );
            const position_pairs = account_pl.rows[0].position_pair;            
            const exist_one = position_pairs?.find(item => item.copier_position_id === history_position[0]);
            if (!exist_one) return;
            const pl = parseFloat(history_position[9]);
            const account_balance = account_pl.rows[0].account_balance;
            const lot_size = cur_position ? parseFloat(history_position[4]) - parseFloat(cur_position[4]) : parseFloat(history_position[4]);
            const real_pl = cur_position ? (lot_size * 100) / (parseFloat(history_position[4]) * 100) * pl : pl;
            const total_pl = account_pl.rows[0].total_pl_amount + real_pl;
            if (real_pl > 0) {
              await client.query(
                `UPDATE copiers 
                  SET win_count = win_count + 1 
                  WHERE id = '${copier.id}'`
              )
            }
            else {
              await client.query(
                `UPDATE copiers 
                  SET lose_count = lose_count + 1 
                  WHERE id = '${copier.id}'`
              )
            }
            const cur_pl = {
              date: formattedDate,
              balance: account_balance,
              pl: real_pl              
            }
            await client.query(
              `UPDATE copiers 
                SET copier_pl = array_append(copier_pl, $1), 
                total_pl_amount = $2
                WHERE id = '${copier.id}'`,
              [
                cur_pl,
                total_pl
              ]
            );

            if (!cur_position) {
              await client.query(
                `UPDATE copiers
                  SET position_pair = array_remove(position_pair, $1)
                  WHERE id = '${copier.id}'`,
                [
                  exist_one
                ]
              )
            }
          }
        });

        callback();
      }
      const set_history_position = async () => {
        await client.query(
          `UPDATE copiers 
            SET history_positions = $1 
            WHERE id = '${copier.id}'`,
          [
            copier_positions
          ]
        );
      }
      add_remove_requests(function () {
        set_history_position();
      })
    }).catch((err) => {
      console.log("Tradelocker-master ----------> get copier account positions error", err.response?.data);
    })
  });
  await Promise.all(promises);
}

module.exports = { getTradelockerCopiersPL };
