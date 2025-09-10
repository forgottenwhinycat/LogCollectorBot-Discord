import { Message, PermissionFlagsBits } from "discord.js";
import { logToChannel } from "../../../utils/logToChannel";

export async function banCommand(message: Message, args: string[]) {
  try {
    const logChannelId = process.env.LOG_CHANNEL_ID;

    if (!message.member?.permissions.has(PermissionFlagsBits.BanMembers)) {
      if (logChannelId) {
        await logToChannel(message.client, logChannelId, message.author, {
          title: "Немає прав",
          description: "У тебе немає прав на **бан користувачів**.",
          type: "error",
        });
      }
      return;
    }

    if (args.length === 0) {
      if (logChannelId) {
        await logToChannel(message.client, logChannelId, message.author, {
          title: "Використання команди",
          description:
            "Щоб забанити користувача:\n`!бан @користувач [причина]` або `!бан [id] [причина]`",
          type: "info",
        });
      }
      return;
    }

    const mention = message.mentions.members?.first();
    const id = args[0]?.replace(/\D/g, "");
    let target =
      mention ??
      (id ? await message.guild!.members.fetch(id).catch(() => null) : null);

    if (!target) {
      if (logChannelId) {
        await logToChannel(message.client, logChannelId, message.author, {
          title: "Неможливо",
          description: `Користувач з ID \`${id}\` не знайдений на сервері.`,
          type: "error",
        });
      }
      return;
    }

    if ("bannable" in target && !target.bannable) {
      if (logChannelId) {
        await logToChannel(message.client, logChannelId, message.author, {
          title: "Неможливо",
          description: `Я не можу забанити ${target.user.tag}.`,
          thumbnailURL: target.user.displayAvatarURL(),
          type: "error",
        });
      }
      return;
    }

    const reason = args.slice(1).join(" ") || "Без причини";

    await target.ban({ reason });

    if (logChannelId) {
      await logToChannel(message.client, logChannelId, message.author, {
        title: "Користувач забанений",
        fields: [
          { name: "Користувач:", value: target.user.tag },
          { name: "Модератор:", value: message.author.tag },
          { name: "Причина:", value: reason },
        ],
        thumbnailURL: target.user.displayAvatarURL(),
        footerText: message.guild?.name,
        showTimestamp: true,
        type: "success",
      });
    }
  } catch (err) {
    console.error(
      "Помилка при виконанні команди !бан:",
      err instanceof Error ? err.message : err
    );

    const logChannelId = process.env.LOG_CHANNEL_ID;
    if (logChannelId) {
      await logToChannel(message.client, logChannelId, message.author, {
        title: "Помилка",
        description: "Сталася помилка під час виконання команди !бан.",
        type: "error",
      });
    }
  }
}
