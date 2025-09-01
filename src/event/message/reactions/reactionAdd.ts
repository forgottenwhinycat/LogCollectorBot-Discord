import { MessageReaction, User, EmbedBuilder, TextChannel } from "discord.js";

export default async (reaction: MessageReaction, user: User) => {
  try {
    if (reaction.partial) {
      try {
        reaction = await reaction.fetch();
      } catch (fetchError) {
        console.error("Не вдалося отримати частину реакції:", fetchError);
        return;
      }
    }

    const message = reaction.message;
    if (!message.guild) {
      console.log("Реакція не в гільдії");
      return;
    }

    if (!message || !user) {
      throw new Error("Недійсне повідомлення або дані користувача");
    }

    const embed = new EmbedBuilder()
      .setTitle("Реакцію додано!")
      .setColor("Green")
      .addFields(
        { name: "Емодзі:", value: `${reaction.emoji}`, inline: true },
        {
          name: "Користувач:",
          value: `${user.tag} (ID: ${user.id})`,
          inline: true,
        },
        { name: "Канал:", value: `${message.channel}`, inline: true },
        { name: "ID повідомлення:", value: `${message.id}`, inline: true }
      )
      .setFooter({
        text: `${message.guild.name}`,
        iconURL: user.displayAvatarURL(),
      })
      .setTimestamp(new Date())
      .setThumbnail(user.displayAvatarURL());

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

    await logChannel.send({ embeds: [embed] }).catch((sendError) => {
      console.error(
        `Не вдалося надіслати повідомлення журналу до каналу ${logChannelId}:`,
        sendError
      );
    });
  } catch (err) {
    console.error(
      "Помилка при логуванні доданої реакції:",
      err instanceof Error ? err.message : err
    );
  }
};
