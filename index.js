require("dotenv").config();

const { Telegraf } = require("telegraf");
const BOT_TOKEN = process.env.BOT_TOKEN;
const bot = new Telegraf(BOT_TOKEN);
const sheetID = "19A7jfTKkZ-_66dQUKpH3tpNFzqBOEQXC2WtPrr_QbIY";
const googleKey = process.env.GOOGLE_API_KEY;
const axios = require("axios");
const { convertToObj } = require('./helpers/helpers');

bot.start((ctx) => ctx.reply("Benvenuto!"));
bot.command("link", (ctx) => {
  getlinksCategories("index", ctx);
});

const getlinksCategories = (sheet, ctx) => {
  getData(sheet)
    .then((response) => {
      const action = [
        {
          text: "chiudi ❌",
          callback_data: "close",
        },
      ];
      ctx.deleteMessage();
      if (response && response.length >= 1) {
        if (response[0][0].includes('#')) {
          ctx.reply("Riprova, c'è stato un errore");
          return
        }
        const linkButtons = response.map((link) => [
            {
              text: `${link}`,
              callback_data: `${link}`,
            },
          ]);
        const keyboard = [...linkButtons, action];
        bot.telegram.sendMessage(
          ctx.chat.id,
          "Che cateegoria vuoi visualizzare?",
          {
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: keyboard,
            },
            disable_notification: true,
          }
        );
        const callbacks = response.map((link) => link[0]);
        bot.action(callbacks, (ctx) => {
          getlinks(ctx.match[0], ctx);
        });
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
  getData(sheet)
    .then((res) => {
      const objKeys = res.shift();
      const respLinks = res;
      const list = convertToObj(objKeys, respLinks);
      let keyboard;
      ctx.deleteMessage();
      keyboard = list.map((link) => {
        const linkUrl = link.link;
        return [
          {
            text: `${link.description}`,
            callback_data: `${link.id}`,
          },
        ]
      });
      const action = [
        {
          text: "◀️ indietro",
          callback_data: "link",
        },
        {
          text: "chiudi ❌",
          callback_data: "close",
        },
      ];
      keyboard.push(action);
      const callbacks = list.map((link) => {
        console.log(link)
        return link.id});
      console.log(callbacks)
        bot.action(callbacks, (ctx) => {
          console.log(ctx.match[0])
          const selected = list.find((resLink) => resLink.id === ctx.match[0]);
          if (selected) {
            let message = `
              Nome: ${selected.name}
              descrizione: ${selected.description}
              tipo: ${selected.type}
              referrer: ${selected.link}
              a pagamento: ${selected.saleable}
            `;
            bot.telegram.sendMessage(ctx.chat.id, message, {
              parse_mode: "Markdown",
              reply_markup: {
                inline_keyboard: [action],
              },
              disable_notification: true,
            });
          }
        });
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

const getData = async (sheetName) => {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/${sheetName}?alt=json&key=${googleKey}`;
  let res = await axios.get(url);
  const response = res.data.values;
  return response
}

bot.action("close", (ctx) => ctx.deleteMessage());
bot.action("link", (ctx) => {
  getlinksCategories("index", ctx);
});

bot.launch();
