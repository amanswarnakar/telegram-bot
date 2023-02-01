require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const schedule = require("node-schedule");

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
  let res = "";
  await fetch(url, {
    method: "GET",
    headers: {
      "content-type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((data) => {
      const temp = data.main.temp;
      const weatherDescription = data.weather[0].description;
      const humidity = data.main.humidity;
      const temp_min = data.main.temp_min;
      const temp_max = data.main.temp_max;
      res =
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
      if (err.message === "city not found" || err.cod === "404")
        bot.sendMessage(chatId, "City not found.");
    });
  chatIds.map((e) => {
    bot.sendMessage(e, res);
  });
});

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  chatIds.push(chatId);
  const query = msg.text;
  if (query === "/start") {
    bot.sendMessage(
      chatId,
      "Welcome to the weather bot.\n\nYou can type a city name to get the weather details.\n\nIn addition to that, you will receive hourly weather updates of Delhi."
    );
  } else {
    const url =
      "https://api.openweathermap.org/data/2.5/weather?q=" +
      query +
      "&units=metric&appid=" +
      process.env.WEATHER_API;

    await fetch(url, {
      method: "GET",
      headers: {
        "content-type": "application/json",
      },
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error("city not found");
      })
      .then((data) => {
        const temp = data.main.temp;
        const weatherDescription = data.weather[0].description;
        const humidity = data.main.humidity;
        const temp_min = data.main.temp_min;
        const temp_max = data.main.temp_max;
        const res =
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

        bot.sendMessage(chatId, res);
      })
      .catch((err) => {
        if (err.message === "city not found" || err.cod === "404")
          bot.sendMessage(chatId, "City not found.");
      });
  }
});
