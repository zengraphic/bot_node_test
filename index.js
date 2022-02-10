require("dotenv").config();

const { Telegraf } = require("telegraf");
const BOT_TOKEN = process.env.BOT_TOKEN;
const bot = new Telegraf(BOT_TOKEN);
const axios = require("axios");

bot.start((ctx) => ctx.reply("Benvenuto!"));
bot.command("link", (ctx) => {
  const sheetID = "19A7jfTKkZ-_66dQUKpH3tpNFzqBOEQXC2WtPrr_QbIY";
  const sheet = "link";
  const googleKey = process.env.GOOGLE_API_KEY;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/${sheet}?alt=json&key=${googleKey}`;
  getlinks(url, ctx);
});

const getlinks = (url, ctx) => {
  axios
    .get(url)
    .then((res) => {
      const response = res.data.values;
      const objKeys = response.shift();
      const respLinks = response;
      const list = convertToObj(objKeys, respLinks);
      let keyboard;
      ctx.deleteMessage();
      keyboard = list.map((link) => [
        {
          text: `${link.type} ${link.description}`,
          url: link.link,
        },
      ]);
      const action = [
        {
          text: "chiudi",
          callback_data: "close",
        },
      ];
      keyboard.push(action);
      bot.telegram.sendMessage(ctx.chat.id, "i link", {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: keyboard,
        },
        disable_notification: true,
      });
    })
    .catch((err) => {
      console.log(err);
      ctx.reply("riprova");
    });
};
const convertToObj = (keys, valuesArrays) => {
  const finalArrray = [];
  valuesArrays.forEach((arr, i) => {
    finalArrray.push(Object.assign(...keys.map((k, i) => ({ [k]: arr[i] }))));
  });
  return finalArrray;
};
bot.action("close", (ctx) => ctx.deleteMessage());

bot.launch();
