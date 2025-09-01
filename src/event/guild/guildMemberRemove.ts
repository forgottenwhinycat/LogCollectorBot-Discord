import {
  GuildMember,
  EmbedBuilder,
  TextChannel,
  NewsChannel,
  ThreadChannel,
} from "discord.js";

export default async (member: GuildMember): Promise<void> => {
  if (!member || !member.user) {
    console.error("Недійсні дані учасника або користувача");
    return;
  }

  const embed = new EmbedBuilder()
    .setThumbnail(member.user.displayAvatarURL())
    .setTitle("Користувач покинув сервер")
    .setColor("Red")
    .addFields(
      {
        name: "Користувач:",
        value: `${member.user.tag} (ID: ${member.user.id})`,
        inline: true,
      },
      {
        name: "Дата виходу:",
        value: new Date().toLocaleString("uk-UA"),
        inline: true,
      },
      {
        name: "Ролі:",
        value:
          member.roles.cache
            .filter((role) => role.name !== "@everyone")
            .map((r) => r.name)
            .join(", ") || "Немає ролей",
        inline: false,
      },
      {
        name: "Приєднався:",
        value: member.joinedAt?.toLocaleString("uk-UA") || "Невідомо",
        inline: true,
      }
    )
    .setFooter({
      text: `${member.guild.name}`,
      iconURL: member.user.displayAvatarURL(),
    })
    .setTimestamp();

  await member.send({ embeds: [embed] }).catch((error) => {
    console.error(
      `Не вдалося надіслати прощальне повідомлення ${member.user.tag}:`,
      error
    );
  });

  try {
    const logChannelId = process.env.LOG_CHANNEL_ID;
    if (!logChannelId) {
      throw new Error("LOG_CHANNEL_ID не визначено в .env файлів");
    }

    const logChannel = await member.client.channels.fetch(logChannelId);

    if (!logChannel) {
      throw new Error(
        `Журнал каналу з ідентифікатором ${logChannelId} не знайдено`
      );
    }

    if (
      !(logChannel instanceof TextChannel) &&
      !(logChannel instanceof NewsChannel) &&
      !(logChannel instanceof ThreadChannel)
    ) {
      throw new Error(`Канал ${logChannelId} не є підтримуваним типом каналу`);
    }

    await logChannel.send({ embeds: [embed] }).catch((error) => {
      console.error(
        `Не вдалося надіслати повідомлення журналу до каналу ${logChannelId}:`,
        error
      );
    });
  } catch (error) {
    console.error(
      "Помилка при відправці в лог-канал:",
      error instanceof Error ? error.message : error
    );
  }
};
