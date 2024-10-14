const client = require("../config/db/db.js");
const { v5: uuidv5 } = require('uuid');
const moment = require("moment");
const { generateTransactionId } = require("../config/utils/getTransactionId.js");
const { getMyAllAccounts } = require("./user.controller.js");
const { getSocketInstance, socketUsers } = require("../socket/socket.js");

const MY_NAMESPACE = uuidv5("https://tradingatmstg.wpenginepowered.com/", uuidv5.DNS);

/*dashboard*/

//Delete Trading Account From our Platform Endpoint
exports.deleteAccount = async (req, res) => {
  try {
    const { type, acc_id, acc_role } = req.body;
    const user = req.user;
    const database_name = (type === 'tll' || type === 'tld') ? (acc_role === "Master" ? "masters" : "copiers") :
      type === 'mt4' ? (acc_role === "Master" ? "metatrader_masters" : "metatrader_copiers") :
        (acc_role === "Master" ? "metatrader5_masters" : "metatrader5_copiers")
    const isDeleted = await client.query(
      `DELETE FROM ${database_name} 
        WHERE account_id = '${acc_id}'
        AND type = '${type}'`
    );
    if (isDeleted.rowCount > 0) {
      const deleted_account = {
        type: type,
        account_id: acc_id
      }
      if (acc_role === "Master") {
        await client.query(
          `UPDATE users 
            SET masters = array_remove(masters, $1), 
            follow_account = array_remove(follow_account, $1) 
            WHERE id = ${user.id}`,
          [
            JSON.stringify(deleted_account)
          ]
        );
        await res.status(200).send("ok");
      }
      else {
        await client.query(
          `UPDATE users 
            SET copiers = array_remove(copiers, $1)
            WHERE id = ${user.id}`,
          [
            JSON.stringify(deleted_account)
          ]
        );
        await res.status(200).send("ok");
      }
    }
  }
  catch {
    res.status(501).send("Server Error");
  }
}

/*integrations*/

//tradelocker

//Add Tradelocker Master Account to our Platform Endpoint
exports.addMasterAccount = async (req, res) => {
  try {
    const {
      acc_num,
      account_balance,
      access_token,
      refresh_token,
      acc_name,
      acc_id,
      acc_email,
      acc_password,
      server_name,
      type,
      id,
      profit_share,
      description,
      avatar,
      index_level
    } = req.body;
    const master_data = await client.query("SELECT * FROM masters WHERE account_id=$1", [
      acc_id,
    ]);
    if (master_data.rowCount === 0) {
      const copier_data = await client.query(
        `SELECT * 
          FROM copiers 
          WHERE account_id=$1`,
        [
          acc_id
        ]
      );
      if (copier_data.rowCount === 0) {
        const balance = req.user.balance;
        const level_limit = await client.query(
          `SELECT * FROM level_limit
          WHERE id = $1`,
          [
            index_level + 1
          ]
        );
        if (balance < level_limit.rows[0].plan_price) {
          await res.status(201).send("Your account balance is not sufficient. Please charge balance!");
          return;
        }
        const myDate = new Date();
        const formattedDate = myDate.toISOString();
        const new_master = {
          type: type,
          account_id: acc_id
        }
        const new_transaction_history = {
          transaction_id: generateTransactionId(req.user.id),
          invoice_id: level_limit.rows[0].level,
          kind: "USD",
          payment_date: formattedDate,
          type: "Subscription",
          amount: level_limit.rows[0].plan_price,
          status: "completed",
          description: type.toUpperCase() + " account (" + acc_name + " " + level_limit.rows[0].level + " plan)",
        }
        const user = await client.query(
          `UPDATE users 
          SET masters = array_append(masters, $1),
          balance = $2,
          transaction_history = array_append(transaction_history, $3)
          WHERE id = ${id}
          RETURNING *`,
          [
            JSON.stringify(new_master),
            balance - level_limit.rows[0].plan_price,
            new_transaction_history
          ]
        );

        await client.query(
          `INSERT INTO masters 
            (registered_at, 
            acc_num, 
            account_balance, 
            access_token, 
            refresh_token, 
            avatar, 
            account_id, 
            account_email, 
            account_password, 
            account_name, 
            account_server_name, 
            type, 
            follows, 
            master_pl, 
            win_count, 
            lose_count, 
            history_positions, 
            take_stop, 
            balance_pl_pairs, 
            total_pl_amount,
            profit_share,
            about_me,
            roi,
            account_margin,
            account_profit,
            top_badge,
            level,
            payment_date,
            permission,
            user_id) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30) 
            RETURNING *`,
          [
            formattedDate,
            acc_num,
            account_balance,
            access_token,
            refresh_token,
            avatar,
            acc_id,
            acc_email,
            acc_password,
            acc_name,
            server_name,
            type,
            0,
            [],
            0,
            0,
            [],
            [],
            [],
            0,
            profit_share,
            description,
            0,
            0,
            0,
            {
              top_roi: false,
              top_profit: false
            },
            level_limit.rows[0].level,
            formattedDate,
            true,
            id
          ]
        );
        const accounts = await getMyAllAccounts(user.rows[0]);
        await res.status(200).send({ user: user.rows[0], accounts: accounts });
      }
      else {
        await res.status(201).send("This account had already been registered as copier!")
      }
    }
    else {
      await res.status(201).send("This account had already been registered as master!")
    }
  }
  catch {
    await res.status(501).send("Server Error");
  }
}

//Add Tradelocker Copier Account to our Platform Endpoint
exports.addCopierAccount = async (req, res) => {
  try {
    const {
      acc_num,
      account_balance,
      access_token,
      refresh_token,
      acc_name,
      acc_id,
      acc_email,
      acc_password,
      server_name,
      type,
      id,
      avatar
    } = req.body;
    const copier_data = await client.query("SELECT * FROM copiers WHERE account_id=$1", [
      acc_id,
    ]);
    if (copier_data.rowCount === 0) {
      const master_data = await client.query(
        `SELECT * FROM masters 
          WHERE account_id=$1`,
        [acc_id]
      );
      if (master_data.rowCount === 0) {
        const copier_plan_price = await client.query(
          `SELECT * FROM copier_plan_price 
          WHERE id = 1`
        )
        if (req.user.balance < copier_plan_price.rows[0].price) {
          await res.status(201).send("Your account balance is not sufficient. Please charge balance!");
          return;
        }
        const myDate = new Date();
        const formattedDate = myDate.toISOString();
        const new_transaction_history = {
          transaction_id: generateTransactionId(req.user.id),
          invoice_id: "copier",
          kind: "USD",
          payment_date: formattedDate,
          type: "Subscription",
          amount: copier_plan_price.rows[0].price,
          status: "completed",
          description: type.toUpperCase() + " account (" + acc_name + ")",
        }
        const new_copier = {
          type: type,
          account_id: acc_id
        }
        const myData = await client.query(
          `UPDATE users 
              SET copiers = array_append(copiers, $1),
              balance = $2,
              transaction_history = array_append(transaction_history, $3) 
              WHERE id = ${id}
              RETURNING *`,
          [
            JSON.stringify(new_copier),
            req.user.balance - copier_plan_price.rows[0].price,
            new_transaction_history
          ]
        );
        await client.query(
          `INSERT INTO copiers 
            (acc_num, 
            account_balance, 
            access_token, 
            refresh_token, 
            avatar, 
            account_id, 
            account_password, 
            account_name, 
            account_server_name, 
            type, 
            my_master_id, 
            my_master_name, 
            status, 
            copier_pl, 
            position_pair, 
            total_pl_amount, 
            registered_at, 
            win_count, 
            lose_count, 
            account_email,
            roi,
            account_margin,
            account_profit,
            risk_setting,
            risk_type,
            follow_tp_st,
            force_min_max,
            profit_share_method,
            payment_date,
            permission,
            user_id,
            follow_profit_share_change) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32) 
            RETURNING *`,
          [
            acc_num,
            account_balance,
            access_token,
            refresh_token,
            avatar,
            acc_id,
            acc_password,
            acc_name,
            server_name,
            type,
            "",
            "",
            "Nothing",
            [],
            [],
            0,
            formattedDate,
            0,
            0,
            acc_email,
            0,
            0,
            0,
            0,
            "fixed_lot",
            {
              stop_loss: true,
              take_profit: true
            },
            {},
            "per_hour",
            formattedDate,
            true,
            id,
            "no"
          ]
        );
        const accounts = await getMyAllAccounts(myData.rows[0]);
        await res.status(200).send({ user: myData.rows[0], accounts: accounts });
      }
      else {
        await res.status(201).send("This account had already been registered as master!");
      }
    }
    else {
      await res.status(201).send("This account had already been registered as copier!");
    }
  }
  catch {
    await res.status(501).send("Server Error");
  }
}

