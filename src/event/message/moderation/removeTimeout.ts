import { Message, PermissionFlagsBits } from "discord.js";
import { logToChannel } from "../../../utils/logToChannel";

export async function removeTimeoutCommand(message: Message, args: string[]) {
  try {
    const logChannelId = process.env.LOG_CHANNEL_ID;

    if (!message.member?.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      if (logChannelId) {
        await logToChannel(message.client, logChannelId, message.author, {
          title: "Немає прав",
          description: "У тебе немає прав на **зняття таймаутів**.",
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
            "Щоб прибрати таймаут:\n`!прибратиТаймаут @користувач [причина]` або `!прибратиТаймаут [id] [причина]`",
          type: "info",
        });
      }
      return;
    }

    const mention = message.mentions.members?.first();
    const id = args[0]?.replace(/\D/g, "");
    const target =
      mention ??
      (id ? await message.guild!.members.fetch(id).catch(() => null) : null);

    if (!target) {
      if (logChannelId) {
        await logToChannel(message.client, logChannelId, message.author, {
          title: "Неможливо",
          description: `Користувача з ID \`${id}\` не знайдено на сервері.`,
          type: "error",
        });
      }
      return;
    }

    if (!target.isCommunicationDisabled()) {
      if (logChannelId) {
        await logToChannel(message.client, logChannelId, message.author, {
          title: "Інформація",
          description: `${target.user.tag} зараз **не має таймауту**.`,
          thumbnailURL: target.user.displayAvatarURL(),
          type: "info",
        });
      }
      return;
    }

    const reason = args.slice(1).join(" ") || "Без причини";
    await target.timeout(null, reason);

    if (logChannelId) {
      await logToChannel(message.client, logChannelId, message.author, {
        title: "Таймаут знятий",
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
      "Помилка при виконанні команди !прибратиТаймаут:",
      err instanceof Error ? err.message : err
    );

    const logChannelId = process.env.LOG_CHANNEL_ID;

    if (logChannelId) {
      await logToChannel(message.client, logChannelId, message.author, {
        title: "Помилка",
        description: "Сталася помилка під час зняття таймауту.",
        type: "error",
      });
    }
  }
}
