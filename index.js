const express = require("express");
const app = express();
const cors = require("cors");
const port = 3000;
const http = require("http");
const https = require("https");
var bodyParser = require("body-parser");
//const serverTest = http.createServer(app);
const server = https.createServer(app);
const axios = require("axios"); // npm install axios
const CryptoJS = require("crypto-js"); // npm install crypto-js
const moment = require("moment"); // npm install moment
const qs = require("qs");
require("dotenv").config();
const handleEror = require("./src/middleware/handleEror");

//const { connectDB } = require("./src/config/configDb");
const connectMG = require("./src/config/configMg");
var Sequelize = require("sequelize");
const routes = require("./src/routes");

// import model
var User = require("./src/modal/User");
var Customer = require("./src/modal/Customer");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use((req, res, next) => {
  res.header({ "Access-Control-Allow-Origin": "*" });
  next();
});
//connectDB();
connectMG();
routes(app);
let dataZalo = {};
app.get("/", (req, res) => {
  res.json({ test: "Hello World 1313!" });
});

app.post("/zalopay", (request, response) => {
  let totalMoney = request.body.totalMoney;
  const config = {
    app_id: "2553",
    key1: "PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL",
    key2: "kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz",
    endpoint: "https://sb-openapi.zalopay.vn/v2/create",
  };
  const embed_data = {
    columninfo: {
      branch_id: "HCM",

      store_name: "Saigon Centre",
    },
  };
  const items = [{}];
  const transID = Math.floor(Math.random() * 1000000);
  const order = {
    app_id: config.app_id,
    app_trans_id: `${moment().format("YYMMDD")}_${transID}`,
    app_user: "user123",
    app_time: Date.now(), // miliseconds
    item: JSON.stringify(items),
    embed_data: JSON.stringify(embed_data),
    amount: Number(totalMoney),
    description: `Thanh toan ve ${moment().format("YYMMDD")}_${transID}`,
    bank_code: "",
    title: "thanh toan ve #123455323432",
    redirecturl: "http://localhost:3000/",
  };
  const data =
    config.app_id +
    "|" +
    order.app_trans_id +
    "|" +
    order.app_user +
    "|" +
    order.amount +
    "|" +
    order.app_time +
    "|" +
    order.embed_data +
    "|" +
    order.item;
  order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();
  axios
    .post(config.endpoint, null, { params: order })
    .then((res) => {
      console.log(res);
      response.json({
        zalo: res.data,
        appTransId: order.app_trans_id,
        appTime: order.app_time,
      });
    })
    .catch((err) => console.log(err));
});

app.post("/getStatusOrderZalopay", (req, res) => {
  let appTransId = req.body.appTransId;
  let appTime = req.body.appTime;
  let customer = req.body.customer;
  const config = {
    app_id: "2553",
    key1: "PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL",
    key2: "kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz",
    endpoint: "https://sb-openapi.zalopay.vn/v2/query",
  };
  let postData = {
    app_id: config.app_id,
    app_trans_id: appTransId, // Input your app_trans_id
  };
  let data = postData.app_id + "|" + postData.app_trans_id + "|" + config.key1; // appid|app_trans_id|key1
  postData.mac = CryptoJS.HmacSHA256(data, config.key1).toString();
  let postConfig = {
    method: "post",
    url: config.endpoint,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: qs.stringify(postData),
  };
  const check = setInterval(() => {
    axios(postConfig)
      .then(function (response) {
        if (response.data.return_code === 1) {
          clearInterval(check);
          axios
            .post("http://localhost:5005/tickets/booking", customer)
            .then(function (response) {
              console.log(response);
            })
            .catch(function (error) {
              console.log(error);
            });
        } else if (Date.now() > appTime + 15 * 60 * 1000) clearInterval(check);
        console.log(response.data);
      })
      .catch(function (error) {
        console.log(error);
      });
  }, 15000);
});

// app.get("/user", async (req, res) => {
//   const response = await User.findAll()
//     .then(function (data) {
//       const res = { success: true, data: data };
//       return res;
//     })
//     .catch((error) => {
//       const res = { success: false, error: error };
//       return res;
//     });
//   res.json(response);
// });
///sdfsfffffklkkkkkkfsdfsdfsd
app.listen(5005, () => {
  console.log("Example app listening on http://localhost:" + 5005);
});
//var date = new Date("2023-01-03T09:00:00.000Z");
// var date = "October 13";
// var year = "2044";

// const endTime = new Date(`${date},${year} 04:00`);
// endTime.setTime(5 * 3600);
// console.log("sdfsf", endTime.toString());
// server.listen(5005, () => {
//   console.log("Example app listening on https://localhost:" + 5005);
// });
