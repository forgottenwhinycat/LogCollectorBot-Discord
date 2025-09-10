import { Message, PartialMessage } from "discord.js";
import { logToChannel } from "../../utils/logToChannel";

export default async (
  oldMessage: Message | PartialMessage,
  newMessage: Message | PartialMessage
) => {
  try {
    if (oldMessage.partial) {
      try {
        oldMessage = await oldMessage.fetch();
      } catch (fetchError) {
        console.error(
          "Не вдалося отримати частково старе повідомлення:",
          fetchError
        );
        return;
      }
    }

    if (newMessage.partial) {
      try {
        newMessage = await newMessage.fetch();
      } catch (fetchError) {
        console.error(
          "Не вдалося отримати частково нове повідомлення:",
          fetchError
        );
        return;
      }
    }

    if (!oldMessage.guild || !oldMessage.author) return;
    if (oldMessage.content === newMessage.content) return;
    if (!oldMessage.content && !newMessage.content) return;

    const logChannelId = process.env.LOG_CHANNEL_ID;
    if (!logChannelId) return;

    await logToChannel(oldMessage.client, logChannelId, oldMessage.author, {
      title: "Повідомлення було відредаговано!",
      fields: [
        {
          name: "Старе повідомлення:",
          value: oldMessage.content || "—",
          inline: false,
        },
        {
          name: "Нове повідомлення:",
          value: newMessage.content || "—",
          inline: false,
        },
        {
          name: "Автор:",
          value: `${oldMessage.author.tag} (ID: ${oldMessage.author.id})`,
          inline: true,
        },
        { name: "Канал:", value: `${oldMessage.channel}`, inline: true },
        { name: "ID повідомлення:", value: `${oldMessage.id}`, inline: false },
      ],
      thumbnailURL: oldMessage.author.displayAvatarURL(),
      footerText: oldMessage.guild.name,
      showTimestamp: true,
      type: "info",
    });
  } catch (err) {
    console.error(
      "Помилка при обробці редагованого повідомлення:",
      err instanceof Error ? err.message : err
    );
  }
};
