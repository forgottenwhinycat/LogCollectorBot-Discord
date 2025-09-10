import { GuildMember } from "discord.js";
import { logToChannel } from "../../utils/logToChannel";

export default async (member: GuildMember): Promise<void> => {
  try {
    if (!member || !member.user) return;

    const logChannelId = process.env.LOG_CHANNEL_ID;
    if (!logChannelId) return;

    await logToChannel(member.client, logChannelId, member.user, {
      title: "Користувач покинув сервер",
      fields: [
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
        },
      ],
      thumbnailURL: member.user.displayAvatarURL(),
      footerText: member.guild.name,
      showTimestamp: true,
      type: "error",
    });
  } catch (error) {
    console.error(
      "Сталася помилка в події guildMemberRemove:",
      error instanceof Error ? error.message : error
    );
  }
};
