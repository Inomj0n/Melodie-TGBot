import { MESSAGES } from './messages.js';

export function errorHandle(ctx, err) {
    console.log(err);

    if (err.code === 'ECONNREFUSED') {
        return ctx.reply(MESSAGES.SERVER_OFFLINE);
    }

    if (err.code === 'ECONNABORTED') {
        return ctx.reply('⚠️ ERROR: Request timed out. Please try again.');
    }

    if (err.response?.status === 409) {
        return ctx.reply(MESSAGES.DUPLICATE);
    }

    if (err.response?.status === 500) {
        return ctx.reply(MESSAGES.SERVER_ERROR);
    }

    if (err.response?.status === 400) {
        return ctx.reply('⚠️ Bad request. Please check your file or try again.');
    }

    if (err.response?.status === 404) {
        return ctx.reply('⚠️ Music not found. Please try again later.');
    }

    if (err.description) {
        return ctx.reply(`⚠️ Telegram error: ${err.description}`);
    }

    return ctx.reply(MESSAGES.UNKNOWN_ERROR);
}