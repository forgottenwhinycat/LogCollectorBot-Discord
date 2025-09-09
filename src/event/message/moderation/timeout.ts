import { Message, PermissionFlagsBits } from "discord.js";
import { createEmbed } from "../../../utils/embed";

export async function timeoutCommand(message: Message, args: string[]) {
  if (!message.member?.permissions.has(PermissionFlagsBits.ModerateMembers)) {
    const embed = createEmbed("error", message.author, {
      title: "Немає прав",
      description: "У тебе немає прав на **таймаути**.",
    });
    await message.reply({ embeds: [embed] });
    return;
  }

  if (args.length < 2) {
    const embed = createEmbed("usage", message.author, {
      title: "Використання команди",
      description:
        "Щоб видати таймаут:\n`!таймаут @користувач [хвилини] [причина]` або `!таймаут [id] [хвилини] [причина]`",
    });
    await message.reply({ embeds: [embed] });
    return;
  }

  const mentioned = message.mentions.members?.first();
  const providedId = args[0]?.replace(/\D/g, "");
  const durationMinutes = parseInt(args[mentioned ? 1 : 1], 10);
  const reason = args.slice(mentioned ? 2 : 2).join(" ") || "Без причини";

  let target;
  if (mentioned) target = mentioned;
  else if (providedId) {
    try {
      target = await message.guild!.members.fetch(providedId);
    } catch {
      const embed = createEmbed("error", message.author, {
        title: "Помилка",
        description: `Не вдалося знайти користувача з ID ${providedId} на сервері.`,
      });
      await message.reply({ embeds: [embed] });
      return;
    }
  } else {
    const embed = createEmbed("usage", message.author, {
      title: "Некоректна команда",
      description:
        "Правильний синтаксис: `!таймаут @користувач [хвилини] [причина]` або `!таймаут [id] [хвилини] [причина]`",
    });
    await message.reply({ embeds: [embed] });
    return;
  }

  if (isNaN(durationMinutes) || durationMinutes <= 0) {
    const embed = createEmbed("usage", message.author, {
      title: "Некоректний час",
      description:
        "Вкажи правильну кількість хвилин (наприклад: `!таймаут @користувач 10 причина`).",
    });
    await message.reply({ embeds: [embed] });
    return;
  }

  if (!target.moderatable) {
    const embed = createEmbed("error", message.author, {
      title: "Неможливо",
      description: `Я не можу видати таймаут ${target.user.tag}.`,
      thumbnailURL: target.user.displayAvatarURL({
        extension: "png",
        size: 1024,
      }),
    });
    await message.reply({ embeds: [embed] });
    return;
  }

  await target.timeout(durationMinutes * 60 * 1000, reason);

  const embed = createEmbed("success", message.author, {
    title: "Користувач отримав таймаут",
    fields: [
      { name: "Користувач:", value: target.user.tag },
      { name: "Модератор:", value: message.author.tag },
      { name: "Тривалість:", value: `${durationMinutes} хв.` },
      { name: "Причина:", value: reason },
    ],
    thumbnailURL: target.user.displayAvatarURL({
      extension: "png",
      size: 1024,
    }),
  });
  await message.reply({ embeds: [embed] });
}
