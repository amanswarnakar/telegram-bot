require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const schedule = require("node-schedule");
const axios = require("axios");

const token = process.env.TELEGRAM_API_TOKEN;

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/echo (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const resp = match[1];
  bot.sendMessage(chatId, resp);
});

var chatIds = [];

const job = schedule.scheduleJob("0 * * * *", async () => {
  const query = "Delhi";
  const url =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    query +
    "&units=metric&appid=" +
    process.env.WEATHER_API;
  let ret = "";
  await axios
    .get(url)
    .then((res) => {
      const temp = res.data.main.temp;
      const weatherDescription = res.data.weather[0].description;
      const humidity = res.data.main.humidity;
      const temp_min = res.data.main.temp_min;
      const temp_max = res.data.main.temp_max;
      ret =
        "You are receiving hourly weather updates of Delhi.\n\n" +
        "The temperatue at " +
        query[0].toUpperCase() +
        query.substring(1) +
        " is " +
        temp +
        "°C.\nWeather Discription: " +
        weatherDescription[0].toUpperCase() +
        weatherDescription.substring(1) +
        "\nHumidity: " +
        humidity +
        "%\nMinimum Temperature: " +
        temp_min +
        "°C\nMaximum Temperature: " +
        temp_max +
        "°C";
    })
    .catch((err) => {
      console.log(err.response.data);
      if (err.response.data.message === "city not found" || err.response.data.cod === "404")
        bot.sendMessage(chatId, "City not found.");
    });
  chatIds.map((e) => {
    bot.sendMessage(e, ret);
  });
});

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  chatIds.push(chatId);
  const query = msg.text;
  if (query === "/start") {
    bot.sendMessage(
      chatId,
      "Welcome to the weather bot.\n\nType a city name to get the weather details.\n\nIn addition to that, you will receive hourly weather updates of Delhi."
    );
  } else {
    const url =
      "https://api.openweathermap.org/data/2.5/weather?q=" +
      query +
      "&units=metric&appid=" +
      process.env.WEATHER_API;

    await axios
      .get(url)
      .then((res) => {
        const temp = res.data.main.temp;
        const weatherDescription = res.data.weather[0].description;
        const humidity = res.data.main.humidity;
        const temp_min = res.data.main.temp_min;
        const temp_max = res.data.main.temp_max;
        const ret =
          "The temperatue at " +
          query[0].toUpperCase() +
          query.substring(1) +
          " is " +
          temp +
          "°C.\nWeather Discription: " +
          weatherDescription[0].toUpperCase() +
          weatherDescription.substring(1) +
          "\nHumidity: " +
          humidity +
          "%\nMinimum Temperature: " +
          temp_min +
          "°C\nMaximum Temperature: " +
          temp_max +
          "°C";

        bot.sendMessage(chatId, ret);
      })
      .catch((err) => {
        console.log(err.response.data);
        if (err.response.data.message === "city not found" || err.response.data.cod === "404")
          bot.sendMessage(chatId, "City not found.");
      });
  }
});
