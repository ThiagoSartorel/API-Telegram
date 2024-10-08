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

// Start polling
bot.start();

// Start the Express server on port 3000 (or any other port you prefer)
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
