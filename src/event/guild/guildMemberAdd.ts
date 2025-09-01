import { GuildMember, EmbedBuilder, TextChannel } from "discord.js";

export default async (member: GuildMember): Promise<void> => {
  try {
    if (!member || !member.user) {
      throw new Error("Недійсні дані учасника або користувача");
    }

    const embed = new EmbedBuilder()
      .setThumbnail(member.user.displayAvatarURL())
      .setTitle("Користувач зайшов на сервер")
      .setColor("Green")
      .addFields(
        {
          name: "Користувач:",
          value: `${member.user.tag} (ID: ${member.user.id})`,
          inline: true,
        },
        {
          name: "Дата входу:",
          value: new Date().toLocaleString("uk-UA"),
          inline: true,
        },
        {
          name: "Приєднався до серверу:",
          value: member.joinedAt?.toLocaleString("uk-UA") || "Невідомо",
          inline: false,
        },
        {
          name: "Кількість учасників:",
          value: `${member.guild.memberCount}`,
          inline: true,
        }
      )
      .setFooter({
        text: `${member.guild.name}`,
        iconURL: member.user.displayAvatarURL(),
      })
      .setTimestamp();

    const logChannelId = process.env.LOG_CHANNEL_ID;
    if (!logChannelId) {
      throw new Error("LOG_CHANNEL_ID не визначено в .env файлі");
    }

    const logChannel = member.client.channels.cache.get(
      logChannelId
    ) as TextChannel;
    if (!logChannel || !(logChannel instanceof TextChannel)) {
      throw new Error(
        `Журнал каналу з ідентифікатором ${logChannelId} не знайдено або не є текстовим каналом`
      );
    }

    await logChannel.send({ embeds: [embed] }).catch((error) => {
      console.error(
        `Не вдалося надіслати повідомлення журналу до каналу ${logChannelId}:`,
        error
      );
    });
  } catch (error) {
    console.error(
      "Сталася помилка в події guildMemberAdd:",
      error instanceof Error ? error.message : error
    );
  }
};
