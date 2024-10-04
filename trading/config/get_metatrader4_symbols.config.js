const client = require("../../config/db/db.js");
const { metatrader4Axios } = require("./metatrader4.config.js");

const getMetatraderSymbols = async () => {
  const token = 'dbce470f-47e3-47da-a8af-4ed7ca56e695';
  await metatrader4Axios.get(`/Symbols?id=${token}`)
    .then(async (res) => {
      if (res.statusText === "OK") {
        console.log(res.data.length);
        const data = await client.query(
          `SELECT * FROM metatrader4_symbols`
        );
        const last_symbol = data.rows.length > 0 ? data.rows[data.rows.length - 1] : "";
        let flag = last_symbol ? false : true;
        for (let i = 0; i < res.data.length; i++) {
          if (last_symbol?.symbol === res.data[i]) { flag = true; continue }
          if (flag === false) continue;
          await metatrader4Axios.get(`/SymbolParams`, {
            params: {
              id: token,
              symbol: res.data[i]
            }
          }).then(async (info) => {
            if (info.statusText === "OK") {
              await client.query(
                `INSERT INTO metatrader4_symbols (symbol, pip_value) VALUES ($1, $2)`,
                [
                  res.data[i],
                  info.data.symbol.point
                ]
              );
              console.log(res.data[i], info.data.symbol.point)
            }
          }).catch((error) => {
            console.log(error);
          })
        }
      }
    })
    .catch((err) => {
      console.log(err)
    })
  console.log("finished")
}

getMetatraderSymbols();