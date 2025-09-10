import { Message, PermissionFlagsBits } from "discord.js";
import { logToChannel } from "../../../utils/logToChannel";

export async function unbanCommand(message: Message, args: string[]) {
  try {
    const logChannelId = process.env.LOG_CHANNEL_ID;

    if (!message.member?.permissions.has(PermissionFlagsBits.BanMembers)) {
      if (logChannelId) {
        await logToChannel(message.client, logChannelId, message.author, {
          title: "Немає прав",
          description: "У тебе немає прав на **розбан користувачів**.",
          type: "error",
        });
      }
      return;
    }

    const userId = args[0]?.replace(/\D/g, "");
    if (!userId) {
      if (logChannelId) {
        await logToChannel(message.client, logChannelId, message.author, {
          title: "Некоректна команда",
          description: "Правильний синтаксис: `!розбанити [id]`",
          type: "info",
        });
      }
      return;
    }

    let userTag = `<@${userId}>`;
    let thumb: string | undefined = undefined;

    try {
      const user = await message.client.users.fetch(userId);
      userTag = user.tag;
      thumb = user.displayAvatarURL({ extension: "png", size: 1024 });

      await message.guild?.members.unban(userId);

      if (logChannelId) {
        await logToChannel(message.client, logChannelId, message.author, {
          title: "Користувач розбанений",
          fields: [
            { name: "Користувач:", value: userTag },
            { name: "Модератор:", value: message.author.tag },
          ],
          thumbnailURL: thumb,
          footerText: message.guild?.name,
          showTimestamp: true,
          type: "success",
        });
      }
    } catch {
      if (logChannelId) {
        await logToChannel(message.client, logChannelId, message.author, {
          title: "Помилка",
          description:
            "Не вдалося розбанити користувача. Можливо, його немає у списку банів.",
          type: "error",
        });
      }
    }
  } catch (err) {
    console.error(
      "Помилка при виконанні команди !розбанити:",
      err instanceof Error ? err.message : err
    );

    const logChannelId = process.env.LOG_CHANNEL_ID;
    if (logChannelId) {
      await logToChannel(message.client, logChannelId, message.author, {
        title: "Помилка",
        description: "Сталася помилка під час виконання команди !розбанити.",
        type: "error",
      });
    }
  }
}
