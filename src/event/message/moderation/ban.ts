import { Message, PermissionFlagsBits } from "discord.js";
import { createEmbed } from "../../../utils/embed";

export async function banCommand(message: Message, args: string[]) {
  if (!message.member?.permissions.has(PermissionFlagsBits.BanMembers)) {
    const embed = createEmbed("error", message.author, {
      title: "Немає прав",
      description: "У тебе немає прав на **бан користувачів**.",
    });
    await message.reply({ embeds: [embed] });
    return;
  }

  if (args.length === 0) {
    const embed = createEmbed("usage", message.author, {
      title: "Використання команди",
      description:
        "Щоб забанити користувача:\n`!бан @користувач [причина]` або `!бан [id] [причина]`",
    });
    await message.reply({ embeds: [embed] });
    return;
  }

  const mentioned = message.mentions.members?.first();
  const providedIdRaw = args[0];
  const providedId = providedIdRaw?.replace(/\D/g, "");
  const reason = args.slice(1).join(" ") || "Без причини";

  let target;

  if (mentioned) target = mentioned;
  else if (providedId) {
    try {
      target = await message.guild!.members.fetch(providedId);
    } catch {}
  } else {
    const embed = createEmbed("usage", message.author, {
      title: "Некоректна команда",
      description:
        "Правильний синтаксис: `!бан @користувач [причина]` або `!бан [id] [причина]`",
    });
    await message.reply({ embeds: [embed] });
    return;
  }

  if (!target) {
    const embed = createEmbed("error", message.author, {
      title: "Неможливо",
      description: "Користувач не знайдений на сервері.",
    });
    await message.reply({ embeds: [embed] });
    return;
  }

  if ("bannable" in target && !target.bannable) {
    const embed = createEmbed("error", message.author, {
      title: "Неможливо",
      description: `Я не можу забанити ${target.user.tag}.`,
      thumbnailURL: target.user.displayAvatarURL({
        extension: "png",
        size: 1024,
      }),
    });
    await message.reply({ embeds: [embed] });
    return;
  }

  try {
    await target.ban({ reason });
    const embed = createEmbed("success", message.author, {
      title: "Користувач забанений",
      fields: [
        { name: "Користувач:", value: target.user.tag },
        { name: "Модератор:", value: message.author.tag },
        { name: "Причина:", value: reason },
      ],
      thumbnailURL: target.user.displayAvatarURL({
        extension: "png",
        size: 1024,
      }),
    });
    await message.reply({ embeds: [embed] });
  } catch {
    const embed = createEmbed("error", message.author, {
      title: "Помилка",
      description: `Не вдалося забанити ${target.user.tag}.`,
    });
    await message.reply({ embeds: [embed] });
  }
}
