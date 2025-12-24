import { Telegraf, Markup, session } from "telegraf";
import { config } from "dotenv";
config();

import { audioReceived, albumCallback, newAlbumName } from "./handlers/music.js";
import { getRandomMusic } from "./utils/api.js";
import { errorHandle } from "./utils/error-handle.js";
import { MESSAGES } from "./utils/messages.js";
import { formatCaption } from "./utils/caption.js";

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.use(session());

const mainMenu = Markup.keyboard([["Add Music", "Random Music"]]).resize();

bot.start((ctx) => {
  ctx.session ??= {};
  ctx.reply("Welcome to Melodia Bot!", mainMenu);
});

bot.on("text", async (ctx) => {
  try {
    ctx.session ??= {};

    if (ctx.session.pendingMusic?.step === 1) {
      return newAlbumName(ctx);
    }

    const text = ctx.message.text;

    if (text === "Add Music") {
      return ctx.reply("Send an audio file to add it.");
    }

    if (text === "Random Music") {
      const { data: music } = await getRandomMusic();
      if (!music) return ctx.reply("No music found");

      const caption = formatCaption(music);
      return ctx.replyWithAudio(music.file_id || music.url, { caption });
    }

    return ctx.reply("Please use the menu buttons", mainMenu);
  } catch (err) {
    errorHandle(ctx, err);
  }
});

bot.on(["audio", "document"], (ctx) => audioReceived(ctx));

bot.on("callback_query", (ctx) => albumCallback(ctx));

bot.launch();
console.log("Bot launched");