/*metatrader*/

//Add Metatrader Master Account to our Platform Endpoint
exports.addMetatraderMasterAccount = async (req, res) => {
  try {
    const {
      token,
      acc_id,
      acc_password,
      acc_server_name,
      acc_name,
      host,
      port,
      type,
      id,
      profit_share,
      description,
      avatar,
      index_level
    } = req.body;
    const database_name = type === "mt5" ? "metatrader5_masters" : "metatrader_masters";
    const master_data = await client.query(
      `SELECT * 
        FROM ${database_name} 
        WHERE account_id=$1`,
      [
        acc_id,
      ]
    );
    if (master_data.rowCount === 0) {
      const copier_database_name = type === "mt5" ? "metatrader5_copiers" : "metatrader_copiers";
      const copier_data = await client.query(
        `SELECT * 
          FROM ${copier_database_name} 
          WHERE account_id=$1`,
        [
          acc_id
        ]
      );
      if (copier_data.rowCount === 0) {
        const balance = req.user.balance;
        const level_limit = await client.query(
          `SELECT * FROM level_limit
          WHERE id = $1`,
          [
            index_level + 1
          ]
        );
        if (balance < level_limit.rows[0].plan_price) {
          await res.status(201).send("Your account balance is not sufficient. Please charge balance!");
          return;
        }
        const myDate = new Date();
        const formattedDate = myDate.toISOString();
        const new_master = {
          type: type,
          account_id: acc_id
        }

        const new_transaction_history = {
          transaction_id: generateTransactionId(req.user.id),
          invoice_id: level_limit.rows[0].level,
          kind: "USD",
          payment_date: formattedDate,
          type: "Subscription",
          amount: level_limit.rows[0].plan_price,
          status: "completed",
          description: type.toUpperCase() + " account (" + acc_name + " " + level_limit.rows[0].level + " plan)",
        }
        const user = await client.query(
          `UPDATE users 
          SET masters = array_append(masters, $1),
          balance = $2,
          transaction_history = array_append(transaction_history, $3)
          WHERE id = ${id}
          RETURNING *`,
          [
            JSON.stringify(new_master),
            balance - level_limit.rows[0].plan_price,
            new_transaction_history
          ]
        );
        await client.query(
          `INSERT INTO ${database_name} 
            (registered_at, 
            token, 
            avatar, 
            account_id, 
            account_password, 
            account_name, 
            account_server_name, 
            type, 
            follows, 
            host, 
            port, 
            account_balance, 
            total_pl_amount, 
            win_count, 
            lose_count, 
            history_orders, 
            master_pl,
            profit_share,
            about_me,
            roi,
            account_margin,
            account_profit,
            top_badge,
            level,
            payment_date,
            permission,
            user_id) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27) 
            RETURNING *`,
          [
            formattedDate,
            token,
            avatar,
            acc_id,
            acc_password,
            acc_name,
            acc_server_name,
            type,
            0,
            host,
            port,
            0,
            0,
            0,
            0,
            [],
            [],
            profit_share,
            description,
            0,
            0,
            0,
            {
              top_roi: false,
              top_profit: false
            },
            level_limit.rows[0].level,
            formattedDate,
            true,
            id
          ]
        );
        const accounts = await getMyAllAccounts(user.rows[0]);
        await res.status(200).send({ user: user.rows[0], accounts: accounts });
      }
      else {
        await res.status(201).send("This account had already been registered as copier!")
      }
    }
    else {
      await res.status(201).send("This account had already been registered as master!")
    }
  }
  catch {
    await res.status(501).send("Server Error");
  }
}

//Add Metatrader Copier Account to our Platform Endpoint
exports.addMetatraderCopierAccount = async (req, res) => {
  try {
    const {
      token,
      acc_id,
      acc_password,
      acc_server_name,
      acc_name,
      host,
      port,
      type,
      id,
      avatar
    } = req.body;
    const database_name = type === "mt5" ? "metatrader5_copiers" : "metatrader_copiers";
    const copier_data = await client.query(
      `SELECT * FROM ${database_name} 
        WHERE account_id=$1`,
      [
        acc_id,
      ]
    );
    if (copier_data.rowCount === 0) {
      const master_database_name = type === "mt5" ? "metatrader5_masters" : "metatrader_masters";
      const master_data = await client.query(
        `SELECT * FROM ${master_database_name} 
          WHERE account_id=$1`,
        [
          acc_id
        ]
      );
      if (master_data.rowCount === 0) {
        const copier_plan_price = await client.query(
          `SELECT * FROM copier_plan_price 
          WHERE id = 1`
        );
        if (req.user.balance < copier_plan_price.rows[0].price) {
          await res.status(201).send("Your account balance is not sufficient. Please charge balance!");
          return;
        }
        const myDate = new Date();
        const formattedDate = myDate.toISOString();
        const new_transaction_history = {
          transaction_id: generateTransactionId(req.user.id),
          invoice_id: "copier",
          kind: "USD",
          payment_date: formattedDate,
          type: "Subscription",
          amount: copier_plan_price.rows[0].price,
          status: "completed",
          description: type.toUpperCase() + " account (" + acc_name + ")",
        }
        const new_copier = {
          type: type,
          account_id: acc_id
        }
        const myData = await client.query(
          `UPDATE users 
              SET copiers = array_append(copiers, $1),
              balance = $2,
              transaction_history = array_append(transaction_history, $3) 
              WHERE id = ${id}
              RETURNING *`,
          [
            JSON.stringify(new_copier),
            req.user.balance - copier_plan_price.rows[0].price,
            new_transaction_history
          ]
        );
        await client.query(
          `INSERT INTO ${database_name} 
            (registered_at, 
            token, 
            avatar, 
            account_id, 
            account_password, 
            account_name, 
            account_server_name, 
            type, 
            host, 
            port, 
            status,
            account_balance, 
            total_pl_amount, 
            win_count, 
            lose_count, 
            history_orders, 
            copier_pl,
            roi,
            account_margin,
            account_profit,
            risk_setting,
            risk_type,
            follow_tp_st,
            force_min_max,
            profit_share_method,
            payment_date,
            permission,
            user_id,
            follow_profit_share_change) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29) 
            RETURNING *`,
          [
            formattedDate,
            token,
            avatar,
            acc_id,
            acc_password,
            acc_name,
            acc_server_name,
            type,
            host,
            port,
            "Nothing",
            0,
            0,
            0,
            0,
            [],
            [],
            0,
            0,
            0,
            0,
            "fixed_lot",
            {
              stop_loss: true,
              take_profit: true
            },
            {},
            "per_hour",
            formattedDate,
            true,
            id,
            "no"
          ]
        );
        const accounts = await getMyAllAccounts(myData.rows[0]);
        await res.status(200).send({ user: myData.rows[0], accounts: accounts });
      }
      else {
        await res.status(201).send("This account had already been registered as master!");
      }
    }
    else {
      await res.status(201).send("This account had already been registered as copier!");
    }
  }
  catch {
    await res.status(501).send("Server Error");
  }
}

