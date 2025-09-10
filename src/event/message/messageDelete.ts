import { Message } from "discord.js";
import { logToChannel } from "../../utils/logToChannel";

export default async (message: Message) => {
  try {
    if (!message.guild || !message.author) return;
    if (!message.content && !message.attachments.size) return;

    const logChannelId = process.env.LOG_CHANNEL_ID;
    if (!logChannelId) return;

    await logToChannel(message.client, logChannelId, message.author, {
      title: "Було видалено повідомлення!",
      fields: [
        {
          name: "Видалене повідомлення:",
          value: message.content || "—",
          inline: true,
        },
        {
          name: "Автор:",
          value: `${message.author.tag} (ID: ${message.author.id})`,
          inline: true,
        },
        { name: "Канал:", value: `${message.channel}`, inline: false },
        { name: "ID повідомлення:", value: `${message.id}`, inline: true },
        {
          name: "Кількість вкладень:",
          value: `${message.attachments.size}`,
          inline: true,
        },
      ],
      thumbnailURL: message.author.displayAvatarURL(),
      footerText: message.guild.name,
      showTimestamp: true,
      type: "error",
    });
  } catch (err) {
    console.error(
      "Помилка при обробці видаленого повідомлення:",
      err instanceof Error ? err.message : err
    );
  }
};
