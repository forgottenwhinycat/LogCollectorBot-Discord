import { Message, EmbedBuilder, TextChannel } from "discord.js";

export default async (message: Message) => {
  try {
    if (!message.guild || !message.author) {
      console.log("Пропускаю: немає гільдії або автора");
      return;
    }

    if (!message.content && !message.attachments.size) {
      console.log("Пропускаю: повідомлення порожнє і немає вкладень");
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle("Було видалено повідомлення!")
      .setColor("Red")
      .addFields(
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
        {
          name: "Дата видалення:",
          value: new Date().toLocaleString("uk-UA"),
          inline: true,
        },
        { name: "ID повідомлення:", value: `${message.id}`, inline: true },
        {
          name: "Кількість вкладень:",
          value: `${message.attachments.size}`,
          inline: false,
        }
      )
      .setFooter({
        text: `${message.guild.name}`,
        iconURL: message.author.displayAvatarURL(),
      })
      .setTimestamp(message.createdAt)
      .setThumbnail(message.author.displayAvatarURL());

    const logChannelId = process.env.LOG_CHANNEL_ID;
    if (!logChannelId) {
      throw new Error("LOG_CHANNEL_ID не визначено в .env файлі");
    }

    const logChannel = (await message.client.channels.fetch(
      logChannelId
    )) as TextChannel;
    if (!logChannel || !(logChannel instanceof TextChannel)) {
      throw new Error(
        `Журнал каналу з ідентифікатором ${logChannelId} не знайдено або не є текстовим каналом`
      );
    }

    console.log("Знайдено лог-канал:", logChannel.name);
    await logChannel.send({ embeds: [embed] }).catch((sendError) => {
      console.error(
        `Не вдалося надіслати повідомлення журналу до каналу ${logChannelId}:`,
        sendError
      );
    });
  } catch (err) {
    console.error(
      "Помилка при отриманні або надсиланні в лог-канал:",
      err instanceof Error ? err.message : err
    );
  }
};
