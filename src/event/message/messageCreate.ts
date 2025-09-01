import { Message, EmbedBuilder, GuildMember, User, Colors } from "discord.js";

export default async (message: Message) => {
  try {
    if (message.author.bot) return;

    const args = message.content.trim().split(/\s+/);
    if (args[0] !== "!профіль") return;

    let targetUser: User | null = null;
    let targetMember: GuildMember | null = null;

    if (args.length > 1) {
      const mention = message.mentions.users.first();
      const id = args[1]?.replace(/\D/g, "");

      if (mention) {
        targetUser = mention;
        targetMember = message.guild?.members.cache.get(mention.id) || null;
      } else if (id) {
        try {
          targetUser = await message.client.users.fetch(id);
          targetMember = message.guild
            ? await message.guild.members.fetch(id).catch(() => null)
            : null;
        } catch (fetchError) {
          await message.reply("Не вдалося знайти користувача за вказаним ID.");
          return;
        }
      }

      if (!targetUser) {
        await message.reply("Не вдалося знайти користувача.");
        return;
      }
    } else {
      targetUser = message.author;
      targetMember = message.member;
    }

    if (!targetMember && message.guild) {
      await message.reply("Цей користувач не є учасником цього сервера.");
      return;
    }

    if (!targetUser) {
      throw new Error("Не вдалося визначити цільового користувача");
    }

    const embed = new EmbedBuilder()
      .setAuthor({
        name: `${targetUser.username}`,
        iconURL: targetUser.displayAvatarURL(),
      })
      .setThumbnail(targetUser.displayAvatarURL())
      .setColor(targetMember?.displayColor || Colors.DarkButNotBlack)
      .addFields(
        {
          name: "Користувач:",
          value: `${targetUser} (\`${targetUser.id}\`)`,
          inline: false,
        },
        {
          name: "ID:",
          value: `\`${targetUser.id}\``,
          inline: false,
        },
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
          name: "Користувачів:",
          value: `${message.guild?.memberCount || "?"}`,
          inline: true,
        }
      )
      .setFooter({
        text: `Запитав: ${message.author.tag}`,
        iconURL: message.author.displayAvatarURL(),
      })
      .setTimestamp();

    if (message.channel.isTextBased() && "send" in message.channel) {
      await message.channel.send({ embeds: [embed] }).catch((sendError) => {
        console.error(
          `Не вдалося надіслати вбудований профіль у канал ${message.channel.id}:`,
          sendError
        );
      });
    } else {
      throw new Error(
        "Канал не текстовий або не підтримує надсилання повідомлень"
      );
    }
  } catch (err) {
    console.error(
      "Помилка при обробці команди !профіль:",
      err instanceof Error ? err.message : err
    );
  }
};
