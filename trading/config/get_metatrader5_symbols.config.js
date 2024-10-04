const client = require("../../config/db/db.js");
const { metatrader5Axios } = require("./metatrader5.config.js");

const getMetatrader5Symbols = async () => {
  const token = '1dae80d2-2a1c-4105-9b27-a0ef6c421511';
  await metatrader5Axios.get(`/SymbolList?id=${token}`)
    .then(async (res) => {
      if (res.statusText === "OK") {
        const data = await client.query(
          `SELECT * FROM metatrader5_symbols`
        );
        console.log(res.data.length);
        const last_symbol = data.rows.length > 0 ? data.rows[data.rows.length - 1] : "";
        let flag = last_symbol ? false : true;
        // for (let i = 0; i < res.data.length; i++) {
        //   if (last_symbol && last_symbol?.symbol === res.data[i]) { flag = true; continue; }
        //   if (flag === false) continue;
        //   await metatrader5Axios.get(`/SymbolParams`, {
        //     params: {
        //       id: token,
        //       symbol: res.data[i]
        //     }
        //   }).then(async (info) => {
        //     if (info.statusText === "OK") {
        //       await client.query(
        //         `INSERT INTO metatrader5_symbols (symbol, pip_value) VALUES ($1, $2)`,
        //         [
        //           res.data[i],
        //           info.data.symbolInfo.points
        //         ]
        //       );
        //       console.log(res.data[i], info.data.symbolInfo.points);
        //     }
        //   })
        // }
      }
    });
  console.log("finished")
}

getMetatrader5Symbols();