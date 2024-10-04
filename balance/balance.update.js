const client = require("../config/db/db.js");

//Update User Balance of Database based on new currency price Function
const updateBalance = async () => {
  console.log("start ---------------------> update balance");
  const users = await client.query(
    `SELECT id, 
      balance, 
      transaction_history 
      FROM users`
  );
  if (users.rowCount === 0) return;

  const promises = users.rows.map(async (user) => {
    const transaction_history = user.transaction_history;
    let balance = 0;
    if (transaction_history) {
      transaction_history?.map((history) => {
        const amount = history.amount;
        const type = history.type;
        const status = history.status;
        if (status === 'pending') return;
        if (type === "Charge") balance += amount;
        if (type === "Withdraw") balance -= amount;
      });
    }
    await client.query(
      `UPDATE users 
        SET balance = $1 
        WHERE id = '${user.id}'`,
      [
        balance > 0 ? balance : 0
      ]
    )
  });

  await Promise.all(promises);
}

module.exports = { updateBalance }