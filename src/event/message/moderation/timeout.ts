import { Message, PermissionFlagsBits } from "discord.js";
import { logToChannel } from "../../../utils/logToChannel";

export async function timeoutCommand(message: Message, args: string[]) {
  try {
    const logChannelId = process.env.LOG_CHANNEL_ID;

    if (!message.member?.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      if (logChannelId) {
        await logToChannel(message.client, logChannelId, message.author, {
          title: "Немає прав",
          description: "У тебе немає прав на **таймаути**.",
          type: "error",
        });
      }
      return;
    }

    if (args.length < 2) {
      if (logChannelId) {
        await logToChannel(message.client, logChannelId, message.author, {
          title: "Використання команди",
          description:
            "Щоб видати таймаут:\n`!таймаут @користувач [хвилини] [причина]` або `!таймаут [id] [хвилини] [причина]`",
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
          title: "Помилка",
          description: `Не вдалося знайти користувача з ID \`${id}\` на сервері.`,
          type: "error",
        });
      }
      return;
    }

    const durationMinutes = parseInt(args[mention ? 1 : 1], 10);
    if (isNaN(durationMinutes) || durationMinutes <= 0) {
      if (logChannelId) {
        await logToChannel(message.client, logChannelId, message.author, {
          title: "Некоректний час",
          description:
            "Вкажи правильну кількість хвилин (наприклад: `!таймаут @користувач 10 причина`).",
          type: "error",
        });
      }
      return;
    }

    if (!target.moderatable) {
      if (logChannelId) {
        await logToChannel(message.client, logChannelId, message.author, {
          title: "Неможливо видати таймаут",
          description: `Я не можу видати таймаут ${target.user.tag}.`,
          thumbnailURL: target.user.displayAvatarURL({
            extension: "png",
            size: 1024,
          }),
          type: "error",
        });
      }
      return;
    }

    const reason = args.slice(mention ? 2 : 2).join(" ") || "Без причини";
    await target.timeout(durationMinutes * 60 * 1000, reason);

    if (logChannelId) {
      await logToChannel(message.client, logChannelId, message.author, {
        title: "Таймаут видано",
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
        footerText: message.guild?.name,
        showTimestamp: true,
        type: "success",
      });
    }
  } catch (err) {
    console.error(
      "Помилка при виконанні команди !таймаут:",
      err instanceof Error ? err.message : err
    );

    const logChannelId = process.env.LOG_CHANNEL_ID;
    if (logChannelId) {
      await logToChannel(message.client, logChannelId, message.author, {
        title: "Помилка",
        description: "Сталася помилка під час видання таймауту.",
        type: "error",
      });
    }
  }
}
