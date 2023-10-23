const TeleBot = require("telebot");
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
require("dotenv").config();

// Instantiate Telebot with your Telegram token
const bot = new TeleBot({
  token: process.env.TOKEN,
});

// Create an Express.js web server
const app = express();

// Parse JSON requests
app.use(bodyParser.json());

// Define a route that listens for POST requests
app.post("/send-message", async (req, res) => {

  if (req.header("key") != process.env.KEY) {
    return res.status(500).json({
      success: false,
      message: "Invalid API access KEY",
    });
  }
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(500).json({
        success: false,
        message: "The attribute 'message' cannot be empty",
      });
    }

    // Send a message to the specified chat ID
    await bot.sendMessage(process.env.GROUP_ID, message, { parse_mode: 'MarkdownV2' });

    // Respond to the HTTP request
    res
      .status(200)
      .json({ success: true, message: "Success sending message!" });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ success: false, message: "Error sending message" });
  }
});

//our command
bot.on(["/status"], (msg) => {
  const url = process.env.ZABBIX_URL;
  const user = process.env.ZABBIX_USER;
  const password = process.env.ZABBIX_PASSWORD;
  const body = {
    jsonrpc: "2.0",
    method: "user.login",
    params: {
      user: user,
      password: password,
    },
    id: 1,
  };
  
  // ? Realizando a requisicao
  axios.post(url, body).then((response) => {
    const hostid = process.env.HOSTIDS;
    const body = {
      jsonrpc: "2.0",
      method: "item.get",
      params: {
        output: ["name", "lastvalue", "key_"],
        hostids: hostid,
        search: {
          key_: [
            "upsAdvInputVoltage",
            "upsAdvOutputVoltage",
            "upsAdvBatteryCapacity",
            "upsBasicBatteryTimeOnBattery",
            "upsBasicBatteryStatus",
          ],
        },
        sortfield: "name",
        searchByAny: true,
      },
      auth: response.data.result,
      id: 1,
    };
    // ? Realizando a requisicao
    axios.post(url, body).then((response) => {
      //console.log(response.data.result);
      const message =
        "Bateria: " +
        response.data.result[0].lastvalue +
        "%\n" +
        "Status: " +
        ((response.data.result[1].lastvalue == "2")
          ? "OK\n"
          : "Anomalia\n") +
            "Input: " +
            response.data.result[2].lastvalue +
            "v\n" +
            "Output: " +
            response.data.result[3].lastvalue +
            "v\n" +
            "TempoNaBateria: " +
            response.data.result[4].lastvalue +
            "s\n";

      bot.sendMessage(process.env.GROUP_ID, `${message}`);
    });
  });
  //all the information about user will come with the msg
});

// Start polling
bot.start();

// Start the Express server on port 3000 (or any other port you prefer)
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
