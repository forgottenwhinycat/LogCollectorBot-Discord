import { Message } from "discord.js";
import { banCommand } from "./moderation/ban";
import { unbanCommand } from "./moderation/unban";
import { timeoutCommand } from "./moderation/timeout";
import { removeTimeoutCommand } from "./moderation/removeTimeout";
import { createEmbed } from "../../utils/embed";

export async function moderationCommands(message: Message) {
  try {
    if (message.author.bot) return;

    const args = message.content.trim().split(/\s+/);
    const command = args.shift()?.toLowerCase();

    switch (command) {
      case "!бан":
        await banCommand(message, args);
        break;
      case "!розбанити":
        await unbanCommand(message, args);
        break;
      case "!таймаут":
        await timeoutCommand(message, args);
        break;
      case "!прибратитаймаут":
        await removeTimeoutCommand(message, args);
        break;
      default:
        await message.reply({
          embeds: [
            createEmbed("info", message.author, {
              title: "Невідома команда",
              description: `Команда \`${command}\` не розпізнана.`,
            }),
          ],
        });
        break;
    }
  } catch (err) {
    console.error("Помилка в moderationCommands:", err);
  }
}