/*masters*/

//Get Master Accounts From Database Endpoint
exports.getMastersList = async (req, res) => {
  try {
    const user = req.user;
    const { acc_type, current_page, display_count } = req.body;
    const all_masters = await client.query(
      `SELECT total_pl_amount,
        avatar, 
        account_name, 
        account_id, 
        type, 
        follows, 
        win_count, 
        lose_count, 
        registered_at,
        level,
        profit_share 
        FROM masters`
    );
    const all_metatrader_masters = await client.query(
      `SELECT total_pl_amount,
        avatar, 
        account_name, 
        account_id, 
        type, 
        follows, 
        win_count, 
        lose_count, 
        registered_at,
        level,
        profit_share
        FROM metatrader_masters`
    );
    const all_metatrader5_masters = await client.query(
      `SELECT total_pl_amount,
        avatar, 
        account_name, 
        account_id, 
        type, 
        follows, 
        win_count, 
        lose_count, 
        registered_at,
        level,
        profit_share
        FROM metatrader5_masters`
    );
    if (acc_type === 0) {
      let temp_data = [];
      const display_masters = await client.query(
        `SELECT total_pl_amount,
          avatar, 
          account_name, 
          account_id, 
          type, 
          follows, 
          win_count, 
          lose_count, 
          registered_at,
          level,
          profit_share
          FROM masters`
      );
      for (let i = 0; i < display_masters.rows.length; i++) {
        const one = user?.follow_account?.find(item => item.account_id === display_masters.rows[i].account_id && item.type === display_masters.rows[i].type);
        if (one) display_masters.rows[i].favorite = true;
        else display_masters.rows[i].favorite = false;
      }
      temp_data = temp_data.concat(display_masters.rows);
      const display_metatrader_masters = await client.query(
        `SELECT total_pl_amount,
          avatar, 
          account_name, 
          account_id, 
          type, 
          follows, 
          win_count, 
          lose_count, 
          registered_at,
          level,
          profit_share 
          FROM metatrader_masters`
      );
      for (let i = 0; i < display_metatrader_masters.rows.length; i++) {
        const one = user?.follow_account?.find(item => item.account_id === display_metatrader_masters.rows[i].account_id && item.type === display_metatrader_masters.rows[i].type);
        if (one) display_metatrader_masters.rows[i].favorite = true;
        else display_metatrader_masters.rows[i].favorite = false;
      }
      temp_data = temp_data.concat(display_metatrader_masters.rows);
      const display_metatrader5_masters = await client.query(
        `SELECT total_pl_amount,
          avatar, 
          account_name, 
          account_id, 
          type, 
          follows, 
          win_count, 
          lose_count, 
          registered_at,
          level,
          profit_share
          FROM metatrader5_masters`
      );
      for (let i = 0; i < display_metatrader5_masters.rows.length; i++) {
        const one = user?.follow_account?.find(item => item.account_id === display_metatrader5_masters.rows[i].account_id && item.type === display_metatrader5_masters.rows[i].type);
        if (one) display_metatrader5_masters.rows[i].favorite = true;
        else display_metatrader5_masters.rows[i].favorite = false;
      }
      temp_data = temp_data.concat(display_metatrader5_masters.rows);
      const sortedData = temp_data.sort((a, b) => {
        return new Date(a.registered_at) - new Date(b.registered_at);
      });
      const slicedData = sortedData.slice(current_page * display_count, current_page * display_count + display_count);
      await res.status(200).send({ accounts: slicedData, totalCount: sortedData.length });
    }
    else if (acc_type === 1) {
      let index = 0;
      let temp_data = [];
      const my_masters = all_masters.rows.filter((item) => {
        for (let i = 0; i < user.follow_account?.length; i++) {
          if (user.follow_account[i].type === item.type && user.follow_account[i].account_id === item.account_id) {
            index++;
            if (index > current_page * display_count && index <= (current_page + 1) * display_count) return item;
          }
        }
      });
      temp_data = temp_data.concat(my_masters);
      const my_metatrader_masters = all_metatrader_masters.rows.filter((item) => {
        for (let i = 0; i < user.follow_account?.length; i++) {
          if (user.follow_account[i].type === item.type && user.follow_account[i].account_id === item.account_id) {
            index++;
            if (index > current_page * display_count && index <= (current_page + 1) * display_count) return item;
          }
        }
      });
      temp_data = temp_data.concat(my_metatrader_masters);
      const my_metatrader5_masters = all_metatrader5_masters.rows.filter((item) => {
        for (let i = 0; i < user.follow_account?.length; i++) {
          if (user.follow_account[i].type === item.type && user.follow_account[i].account_id === item.account_id) {
            index++;
            if (index > current_page * display_count && index <= (current_page + 1) * display_count) return item;
          }
        }
      });
      temp_data = temp_data.concat(my_metatrader5_masters);
      const sortedData = temp_data.sort((a, b) => {
        return new Date(a.registered_at) - new Date(b.registered_at);
      });
      const slicedData = sortedData.slice(current_page * display_count, current_page * display_count + display_count);
      await res.status(200).send({ accounts: slicedData, totalCount: index });
    }
    else if (acc_type === 2) {
      let index = 0;
      let temp_data = [];
      const my_master_acc_data = all_masters.rows.filter((item) => {
        for (let i = 0; i < user.masters?.length; i++) {
          if (user.masters[i].type === item.type && user.masters[i].account_id === item.account_id) {
            index++;
            if (index > current_page * display_count && index <= (current_page + 1) * display_count) return item;
          }
        }
      });
      temp_data = temp_data.concat(my_master_acc_data);
      const my_metatrader_master_acc_data = all_metatrader_masters.rows.filter((item) => {
        for (let i = 0; i < user.masters?.length; i++) {
          if (user.masters[i].type === item.type && user.masters[i].account_id === item.account_id) {
            index++;
            if (index > current_page * display_count && index <= (current_page + 1) * display_count) return item;
          }
        }
      });
      temp_data = temp_data.concat(my_metatrader_master_acc_data);
      const my_metatrader5_master_acc_data = all_metatrader5_masters.rows.filter((item) => {
        for (let i = 0; i < user.masters?.length; i++) {
          if (user.masters[i].type === item.type && user.masters[i].account_id === item.account_id) {
            index++;
            if (index > current_page * display_count && index <= (current_page + 1) * display_count) return item;
          }
        }
      });
      temp_data = temp_data.concat(my_metatrader5_master_acc_data);
      const sortedData = temp_data.sort((a, b) => {
        return new Date(a.registered_at) - new Date(b.registered_at);
      });
      const slicedData = sortedData.slice(current_page * display_count, current_page * display_count + display_count);
      await res.status(200).send({ accounts: slicedData, totalCount: index });
    }
  }
  catch {
    await res.status(501).send("Server Error");
  }
}

