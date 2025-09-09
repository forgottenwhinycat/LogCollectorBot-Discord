import { Message, PermissionFlagsBits } from "discord.js";
import { createEmbed } from "../../../utils/embed";

export async function removeTimeoutCommand(message: Message, args: string[]) {
  if (!message.member?.permissions.has(PermissionFlagsBits.ModerateMembers)) {
    const embed = createEmbed("error", message.author, {
      title: "Немає прав",
      description: "У тебе немає прав на **зняття таймаутів**.",
    });
    await message.reply({ embeds: [embed] });
    return;
  }

  if (args.length < 1) {
    const embed = createEmbed("usage", message.author, {
      title: "Використання команди",
      description:
        "Щоб прибрати таймаут:\n`!прибратиТаймаут @користувач [причина]` або `!прибратиТаймаут [id] [причина]`",
    });
    await message.reply({ embeds: [embed] });
    return;
  }

  const mentioned = message.mentions.members?.first();
  const providedId = args[0]?.replace(/\D/g, "");
  const reason = args.slice(mentioned ? 1 : 1).join(" ") || "Без причини";

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
        "Правильний синтаксис: `!прибратиТаймаут @користувач [причина]` або `!прибратиТаймаут [id] [причина]`",
    });
    await message.reply({ embeds: [embed] });
    return;
  }

  if (!target.isCommunicationDisabled()) {
    const embed = createEmbed("info", message.author, {
      title: "Інформація",
      description: `${target.user.tag} зараз **не має таймауту**.`,
      thumbnailURL: target.user.displayAvatarURL({
        extension: "png",
        size: 1024,
      }),
    });
    await message.reply({ embeds: [embed] });
    return;
  }

  try {
    await target.timeout(null, reason);
    const embed = createEmbed("success", message.author, {
      title: "Таймаут знятий",
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
      description: `Не вдалося прибрати таймаут ${target.user.tag}.`,
      thumbnailURL: target.user.displayAvatarURL({
        extension: "png",
        size: 1024,
      }),
    });
    await message.reply({ embeds: [embed] });
  }
}
