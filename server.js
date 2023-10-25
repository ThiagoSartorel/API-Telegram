const TeleBot = require("telebot");
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const https = require('https');
require("dotenv").config();

const agent = new https.Agent({  
  rejectUnauthorized: false
});

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
  console.log("Mensagem de /status recebida!");
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
  console.log("Autenticado!");
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
        console.log("Dados coletados!");
        // Processar a resposta com sucesso
        const message = "Bateria: " + response.data.result[0].lastvalue + "%\n" +
          "Status: " + ((response.data.result[1].lastvalue == "2") ? "OK\n" : "Anomalia\n") +
          "Input: " + response.data.result[2].lastvalue + "v\n" +
          "Output: " + response.data.result[3].lastvalue + "v\n" +
          "TempoNaBateria: " + response.data.result[4].lastvalue + "s\n";

        console.log("Enviando mensagem!");
        bot.sendMessage(process.env.GROUP_ID, `${message}`);
        console.log("Mensagem enviada!");
      })
      .catch((error) => {
        // Tratar erros aqui
        bot.sendMessage(process.env.GROUP_ID, `Não foi possives e comunicar com o NOBREAK, tente novamente mais tade!`);
        console.error("Ocorreu um erro na requisição:", error);
      });
  }).catch((error) => {
    // Tratar erros aqui
    bot.sendMessage(process.env.GROUP_ID, `Não foi possives e comunicar com o NOBREAK, tente novamente mais tade!`);
    console.error("Ocorreu um erro na requisição:", error);
  });;
  //all the information about user will come with the msg
});

bot.on(["/laststatus"], (msg) => {
  console.log("Mensagem de /laststatus recebida!");

  const url = process.env.NOBREAK_API_URL;
  console.log(process.env.NOBREAK_API_URL);

  // Realizando a requisi��o
  axios.get(url, { httpsAgent: agent })
    .then((response) => {
      console.log("Dados coletados!");
      const date = new Date(response.data.created_at);
      date.setHours(date.getHours() - 3)
      const message = "Bateria: " + response.data.battery + "%\n" +
        "Status: " + ((response.data.battery_status == "2") ? "OK\n" : "Anomalia\n") +
        "Input: " + response.data.input_voltage + "v\n" +
        "Output: " + response.data.output_voltage + "v\n" +
        "TempoNaBateria: " + response.data.time_on_battery + "s\n" +
        "HoraColeta: " + date.toLocaleString('pt-BR', { timeZone: 'UTC' });

      console.log("Enviando mensagem!");
      bot.sendMessage(process.env.GROUP_ID, `${message}`);
      console.log("Mensagem enviada!");
    })
    .catch((error) => {
      // Tratar erros aqui
      bot.sendMessage(process.env.GROUP_ID, "N�o foi poss�vel se comunicar com a API-NOBREAK, tente novamente mais tarde!");
      console.error("Ocorreu um erro na requisi��o:", error);
    });
  // Todas as informa��es sobre o usu�rio vir�o com o msg
});

// Start polling
bot.start();

// Start the Express server on port 3000 (or any other port you prefer)
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