//Add Master Account to user's followed list Endpoint
exports.addFollowMasterAccount = async (req, res) => {
  try {
    const { type, my_user_id, acc_id } = req.body;
    const new_follower = {
      type: type,
      account_id: acc_id
    }
    const updatedMyData = await client.query(
      `UPDATE users 
        SET follow_account = array_append(follow_account, $1) 
        WHERE id = ${my_user_id}`,
      [
        JSON.stringify(new_follower)
      ]
    )
    if (updatedMyData.rowCount > 0) {
      res.status(200).send("ok");
    }
  }
  catch {
    res.status(501).send("Server Error!");
  }
}

//Remove Master Account from user's followed list Endpoint
exports.removeFollowMasterAccount = async (req, res) => {
  try {
    const { type, my_user_id, acc_id } = req.body;
    const remove_account = {
      type: type,
      account_id: acc_id
    }
    const updatedMyData = await client.query(
      `UPDATE users 
        SET follow_account = array_remove(follow_account, $1) 
        WHERE id = ${my_user_id}`,
      [
        JSON.stringify(remove_account)
      ]
    )
    if (updatedMyData.rowCount > 0) {
      res.status(200).send("ok");
    }
  }
  catch {
    res.status(501).send("Server Error!");
  }
}

exports.upgradeMasterPlan = async (req, res) => {
  try {
    const { type, acc_id, plan, upgradeType } = req.body;
    const table_name = (type === "tld" || type === "tll") ? "masters" : type === "mt4" ? "metatrader_masters" : "metatrader5_masters";
    const level = plan === 1 ? "silver" : plan === 2 ? "gold" : "hero";
    await client.query(
      `UPDATE ${table_name}
      SET level = $1
      WHERE account_id = $2`,
      [
        level,
        acc_id
      ]
    );
    await res.status(200).send("ok");
  }
  catch {
    await res.status(501).send("Server Error!");
  }
}

/*manage master*/
//get Master By Account id
exports.getMasterByAccountId = async (req, res) => {
  try {
    const { accountId, accountType } = req.body;
    const user = req.user;
    const table_name = (accountType === "tld" || accountType === "tll") ? "masters" : accountType === "mt4" ? "metatrader_masters" : "metatrader5_masters";
    const data = await client.query(
      `SELECT * 
      FROM ${table_name}
      WHERE account_id = $1`,
      [
        accountId
      ]
    );
    if (data.rowCount > 0) {
      const limitValue = await client.query(
        `SELECT * FROM level_limit WHERE level = $1`,
        [
          data.rows[0].level ? data.rows[0].level : "basic"
        ]
      );
      data.rows[0].follow_limit = limitValue.rows[0].limit_value;
      const one = user?.follow_account?.find(item => item.account_id === accountId && item.type === accountType);
      if (one) data.rows[0].favorite = true;
      else data.rows[0].favorite = false;
      res.status(200).send(data.rows[0]);
    }
    else {
      res.status(201).send("Database Error!");
    }
  }
  catch {
    res.status(501).send("Sever Error!");
  }
}

//Upload Master Avatar
exports.uploadAvatar = async (req, res) => {
  try {
    const { accountId, type, avatar } = req.body;
    const table_name = (type === "tld" || type === "tll") ? "masters" : type === "mt4" ? "metatrader_masters" : "metatrader5_masters";
    await client.query(
      `UPDATE ${table_name}
        SET avatar = $1
        WHERE account_id = $2`,
      [
        avatar,
        accountId
      ]
    );
    await res.status(200).send("ok");
  }
  catch {
    await res.status(501).send("Server Error!");
  }
}

//Delete Master Avatar

exports.deleteAvatar = async (req, res) => {
  try {
    const { accountId, type } = req.body;
    const table_name = (type === "tld" || type === "tll") ? "masters" : type === "mt4" ? "metatrader_masters" : "metatrader5_masters";
    await client.query(
      `UPDATE ${table_name}
        SET avatar = $1
        WHERE account_id = $2`,
      [
        "",
        accountId
      ]
    );
    await res.status(200).send("ok");
  }
  catch {
    await res.status(501).send("Server Error!");
  }
}

const getCopierUsers = async (master_acc_id, master_acc_type) => {
  const contracts = await client.query(
    `SELECT id,
    user_id,
    copier_acc_type,
    copier_acc_id
    FROM contract
    WHERE master_acc_id = $1
    AND master_acc_type = $2`,
    [
      master_acc_id,
      master_acc_type
    ]
  );
  const copier_users = [];
  for (let i = 0; i < contracts.rowCount; i++) {
    const contract = contracts.rows[i];
    const accountType = contract.copier_acc_type;
    const table_name = (accountType === "tld" || accountType === "tll") ? "copiers" : accountType === "mt4" ? "metatrader_copiers" : "metatrader5_copiers";
    const copier = await client.query(
      `SELECT id,
      user_id,
      account_id,
      follow_profit_share_change
      FROM ${table_name}
      WHERE account_id = $1`,
      [
        contract.copier_acc_id
      ]
    );
    if (copier.rowCount > 0 && copier.rows[0].follow_profit_share_change === 'no') {
      await client.query(
        `UPDATE contract
        SET status = $1
        WHERE id = $2`,
        [
          'Stopped',
          contract.id
        ]
      );
      await client.query(
        `UPDATE ${table_name}
        SET status = $1
        WHERE id = $2`,
        [
          'Stopped',
          copier.rows[0].id
        ]
      )
    }
    if (copier.rowCount > 0) copier_users.push(copier.rows[0]);
  }
  return { copier_users }
}

