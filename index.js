const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http");
const https = require("https");
var bodyParser = require("body-parser");
//const serverTest = http.createServer(app);
const server = http.createServer(app);
require("dotenv").config();
const path = require("path");
const handleEror = require("./src/middleware/handleEror");
const fs = require("fs");
//const { connectDB } = require("./src/config/configDb");
const connectMG = require("./src/config/configMg");
const routes = require("./src/routes");

const cert = fs.readFileSync(path.resolve("ssl/certificate.crt"));

const key = fs.readFileSync(path.resolve("ssl/private.key"));

const options = {
  key: key,
  cert: cert,
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use((req, res, next) => {
  res.header({ "Access-Control-Allow-Origin": "*" });
  // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const httpsServer = https.createServer(options, app);

//connectDB();
connectMG();
routes(app);
app.use(handleEror);

app.get("/", (req, res) => {
  res.json({ test: "Hello World 123 !" });
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

server.listen(5005, () => {
  console.log("Example app listening on http://localhost:" + 5005);
});

// httpsServer.listen(4004, () => {
//   console.log("Example app listening on http://localhost:" + 4004);
// });
