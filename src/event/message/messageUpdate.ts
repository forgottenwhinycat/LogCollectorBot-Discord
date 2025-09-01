import { Message, PartialMessage, EmbedBuilder, TextChannel } from "discord.js";

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

    if (!oldMessage.guild || !oldMessage.author) {
      console.log("Пропускаю: немає гільдії або автора");
      return;
    }

    if (oldMessage.content === newMessage.content) return;

    if (!oldMessage.content && !newMessage.content) {
      console.log("Пропускаю: обидва повідомлення порожні");
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle("Повідомлення було відредаговано!")
      .setColor("Orange")
      .addFields(
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
        { name: "ID повідомлення:", value: `${oldMessage.id}`, inline: false }
      )
      .setFooter({
        text: `${oldMessage.guild.name}`,
        iconURL: oldMessage.author.displayAvatarURL(),
      })
      .setTimestamp(new Date())
      .setThumbnail(oldMessage.author.displayAvatarURL());

    const logChannelId = process.env.LOG_CHANNEL_ID;
    if (!logChannelId) {
      throw new Error("LOG_CHANNEL_ID не визначено в .env файлі");
    }

    const logChannel = (await oldMessage.client.channels.fetch(
      logChannelId
    )) as TextChannel;
    if (!logChannel || !(logChannel instanceof TextChannel)) {
      throw new Error(
        `Журнал каналу з ідентифікатором ${logChannelId} не знайдено або не є текстовим каналом`
      );
    }

    await logChannel.send({ embeds: [embed] }).catch((sendError) => {
      console.error(
        `Не вдалося надіслати повідомлення журналу до каналу ${logChannelId}:`,
        sendError
      );
    });
  } catch (err) {
    console.error(
      "Помилка при обробці редагованого повідомлення:",
      err instanceof Error ? err.message : err
    );
  }
};