//Update Master Description
exports.updateMasterDescription = async (req, res) => {
  try {
    const { accountId, accountType, description, profitShare } = req.body;
    const table_name = (accountType === "tld" || accountType === "tll") ? "masters" : accountType === "mt4" ? "metatrader_masters" : "metatrader5_masters";
    const prev_data = await client.query(
      `SELECT profit_share,
      about_me,
      profit_share_update_date
      FROM ${table_name}
      WHERE account_id = $1`,
      [
        accountId
      ]
    );
    const prev_profit_share = prev_data.rows[0].profit_share;
    const prev_description = prev_data.rows[0].about_me;
    const prev_profit_share_update_date = prev_data.rows[0].profit_share_update_date;
    const myDate = new Date();
    const formattedDate = myDate.toISOString();
    const unit = 7 * 24 * 60 * 60 * 1000;
    const stamp = myDate - prev_profit_share_update_date;
    console.log(prev_profit_share?.per_hour, profitShare?.per_hour);
    console.log(prev_description, description);
    if (prev_profit_share?.per_hour === profitShare?.per_hour && prev_description === description) {
      await res.status(201).send("No changes!");
    }
    else {
      if ((unit < stamp) && (profitShare?.per_hour <= 0.1 || (profitShare?.per_hour > 0.1 && profitShare?.per_hour <= prev_profit_share?.per_hour * 1.1))) {
        const updated_data = await client.query(
          `UPDATE ${table_name}
          SET about_me = $1,
          profit_share = $2,
          profit_share_update_date = $3
          WHERE account_id = $4
          RETURNING user_id, account_id, type, account_name`,
          [
            description,
            profitShare,
            formattedDate,
            accountId
          ]
        );
        if (updated_data.rowCount > 0) {
          const myDate = new Date();
          const formattedDate = myDate.toISOString();
          const secret_name = JSON.stringify({
            time: moment(formattedDate).format('YYYY/MM/DD hh:mm:ss A'),
            type: "change_hourly_pay_amount",
            user_id: updated_data.rows[0].user_id,
            to: "master"
          });
          const uniqueId = uuidv5(secret_name, MY_NAMESPACE);
          const messages = await client.query(
            `INSERT INTO notifications
              (id, receiver_id, message, read, time, type)
              VALUES ($1, $2, $3, $4, $5, $6)
              RETURNING *`,
            [
              uniqueId,
              updated_data.rows[0].user_id,
              "You've changed hourly pay amount of Master Account " + updated_data.rows[0].account_name + " from" + prev_profit_share?.per_hour + " to " + profitShare?.per_hour + " at " + moment(formattedDate).format('YYYY/MM/DD hh:mm:ss A'),
              false,
              formattedDate,
              "change_hourly_pay_amount"
            ]
          );
          const { copier_users } = await getCopierUsers(updated_data.rows[0].account_id, updated_data.rows[0].type);
          const io = getSocketInstance();
          if (socketUsers[updated_data.rows[0].user_id]) io.to(updated_data.rows[0].user_id).emit('notification', messages.rows[0]);
          console.log(copier_users)
          copier_users?.map(async (copier, index) => {
            console.log(copier.user_id, socketUsers[copier.user_id]);
            await client.query(
              ``
            )
            const copier_secret_name = JSON.stringify({
              time: moment(formattedDate).format('YYYY/MM/DD hh:mm:ss A'),
              type: "change_hourly_pay_amount",
              user_id: copier.user_id,
              to: "master",
              user_number: index
            });
            const copierUniqueId = uuidv5(copier_secret_name, MY_NAMESPACE);
            const copierMessages = await client.query(
              `INSERT INTO notifications
              (id, receiver_id, message, read, time, type)
              VALUES ($1, $2, $3, $4, $5, $6)
              RETURNING *`,
              [
                copierUniqueId,
                copier.user_id,
                "Hourly pay amount of Master Account " + updated_data.rows[0].account_name + " has been changed " + "from " + prev_profit_share?.per_hour + " to " + profitShare?.per_hour + " at " + moment(formattedDate).format('YYYY/MM/DD hh:mm:ss A'),
                false,
                formattedDate,
                "change_hourly_pay_amount"
              ]
            );
            if (socketUsers[copier.user_id]) io.to(copier.user_id).emit('notification', copierMessages.rows[0]);
          })
          await res.status(200).send("Successfully updated!");
        }
      }
      else {
        await res.status(201).send("Masters can change their prices once a week and can increase them by up to 10% at one time.")
      }
    }
  }
  catch {
    await res.status(501).send("Server Error!");
  }
}

exports.getMasterDescription = async (req, res) => {
  try {
    const { accountId, accountType } = req.body;
    const table_name = (accountType === "tld" || accountType === "tll") ? "masters" : accountType === "mt4" ? "metatrader_masters" : "metatrader5_masters";
    const data = await client.query(
      `SELECT about_me,
      profit_share
      FROM ${table_name}
      WHERE account_id = $1`,
      [
        accountId
      ]
    );
    if (data.rowCount > 0) {
      await res.status(200).send(data.rows[0]);
    }
    else {
      await res.status(201).send("Database Error!");
    }
  }
  catch {
    await res.status(501).send("Server Error!");
  }
}

exports.getFollowCopiersList = async (req, res) => {
  try {
    const { accountId, accountType } = req.body;
    const data = await client.query(
      `SELECT * 
      FROM contract
      WHERE master_acc_id = $1
      AND master_acc_type = $2`,
      [
        accountId,
        accountType
      ]
    );
    if (data.rowCount > 0) {
      let temp = [];
      for (let i = 0; i < data.rowCount; i++) {
        const copierAccType = data.rows[i].copier_acc_type;
        const table_name = (copierAccType === "tld" || copierAccType === "tll") ? "copiers" : copierAccType === "mt4" ? "metatrader_copiers" : "metatrader5_copiers";

        const copierData = await client.query(
          `SELECT avatar,
          account_name,
          type,
          total_pl_amount,
          copier_pl
          FROM ${table_name}
          WHERE account_id = $1`,
          [
            data.rows[i].copier_acc_id,
          ]
        );
        const startDate = data.rows[0].start_date;
        const newDate = new Date();
        const differenceInMs = newDate - startDate;
        const millisecondsInADay = 1000 * 60 * 60 * 24;
        const daysDifference = Math.floor(differenceInMs / millisecondsInADay);
        copierData.rows[0].daysOfFollowing = daysDifference;
        let total_pl = 0;
        copierData.rows[0].copier_pl?.map((item) => {
          if (new Date(item.date) > startDate) {
            total_pl += item.pl;
          }
        });
        delete copierData.rows[0].copier_pl;
        copierData.rows[0].total_pl = total_pl;
        temp.push(copierData.rows[0]);
      }
      await res.status(200).send(temp);
    }
    else {
      await res.status(200).send([]);
    }
  }
  catch {
    await res.status(501).send("Server Error!");
  }
}

/*copiers*/

//Get Tradelocker Copier Account List from Database Function
const getTraderlockerCopiersList = async (copierIds) => {
  let copier_acc_names = [];
  for (let i = 0; i < copierIds.length; i++) {
    if (copierIds[i].type === "tld" || copierIds[i].type === "tll") {
      const copier_acc_name = await client.query(
        `SELECT permission,
        total_pl_amount,
        avatar, 
        account_id, 
        acc_num, 
        account_name, 
        type, 
        my_master_id, 
        my_master_name, 
        my_master_type, 
        status,
        payment_date 
        FROM copiers 
        WHERE account_id = '${copierIds[i].account_id}'`
      );
      const payment_date = new Date(copier_acc_name.rows[0].payment_date); // Convert to Date object

      // Check if payment_date is valid
      if (isNaN(payment_date.getTime())) {
        throw new Error('Invalid payment date');
      }

      // Add 30 days
      payment_date.setDate(payment_date.getDate() + 30);

      // Store the next billing date
      delete copier_acc_name.rows[0].payment_date;
      copier_acc_name.rows[0].next_billing_date = payment_date.toISOString().split('T')[0]; // Format as 'YYYY-MM-DD'
      copier_acc_names.push(copier_acc_name.rows[0]);
    }
  }
  return copier_acc_names;
}

//Get Metatrader4 Copier Account List from Database Function
const getMetatraderCopiersList = async (copierIds) => {
  let copier_acc_names = [];
  for (let i = 0; i < copierIds.length; i++) {
    if (copierIds[i].type === "mt4") {
      const copier_acc_name = await client.query(
        `SELECT permission,
        total_pl_amount,
        avatar, 
        account_id, 
        account_name, 
        type, 
        my_master_id, 
        my_master_name, 
        my_master_type, 
        status,
        payment_date
        FROM metatrader_copiers 
        WHERE account_id = '${copierIds[i].account_id}'`
      );
      const payment_date = new Date(copier_acc_name.rows[0].payment_date); // Convert to Date object

      // Check if payment_date is valid
      if (isNaN(payment_date.getTime())) {
        throw new Error('Invalid payment date');
      }

      // Add 30 days
      payment_date.setDate(payment_date.getDate() + 30);

      // Store the next billing date
      delete copier_acc_name.rows[0].payment_date;
      copier_acc_name.rows[0].next_billing_date = payment_date.toISOString().split('T')[0]; // Format as 'YYYY-MM-DD'
      copier_acc_names.push(copier_acc_name.rows[0]);
    }
  }
  return copier_acc_names;
}

