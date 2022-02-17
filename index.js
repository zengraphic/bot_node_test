require("dotenv").config();

const { Telegraf } = require("telegraf");
const BOT_TOKEN = process.env.BOT_TOKEN;
const bot = new Telegraf(BOT_TOKEN);
const sheetID = "19A7jfTKkZ-_66dQUKpH3tpNFzqBOEQXC2WtPrr_QbIY";
  const googleKey = process.env.GOOGLE_API_KEY;
const axios = require("axios");

bot.start((ctx) => ctx.reply("Benvenuto!"));
bot.command("link", (ctx) => {
  getlinksKeyboard('index', ctx);
});
const getlinksKeyboard = (sheet, ctx) => {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/${sheet}?alt=json&key=${googleKey}`;
  axios
    .get(url)
    .then((res) => {
      const response = res.data.values;
      const action = [
        {
          text: "chiudi",
          callback_data: "close",
        },
      ];
      ctx.deleteMessage();
      if (response && response.length) {
        const linkButtons = response.map(link => [{
          text: `${link}`,
          callback_data: `${link}`
        }]);
        const keyboard = [...linkButtons,action];
        bot.telegram.sendMessage(ctx.chat.id, "Che cateegoria vuoi visualizzare?", {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: keyboard,
          },
          disable_notification: true,
        });
        const callbacks = response.map(link => link[0]);
        bot.action(callbacks, (ctx) => {
          getlinks(ctx.match[0],ctx)
        })
      } else {
        ctx.reply("riprova getlinksKeyboard no response");
      }
    })
    .catch((err) => {
      console.log(err);
      ctx.reply("riprova getlinksKeyboard");
    });
};
const getlinks = (sheet, ctx) => {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/${sheet}?alt=json&key=${googleKey}`;
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
          text: `${link.description}`,
          url: link.link,
        },
      ]);
      const action = [
        {
          text: "indietro",
          callback_data: "link",
        },
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
      ctx.reply("riprova getlinks");
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
bot.action("link", (ctx) => {getlinksKeyboard('index', ctx)});

bot.launch();
