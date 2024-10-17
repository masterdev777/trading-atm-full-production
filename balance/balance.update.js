const client = require("../config/db/db.js");

//Update User Balance of Database based on new currency price Function
const updateBalance = async (io, socketUsers) => {
  try {
    console.log("start ---------------------> update balance");
    const users = await client.query(
      `SELECT id, 
        balance, 
        transaction_history,
        trading_history
        FROM users`
    );
    if (users.rowCount === 0) return;

    const promises = users.rows.map(async (user) => {
      const transaction_history = user.transaction_history;
      const trading_history = user.trading_history;
      let balance = 0;
      if (transaction_history) {
        transaction_history?.map((history) => {
          const amount = history.amount;
          const type = history.type;
          const status = history.status;
          if (status === 'pending') return;
          if (type === "Charge") balance += amount;
          if (type === "Withdraw") balance -= amount;
          if (type === "Subscription") balance -= amount;
          if (type === "Upgrade" || type === "Downgrade") balance -= amount;
        });
      }
      if (trading_history) {
        trading_history?.map((history) => {
          const amount = history.amount;
          const type = history.type;
          if (type === 'copier_trade')balance -= amount;
          else if (type === 'master_trade') balance += amount;
        });
      }
      await client.query(
        `UPDATE users 
          SET balance = $1 
          WHERE id = '${user.id}'`,
        [
          balance
        ]
      );
      if (socketUsers[user.id]) {
        const data = {
          balance: balance,
          messages: ""
        }
        io.to(user.id).emit("update_balance", data);
      }
    });

    await Promise.all(promises);
  }
  catch {
    return;
  }
}

module.exports = { updateBalance }