//Get Metatrader5 Copier Account List from Database Function
const getMetatrader5CopiersList = async (copierIds) => {
  let copier_acc_names = [];
  for (let i = 0; i < copierIds.length; i++) {
    if (copierIds[i].type === "mt5") {
      const copier_acc_name = await client.query(
        `SELECT 
        permission,
        total_pl_amount,
        avatar, 
        account_id, 
        account_name, 
        type, 
        my_master_id, 
        my_master_name, 
        my_master_type, 
        status,
        payment_date 
        FROM metatrader5_copiers 
        WHERE account_id = '${copierIds[i].account_id}'`
      );
      const payment_date = new Date(copier_acc_name.rows[0].payment_date); // Convert to Date object

      // Check if payment_date is valid
      if (isNaN(payment_date.getTime())) {
        throw new Error('Invalid payment date');
      }

      // Add 30 days
      payment_date.setDate(payment_date.getDate() + 30);

      // Store the next billing date
      delete copier_acc_name.rows[0].payment_date;
      copier_acc_name.rows[0].next_billing_date = payment_date.toISOString().split('T')[0]; // Format as 'YYYY-MM-DD'
      copier_acc_names.push(copier_acc_name.rows[0]);
    }
  }
  return copier_acc_names;
}

//Get Copier Account List Endpoint
exports.getCopiersList = async (req, res) => {
  try {
    const { user_id } = req.body;
    const copier_data = await client.query(
      `SELECT copiers 
        FROM users
        WHERE id = '${user_id}'`
    );
    const copierIds = copier_data.rows[0].copiers;
    if (copierIds?.length > 0) {
      let copier_acc_names = [];
      const tradelockerCopiers = await getTraderlockerCopiersList(copierIds);
      copier_acc_names = copier_acc_names.concat(tradelockerCopiers);
      const metatraderCopiers = await getMetatraderCopiersList(copierIds);
      copier_acc_names = copier_acc_names.concat(metatraderCopiers);
      const metatrader5Copiers = await getMetatrader5CopiersList(copierIds);
      copier_acc_names = copier_acc_names.concat(metatrader5Copiers);
      await res.status(200).send(copier_acc_names);
    }
    else res.status(200).send([]);
  }
  catch {
    res.status(501).send("Server Error");
  }
}

//Get Master Account List that I follow Endpoint
exports.getMyMastersList = async (req, res) => {
  try {
    const { id } = req.body;
    const myData = await client.query(
      `SELECT * FROM users 
        WHERE id = ${id}`
    )
    if (myData.rowCount > 0) {
      var tempData = [];
      for (let i = 0; i < myData.rows[0].follow_account?.length; i++) {
        const acc_data = myData.rows[0].follow_account[i];
        const table_name = (acc_data.type === "tld" || acc_data.type === "tll") ? "masters" : acc_data.type === "mt4" ? "metatrader_masters" : "metatrader5_masters";
        const oneData = await client.query(
          `SELECT * FROM ${table_name} 
            WHERE account_id = '${acc_data.account_id}'`
        )
        if (oneData.rowCount > 0) {
          tempData.push(oneData.rows[0]);
        }
      }
      await res.status(200).send(tempData);
    }
  }
  catch {
    await res.status(501).send("Server Error");
  }
}

//Start Trading Function
exports.startTradingFunc = async (copier_acc_id, copier_acc_type, master_acc_id, my_master_type) => {
  try {
    await client.query(
      `UPDATE contract 
        SET status = 'Running' 
        WHERE copier_acc_id = $1
        AND copier_acc_type = $2 
        AND master_acc_id = $3
        AND master_acc_type = $4`,
      [
        copier_acc_id,
        copier_acc_type,
        master_acc_id,
        my_master_type
      ]
    );
    const database_name = (copier_acc_type === 'tll' || copier_acc_type === 'tld') ? 'copiers' : copier_acc_type === 'mt4' ? 'metatrader_copiers' : 'metatrader5_copiers';
    await client.query(
      `UPDATE ${database_name} 
        SET status = 'Running' 
        WHERE account_id = '${copier_acc_id}'
        AND type = '${copier_acc_type}'`
    )
    return true;
  }
  catch (err) {
    console.log(err);
    return false;
  }
}

//Start Trading Endpoint
exports.startTrading = async (req, res) => {
  try {
    const balance = req.user.balance;
    const { copier_acc_id, copier_acc_type, master_acc_id, my_master_type } = req.body;
    const master_table_name = (my_master_type === 'tld' || my_master_type === 'tll') ? 'masters' : my_master_type === "mt4" ? 'metatrader_masters' : 'metatrader5_masters';
    const master_acc = await client.query(
      `SELECT profit_share
      FROM ${master_table_name}
      WHERE account_id = $1`,
      [
        master_acc_id
      ]
    );
    const value = parseFloat(master_acc.rows[0].profit_share?.per_hour);
    if (value > balance) await res.status(201).send("Insufficient Balance!");
    else {
      const success = await this.startTradingFunc(copier_acc_id, copier_acc_type, master_acc_id, my_master_type);
      if (success) await res.status(200).send("ok");
    }
  }
  catch {
    await res.status(501).send("Server Error!");
  }
}

//Stop Trading Endpoint
exports.stopTrading = async (req, res) => {
  try {
    const { copier_acc_id, copier_acc_type, master_acc_id, my_master_type } = req.body;
    const contractData = await client.query(
      `UPDATE contract 
        SET status = 'Stopped' 
        WHERE copier_acc_id = $1 
        AND copier_acc_type = $2
        AND master_acc_id = $3
        AND master_acc_type = $4`,
      [
        copier_acc_id,
        copier_acc_type,
        master_acc_id,
        my_master_type
      ]
    );
    if (contractData.rowCount === 0) await res.status(201).send("No Contarct data");
    const database_name = (copier_acc_type === 'tll' || copier_acc_type === 'tld') ? 'copiers' : copier_acc_type === 'mt4' ? 'metatrader_copiers' : 'metatrader5_copiers';
    if (contractData.rowCount > 0) {
      await client.query(
        `UPDATE ${database_name} 
          SET status = 'Stopped' 
          WHERE account_id = '${copier_acc_id}'
          AND type = '${copier_acc_type}'`
      )
      await res.status(200).send("ok");
    }
  }
  catch {
    await res.status(501).send("Server Error!");
  }
}

