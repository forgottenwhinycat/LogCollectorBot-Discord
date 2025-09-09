import { Message, PermissionFlagsBits } from "discord.js";
import { createEmbed } from "../../../utils/embed";

export async function unbanCommand(message: Message, args: string[]) {
  if (!message.member?.permissions.has(PermissionFlagsBits.BanMembers)) {
    const embed = createEmbed("error", message.author, {
      title: "Немає прав",
      description: "У тебе немає прав на **розбан користувачів**.",
    });
    await message.reply({ embeds: [embed] });
    return;
  }

  const userId = args[0]?.replace(/\D/g, "");
  if (!userId) {
    const embed = createEmbed("usage", message.author, {
      title: "Некоректна команда",
      description: "Правильний синтаксис: `!розбанити [id]`",
    });
    await message.reply({ embeds: [embed] });
    return;
  }

  let userTag = `<@${userId}>`;
  let thumb: string | undefined = undefined;

  try {
    const user = await message.client.users.fetch(userId);
    userTag = user.tag;
    thumb = user.displayAvatarURL({ extension: "png", size: 1024 });
    await message.guild?.members.unban(userId);

    const embed = createEmbed("success", message.author, {
      title: "Користувач розбанений",
      fields: [
        { name: "Користувач:", value: userTag },
        { name: "Модератор:", value: message.author.tag },
      ],
      thumbnailURL: thumb,
    });
    await message.reply({ embeds: [embed] });
  } catch {
    const embed = createEmbed("error", message.author, {
      title: "Помилка",
      description:
        "Не вдалося розбанити користувача. Можливо, його немає у списку банів.",
    });
    await message.reply({ embeds: [embed] });
  }
}
