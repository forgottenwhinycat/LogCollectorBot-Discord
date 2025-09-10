import { MessageReaction, User } from "discord.js";
import { logToChannel } from "../../../utils/logToChannel";

export default async (reaction: MessageReaction, user: User) => {
  try {
    if (reaction.partial) {
      try {
        reaction = await reaction.fetch();
      } catch (fetchError) {
        console.error("Не вдалося отримати частину реакції:", fetchError);
        return;
      }
    }

    if (!reaction.message.guild) return;

    const logChannelId = process.env.LOG_CHANNEL_ID;
    if (!logChannelId) return;

    await logToChannel(reaction.message.client, logChannelId, user, {
      title: "Реакцію додано!",
      fields: [
        { name: "Емодзі:", value: `${reaction.emoji}`, inline: true },
        {
          name: "Користувач:",
          value: `${user.tag} (ID: ${user.id})`,
          inline: true,
        },
        { name: "Канал:", value: `${reaction.message.channel}`, inline: true },
        {
          name: "ID повідомлення:",
          value: `${reaction.message.id}`,
          inline: true,
        },
      ],
      thumbnailURL: user.displayAvatarURL(),
      footerText: reaction.message.guild.name,
      showTimestamp: true,
      type: "success",
    });
  } catch (err) {
    console.error(
      "Помилка при логуванні доданої реакції:",
      err instanceof Error ? err.message : err
    );
  }
};