//Disconnect Copier from Master Endpoint
exports.disconnectMaster = async (req, res) => {
  try {
    const { copier_acc_id, copier_acc_type, master_acc_id, my_master_type } = req.body;
    console.log("Disconnect master", copier_acc_id, copier_acc_type, master_acc_id, my_master_type)
    const deleted_acc = await client.query(
      `DELETE FROM contract 
        WHERE copier_acc_id = $1 
        AND copier_acc_type = $2
        AND master_acc_id = $3
        AND master_acc_type = $4`,
      [
        copier_acc_id,
        copier_acc_type,
        master_acc_id,
        my_master_type
      ]
    );
    if (deleted_acc.rowCount === 0) await res.status(201).send("No Contarct data");
    else {
      const database_name = (copier_acc_type === 'tll' || copier_acc_type === 'tld') ? 'copiers' : copier_acc_type === 'mt4' ? 'metatrader_copiers' : 'metatrader5_copiers';
      const updated_copier_acc = await client.query(
        `UPDATE ${database_name}
          SET status = $1, 
          my_master_name = $2, 
          my_master_id = $3, 
          my_master_type = $4 
          WHERE account_id = '${copier_acc_id}'
          AND type = '${copier_acc_type}'`,
        [
          "Nothing",
          "",
          "",
          ""
        ]
      );
      if (updated_copier_acc.rowCount > 0) {
        const master_database_name = (my_master_type === 'tll' || my_master_type === 'tld') ? 'masters' : my_master_type === 'mt4' ? 'metatrader_masters' : 'metatrader5_masters';
        const history_name = (my_master_type === 'tll' || my_master_type === 'tld') ? 'history_positions' : 'history_orders';
        await client.query(
          `UPDATE ${master_database_name} 
            SET follows = follows - 1, 
            ${history_name} = $1 
            WHERE account_id = '${master_acc_id}'
            AND type = '${my_master_type}'`,
          [
            []
          ]
        );
        await res.status(200).send("ok");
      }
    }
  }
  catch {
    await res.status(501).send("Server Error!");
  }
}

/*copiers action*/

//Add Master to Follow Master Endpoint
exports.addMyMaster = async (req, res) => {
  try {
    const { copier_acc_id, copier_type, master_acc_id, master_type, action_type } = req.body;
    const master_table_name = (master_type === 'tld' || master_type === 'tll') ? 'masters' : master_type === "mt4" ? 'metatrader_masters' : 'metatrader5_masters';
    const copier_table_name = (copier_type === 'tld' || copier_type === 'tll') ? 'copiers' : copier_type === "mt4" ? 'metatrader_copiers' : 'metatrader5_copiers';
    const master_data = (master_type === 'tld' || master_type === 'tll') ? await client.query(
      `SELECT follows, 
        account_name, 
        acc_num,
        level 
        FROM ${master_table_name} 
        WHERE account_id = '${master_acc_id}'`
    ) : await client.query(
      `SELECT follows, 
        account_name,
        level
        FROM ${master_table_name} 
        WHERE account_id = '${master_acc_id}'`
    );

    const copier_data = (copier_type === 'tld' || copier_type === 'tll') ? await client.query(
      `SELECT acc_num, 
        my_master_id 
        FROM ${copier_table_name} 
        WHERE account_id = '${copier_acc_id}'`
    ) : await client.query(
      `SELECT my_master_id 
        FROM ${copier_table_name} 
        WHERE account_id = '${copier_acc_id}'`
    );
    if (copier_data.rows[0].my_master_id === master_acc_id) {
      res.status(201).send("This account had already been set up to the master account.!");
      return;
    }
    const level_limit = await client.query(
      `SELECT * FROM level_limit`
    );
    let limit_value = 2;
    level_limit.rows.map((row) => {
      if (row.level === master_data.rows[0].level) limit_value = row.limit_value;
    });
    const myDate = new Date();
    const formattedDate = myDate.toISOString();
    if (action_type === "new") {
      if (master_data.rows[0].follows < limit_value) {
        await client.query(
          `UPDATE ${copier_table_name} 
            SET my_master_id = '${master_acc_id}', 
            my_master_name = '${master_data.rows[0].account_name}', 
            my_master_type = '${master_type}', 
            status = 'Connected' 
            WHERE account_id = '${copier_acc_id}'`
        );
        await client.query(
          `UPDATE ${master_table_name} 
            SET follows = follows + 1 
            WHERE account_id = '${master_acc_id}'`
        );
        const updatedContract = await client.query(
          `INSERT INTO contract 
            (copier_acc_id, 
            copier_acc_num, 
            copier_acc_type, 
            master_acc_id, 
            master_acc_num, 
            master_acc_type, 
            status,
            start_date,
            run_time,
            pay_history,
            user_id) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
            RETURNING *`,
          [
            copier_acc_id,
            (copier_type === 'tld' || copier_type === 'tll') ? copier_data.rows[0].acc_num : -1,
            copier_type,
            master_acc_id,
            (master_type === 'tld' || master_type === 'tll') ? master_data.rows[0].acc_num : -1,
            master_type,
            "Connected",
            formattedDate,
            0,
            [],
            req.user.id
          ]
        );
        if (updatedContract.rowCount > 0) await res.status(200).send("Your copier conection changed to another master.!");
      }
      else {
        res.status(201).send("The master account you have selected cannot be connected with your copier account due to the current follower limit being reached at 5 accounts.");
      }
    }
    else if (action_type === "change") {
      if (master_data.rows[0].follows < limit_value) {
        const old_data = await client.query(
          `SELECT my_master_id,
            my_master_type
            FROM ${copier_table_name}
            WHERE account_id = '${copier_acc_id}'`
        );
        await client.query(
          `UPDATE ${copier_table_name} 
            SET my_master_id = '${master_acc_id}', 
            my_master_name = '${master_data.rows[0].account_name}', 
            my_master_type = '${master_type}', 
            status = 'Connected' 
            WHERE account_id = '${copier_acc_id}'`
        );
        const old_master_table_name = (old_data.rows[0].my_master_type === 'tld' || old_data.rows[0].my_master_type === 'tll') ? 'masters' : old_data.rows[0].my_master_type === "mt4" ? 'metatrader_masters' : 'metatrader5_masters';
        await client.query(
          `UPDATE ${old_master_table_name} 
            SET follows = follows - 1 
            WHERE account_id = '${old_data.rows[0].my_master_id}'`
        );
        await client.query(
          `UPDATE ${master_table_name} 
            SET follows = follows + 1 
            WHERE account_id = '${master_acc_id}'`
        );
        await client.query(
          `UPDATE contract  
            SET master_acc_id = $1, 
            master_acc_num = $2,
            master_acc_type = $3,
            start_date = $4,
            status = $5,
            run_time = $6,
            pay_history = $7,
            user_id = $8
            WHERE copier_acc_id = $9
            AND copier_acc_type = $10`,
          [
            master_acc_id,
            (master_type === 'tld' || master_type === 'tll') ? master_data.rows[0].acc_num : -1,
            master_type,
            formattedDate,
            'Connected',
            0,
            [],
            req.user.id,
            copier_acc_id,
            copier_type,
          ]
        );
        await res.status(200).send("Your copier has been connected to your master. Now you can start copy trading!");
      }
      else {
        res.status(201).send(`The master account you have selected cannot be connected with your copier account due to the current follower limit being reached at ${limit_value} accounts.`);
      }
    }
  }
  catch {
    await res.status(501).send("Server Error!");
  }
}

/*manage copier*/

