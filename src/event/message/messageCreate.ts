import { Message } from "discord.js";
import { logToChannel } from "../../utils/logToChannel";

const cooldown = new Set<string>();

export default async (message: Message) => {
  try {
    if (message.author.bot || !message.guild) return;
    if (cooldown.has(message.id)) return;

    const content = message.content.toLowerCase().trim();
    if (content !== "!профіль" && !content.startsWith("!профіль ")) return;

    cooldown.add(message.id);
    setTimeout(() => cooldown.delete(message.id), 5000);

    let targetUser = message.author;
    let targetMember = message.member;

    const args = message.content.trim().split(/\s+/);
    if (args.length > 1) {
      const mention = message.mentions.users.first();
      const id = args[1]?.replace(/\D/g, "");

      if (mention) {
        targetUser = mention;
        targetMember = message.guild.members.cache.get(mention.id) || null;
      } else if (id) {
        try {
          targetUser = await message.client.users.fetch(id);
          targetMember = await message.guild.members
            .fetch(id)
            .catch(() => null);
        } catch {
          await message.reply("Не вдалося знайти користувача за вказаним ID.");
          return;
        }
      }
      if (!targetUser) {
        await message.reply("Не вдалося знайти користувача.");
        return;
      }
    }

    const logChannelId = process.env.LOG_CHANNEL_ID;
    if (!logChannelId) return;

    await logToChannel(message.client, logChannelId, targetUser, {
      title: `Профіль користувача ${targetUser.tag}`,
      fields: [
        {
          name: "Користувач:",
          value: `${targetUser} (\`${targetUser.id}\`)`,
          inline: false,
        },
        { name: "ID:", value: `\`${targetUser.id}\``, inline: false },
        {
          name: "Приєднався:",
          value: targetMember?.joinedAt
            ? `<t:${Math.floor(targetMember.joinedAt.getTime() / 1000)}:R>`
            : "—",
          inline: false,
        },
        {
          name: "Акаунт створено:",
          value: `<t:${Math.floor(targetUser.createdAt.getTime() / 1000)}:R>`,
          inline: false,
        },
        {
          name: "Ролі:",
          value:
            targetMember?.roles.cache
              .filter((role) => role.id !== message.guild?.id)
              .map((role) => role.toString())
              .reverse()
              .join(", ") || "—",
          inline: false,
        },
        {
          name: "Користувачів на сервері:",
          value: `${message.guild.memberCount}`,
          inline: true,
        },
      ],
      thumbnailURL: targetUser.displayAvatarURL(),
      footerText: `Запитав: ${message.author.tag}`,
      showTimestamp: true,
      type: "info",
    });
  } catch (err) {
    console.error(
      "Помилка при обробці команди !профіль:",
      err instanceof Error ? err.message : err
    );
  }
};
