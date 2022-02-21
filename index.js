require("dotenv").config();

const { Telegraf } = require("telegraf");
const BOT_TOKEN = process.env.BOT_TOKEN;
const bot = new Telegraf(BOT_TOKEN);
const { Pagination } = require("./helpers/pagination");

const { convertToObj, getData } = require("./helpers/helpers");

bot.start((ctx) => ctx.reply("Benvenuto!"));

bot.command("link", (ctx) => {
  getlinksCategories("index", ctx);
});

const getlinksCategories = (sheet, ctx) => {
  getData(sheet)
    .then(async (response) => {
      const action = [
        {
          text: "chiudi ❌",
          callback_data: "close",
        },
      ];
      ctx.deleteMessage();
      if (response && response.length >= 1) {
        if (response[0][0].includes("#")) {
          getlinksCategories(sheet, ctx);
          return;
        }
        let pagination = new Pagination({
          data: response,
          rowSize:1,
          onSelect: (item) => {
            console.log(item)
            getlinks(item, ctx);
          },
        });
        let text = await pagination.text();
        let {reply_markup} = await pagination.keyboard();
        bot.telegram.sendMessage(ctx.chat.id, text, {
          parse_mode: "Markdown",
          reply_markup,
          disable_notification: true,
        });
        pagination.handleActions(bot);
       /*  const linkButtons = response.map((link) => [
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
        }); */
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
    .then(async (res) => {
      const objKeys = res.shift();
      const respLinks = res;
      const list = convertToObj(objKeys, respLinks);
      let pagination = new Pagination({
        data: list,
        format: (item, index) => `${index + 1}) ${item.name}`,
        onSelect: (item) => {
          const selected = list.find((resLink) => resLink.id === item.id);
          const action = [
            {
              text: "chiudi ❌",
              callback_data: "close",
            },
          ];
          if (selected) {
            let message = '';
            selected.name ? message += `<b>Nome:</b> ${selected.name}\n` : message ;
            selected.description ? message += `<b>Descrizione:</b> ${selected.description}\n` : message ;
            selected.type ? message += `<b>Tipo:</b> ${selected.type}\n` : message ;
            selected.link ? message += `<b>Referrer:</b> ${selected.link}\n` : message ;
            selected.saleable ? message += `<b>Referrer:</b> ${selected.saleable}\n` : message ;
            bot.telegram.sendMessage(ctx.chat.id, message, {
              parse_mode: "HTML",
              reply_markup: {
                inline_keyboard: [action],
              },
              disable_notification: true,
            });
          }
        },
      });
      let text = await pagination.text();
      let {reply_markup} = await pagination.keyboard();
      bot.telegram.sendMessage(ctx.chat.id, text, {
        parse_mode: "Markdown",
        reply_markup,
        disable_notification: true,
      });
      pagination.handleActions(bot);
    })
    .catch((err) => {
      console.log(err);
      ctx.reply("riprova getlinks");
    });
};

bot.action("close", (ctx) => ctx.deleteMessage());
bot.action("link", (ctx) => {
  getlinksCategories("index", ctx);
});

bot.launch();