exports.getCopierByAccountId = async (req, res) => {
  try {
    const { accountId, accountType } = req.body;
    const table_name = (accountType === 'tld' || accountType === 'tll') ? 'copiers' : accountType === "mt4" ? 'metatrader_copiers' : 'metatrader5_copiers';
    const data = await client.query(
      `SELECT account_id,
      type,
      account_name,
      follow_tp_st,
      risk_type,
      risk_setting,
      force_min_max,
      my_master_name,
      profit_share_method
      FROM ${table_name}
      WHERE account_id = $1`,
      [
        accountId
      ]
    );
    const copier_data = await client.query(
      `SELECT master_acc_id,
      master_acc_type 
      FROM contract
      WHERE copier_acc_id = $1
      AND copier_acc_type = $2`,
      [
        accountId,
        accountType
      ]
    );
    if (copier_data.rowCount > 0) {
      const master_table_name = (copier_data.rows[0].master_acc_type === 'tld' || copier_data.rows[0].master_acc_type === 'tll') ? 'masters' : copier_data.rows[0].master_acc_type === "mt4" ? 'metatrader_masters' : 'metatrader5_masters';
      const profit_share = await client.query(
        `SELECT profit_share
        FROM ${master_table_name}
        WHERE account_id = $1`,
        [
          copier_data.rows[0].master_acc_id,
        ]
      );
      await res.status(200).send({ data: data.rows[0], profit_share: profit_share.rows[0].profit_share });
    }
  }
  catch {
    res.status(501).send("Server Error!");
  }
}

exports.updateProfitShareMethod = async (req, res) => {
  try {
    const { account_id, type, profit_share_method, follow_profit_share_change } = req.body;
    const table_name = (type === 'tld' || type === 'tll') ? 'copiers' : type === "mt4" ? 'metatrader_copiers' : 'metatrader5_copiers';
    const update_data = await client.query(
      `UPDATE ${table_name}
      SET profit_share_method = $1,
      follow_profit_share_change = $2
      WHERE account_id = $3
      RETURNING account_id,
        type,
        follow_tp_st,
        risk_type,
        force_min_max,
        risk_setting,
        account_name,
        my_master_name,
        profit_share_method`,
      [
        profit_share_method,
        follow_profit_share_change,
        account_id
      ]
    );
    if (update_data.rowCount > 0) {
      res.status(200).send(update_data.rows[0]);
    }
  }
  catch {
    await res.status(501).send("Server Error!");
  }
}

exports.updateCopierRiskSettings = async (req, res) => {
  try {
    const { accountId,
      accountType,
      riskType,
      riskSetting,
      isForceMax,
      isForceMin,
      forceMaxValue,
      forceMinValue,
      isLotRefine,
      lotRefineSize,
    } = req.body;
    const forceMinMax = {
      force_max: isForceMax,
      force_min: isForceMin,
      force_max_value: forceMaxValue,
      force_min_value: forceMinValue,
      lot_refine: isLotRefine,
      lot_refine_size: lotRefineSize,
    }
    const table_name = (accountType === 'tld' || accountType === 'tll') ? 'copiers' : accountType === "mt4" ? 'metatrader_copiers' : 'metatrader5_copiers';
    const update_data = await client.query(
      `UPDATE ${table_name}
        SET risk_type = $1,
        force_min_max = $2,
        risk_setting = $3
        WHERE account_id = $4
        RETURNING account_id,
          type,
          follow_tp_st,
          risk_type,
          force_min_max,
          risk_setting,
          account_name,
          my_master_name,
          profit_share_method`,
      [
        riskType,
        forceMinMax,
        riskSetting,
        accountId,
      ]
    );
    if (update_data.rowCount > 0) {
      res.status(200).send(update_data.rows[0]);
    }
    else {
      res.status(201).send("Database insert error!")
    }
  }
  catch {
    res.status(501).send("Server Error!");
  }
}

exports.updateCopierPositionSettings = async (req, res) => {
  try {
    const {
      accountId,
      accountType,
      takeProfit,
      stopLoss,
      fixedStopLoss,
      fixedTakeProfit,
      fixedStopLossSize,
      fixedTakeProfitSize,
      stopLossRefinement,
      takeProfitRefinement,
      stopLossRefinementSize,
      takeProfitRefinementSize
    } = req.body;
    const follow_tp_st = {
      stop_loss: stopLoss === 0 ? true : false,
      take_profit: takeProfit === 0 ? true : false,
      fixed_stop_loss: fixedStopLoss === 0 ? true : false,
      fixed_take_profit: fixedTakeProfit === 0 ? true : false,
      fixed_stop_loss_size: fixedStopLossSize,
      fixed_take_profit_size: fixedTakeProfitSize,
      stop_loss_refinement: stopLossRefinement === 0 ? true : false,
      take_profit_refinement: takeProfitRefinement === 0 ? true : false,
      stop_loss_refinement_size: stopLossRefinementSize,
      take_profit_refinement_size: takeProfitRefinementSize,
    }
    const table_name = (accountType === 'tld' || accountType === 'tll') ? 'copiers' : accountType === "mt4" ? 'metatrader_copiers' : 'metatrader5_copiers';
    const update_data = await client.query(
      `UPDATE ${table_name}
      SET follow_tp_st = $1
      WHERE account_id = $2
      RETURNING account_id,
        type,
        follow_tp_st,
        risk_type,
        force_min_max,
        risk_setting,
        account_name,
        my_master_name,
        profit_share_method`,
      [
        follow_tp_st,
        accountId
      ]
    );
    if (update_data.rowCount > 0) {
      res.status(200).send(update_data.rows[0]);
    }
    else {
      res.status(201).send("Database insert error!");
    }
  }
  catch {
    res.status(501).send("Server Error!");
  }
}

/*billing*/

//Get Transaction History Endpoint
exports.getTransactionHistory = async (req, res) => {
  try {
    const user = req.user;
    const { current_page, display_count } = req.body;
    const transactionHistory = user.transaction_history;
    const filetered_data = transactionHistory?.filter((history, index) => {
      if (index >= current_page * display_count && index < (current_page + 1) * display_count) return history;
    })
    res.status(200).send({ transactionHistory: filetered_data?.length ? filetered_data : [], transactionCount: transactionHistory?.length ? transactionHistory.length : 0 });
  }
  catch {
    res.status(501).send("failed");
  }
}

exports.getTradingHistory = async (req, res) => {
  try {
    const user = req.user;
    const { current_page, display_count } = req.body;
    const tradingHistory = user.trading_history;
    const filtered_data = tradingHistory?.filter((history, index) => {
      if (index >= current_page * display_count && index < (current_page + 1) * display_count) return history;
    });
    res.status(200).send({ tradingHistory: filtered_data?.length ? filtered_data : [] , tradingCount: tradingHistory?.length ? tradingHistory.length : 0})
  }
  catch {
    await res.status(501).send("failed");
  }
}

exports.getCopierTradingHistory = async (req, res) => {
  try {
    const { current_page, display_count, copier_acc_id, copier_acc_type } = req.body;
    console.log(current_page, display_count, copier_acc_id, copier_acc_type )
    const contract = await client.query(
      `SELECT pay_history
      FROM contract
      WHERE copier_acc_id = $1
      AND copier_acc_type = $2`,
      [
        copier_acc_id,
        copier_acc_type
      ]
    );
    const tradingHistory = contract.rows[0]?.pay_history;
    console.log(tradingHistory)
    const filtered_data = tradingHistory?.filter((history, index) => {
      if (index >= current_page * display_count && index < (current_page + 1) * display_count) return history;
    });
    console.log(filtered_data)
    res.status(200).send({ tradingHistory: filtered_data?.length ? filtered_data : [] , tradingCount: tradingHistory?.length ? tradingHistory.length : 0})
  }
  catch {
    await res.status(501).send("failed");
  }
}