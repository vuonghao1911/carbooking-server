// const { Sequelize } = require("sequelize");

// // Option 1: Passing a connection URI

// // Option 3: Passing parameters separately (other dialects)
// const sequelize = new Sequelize("Jwt", "sa", "1234", {
//   host: "localhost",
//   dialect: "mssql",
//   //   options: {
//   //     encrypt: false,
//   //     enableArithAbort: false,
//   //   },
//   dialectOptions: {
//     // options: {
//     //   encrypt: true,
//     //   instanceName: "SQLEXPRESS",
//     // },
//     port: 1433,
//     pool: {
//       max: 5,
//       min: 0,
//       idle: 10000,
//     },
//   },
// });

// let connectDB = async () => {
//   try {
//     await sequelize.authenticate();
//     console.log("Connection has been established successfully.");
//   } catch (error) {
//     console.error("Unable to connect to the database:", error);
//   }
// };
// sequelize.sync();

// module.exports = { connectDB: connectDB, sequelize: sequelize };
