require("dotenv").config();

const { Telegraf } = require("telegraf");
const BOT_TOKEN = process.env.BOT_TOKEN;
const bot = new Telegraf(BOT_TOKEN);
const { Pagination } = require("./helpers/pagination");

const { convertToObj, getData } = require("./helpers/helpers");

const helpMessage = `*Bot*
		Nasco con l'idea di semplificare un po' la vita nel gruppo, come me potrai:
		/link - visualizzare tutti i link utili`;

bot.help((ctx) => {
  bot.telegram.sendMessage(ctx.chat.id, helpMessage, {
    parse_mode: "Markdown",
  });
});

bot.start((ctx) => ctx.reply("Benvenuto!"));

bot.on("new_chat_members", (ctx) => {
  sayHello(ctx);
});

bot.command("link", (ctx) => {
  getlinksCategories("index", ctx);
});

const getlinksCategories = (sheet, ctx) => {
  const userID = ctx.from.id;
  getData(sheet)
    .then(async (response) => {
      ctx.deleteMessage();
      if (response && response.length >= 1) {
        if (response[0][0].includes("#")) {
          getlinksCategories(sheet, ctx);
          return;
        }
        let pagination = new Pagination({
          data: response,
          rowSize: 1,
          onSelect: (item) => {
            getlinks(item, ctx);
          },
        });
        let text = await pagination.text();
        let { reply_markup } = await pagination.keyboard();
        bot.telegram.sendMessage(userID, text, {
          parse_mode: "Markdown",
          reply_markup,
        });
        pagination.handleActions(bot);
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
  const userID = ctx.from.id;
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
            let message = "";
            selected.name
              ? (message += `<b>Nome:</b> ${selected.name}\n`)
              : message;
            selected.description
              ? (message += `<b>Descrizione:</b> ${selected.description}\n`)
              : message;
            selected.type
              ? (message += `<b>Tipo:</b> ${selected.type}\n`)
              : message;
            selected.link
              ? selected.link.includes("https")
                ? (message += `<b>link/riferimento:</b> ${selected.link}\n`)
                : (message += `<b>link/riferimento:</b> https://t.me/${selected.link}\n`)
              : message;
            selected.saleable
              ? (message += `<b>A pagamento/retribuito:</b> ${selected.saleable}\n`)
              : message;
            bot.telegram.sendMessage(userID, message, {
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
      let { reply_markup } = await pagination.keyboard();
      bot.telegram.sendMessage(userID, text, {
        parse_mode: "Markdown",
        reply_markup,
      });
      pagination.handleActions(bot);
    })
    .catch((err) => {
      console.log(err);
      ctx.reply("riprova getlinks");
    });
};

const sayHello = (ctx) => {
  let chatType = ctx.chat.type;
  let username = ctx.from.first_name;
  let userID = ctx.from.id;
  let welcomeMessage;
  switch (chatType) {
    case "private":
      welcomeMessage = `Ciao ${username}.`;
      break;

    default:
      let groupName = ctx.chat.title;
      welcomeMessage = `Ciao *${username}*, benvenuto in *${groupName}*.Presentati al gruppo`;
      break;
  }
  bot.telegram.sendMessage(userID, welcomeMessage, {
    disable_notification: true,
    parse_mode: "Markdown",
  });
};

bot.action("close", (ctx) => ctx.deleteMessage());
bot.action("link", (ctx) => {
  getlinksCategories("index", ctx);
});

bot.launch();
