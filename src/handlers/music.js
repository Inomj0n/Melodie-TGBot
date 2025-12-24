import { getAlbums, addMusic, createAlbum } from "../utils/api.js";
import { errorHandle } from "../utils/error-handle.js";
import { MESSAGES } from "../utils/messages.js";
import { Markup } from "telegraf";

export const audioReceived = async (ctx) => {
    ctx.session ??= {};
    try {
        const msg = ctx.message;
        if (msg.document && !msg.document.mime_type?.startsWith("audio/"))
            return ctx.reply(MESSAGES.AUDIO_ONLY);

        const fileId = msg.audio?.file_id || msg.document?.file_id;
        if (!fileId) return ctx.reply(MESSAGES.INVALID_FILE);

        const title = (msg.audio?.file_name || msg.document?.file_name || "Unknown")
            .replace(/\.[^/.]+$/, "")
            .substring(0, 50);

        const fileLink = await ctx.telegram.getFileLink(fileId);
        if (!fileLink?.href) return ctx.reply("❌ Could not get file URL from Telegram.");

        ctx.session.pendingMusic = {
            title,
            url: String(fileLink.href),
            file_id: fileId,
            author: ctx.from.first_name,
            step: 0
        };

        await showAlbumsKeyboard(ctx);
    } catch (err) {
        errorHandle(ctx, err);
    }
};

export const albumCallback = async (ctx) => {
    ctx.session ??= {};
    if (!ctx.session.pendingMusic) return;

    try {
        const action = ctx.callbackQuery.data;

        if (action === "create_album") {
            ctx.session.pendingMusic.step = 1;
            await ctx.editMessageText("Enter new album name:");
            return ctx.answerCbQuery();
        }

        const albumId = action === "no_album" ? "694bd7dafc4737e0cdb5788a" : action;

        await addMusic({
            title: ctx.session.pendingMusic.title,
            author: ctx.session.pendingMusic.author,
            url: ctx.session.pendingMusic.url,
            file_id: ctx.session.pendingMusic.file_id,
            album: albumId
        });

        ctx.session.pendingMusic = null;
        await ctx.editMessageText(MESSAGES.ADD_SUCCESS);
        await ctx.answerCbQuery();
    } catch (err) {
        errorHandle(ctx, err);
    }
};

export const newAlbumName = async (ctx) => {
    ctx.session ??= {};
    if (ctx.session.pendingMusic?.step !== 1) return;

    try {
        const albumName = ctx.message.text.trim();
        if (!albumName) return ctx.reply("Album name can't be empty.");

        const response = await createAlbum({ name: albumName });
        console.log("CreateAlbum response:", response);

        const albumId = response?.data?.data?._id;
        if (!albumId) return ctx.reply("❌ Failed to create album");

        await addMusic({
            title: ctx.session.pendingMusic.title,
            author: ctx.session.pendingMusic.author,
            url: ctx.session.pendingMusic.url,
            file_id: ctx.session.pendingMusic.file_id,
            album: albumId
        });

        ctx.session.pendingMusic = null;

        await ctx.reply(`✅ Music added to album "${albumName}" successfully!`);
    } catch (err) {
        errorHandle(ctx, err);
    }
};


async function fetchAlbums() {
    const { data: albumsList } = await getAlbums();
    return Array.isArray(albumsList) ? albumsList : [];
}

async function showAlbumsKeyboard(ctx) {
    const albumsList = await fetchAlbums();
    const buttons = albumsList.map(a => [Markup.button.callback(a.name, a._id)]);
    buttons.push([Markup.button.callback("Create Album", "create_album")]);
    buttons.push([Markup.button.callback("No Album", "no_album")]);

    await ctx.reply("Select an album:", Markup.inlineKeyboard(buttons));
}
