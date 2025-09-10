import { User, TextChannel } from "discord.js";
import { createEmbed } from "./embed";

type LogType = "info" | "success" | "error";

interface LogOptions {
  title: string;
  description?: string;
  fields?: { name: string; value: string; inline?: boolean }[];
  thumbnailURL?: string;
  footerText?: string;
  showTimestamp?: boolean;
  type?: LogType;
}

export async function logToChannel(
  client: TextChannel["client"],
  logChannelId: string,
  target: User,
  options: LogOptions
) {
  const embed = createEmbed(options.type || "info", target, {
    title: options.title,
    description: options.description,
    fields: options.fields,
    thumbnailURL: options.thumbnailURL,
    footerText: options.footerText,
    showTimestamp: options.showTimestamp,
  });

  const logChannel = client.channels.cache.get(logChannelId);

  if (!logChannel || !("send" in logChannel)) {
    console.error(
      `Канал ${logChannelId} не знайдено або не підтримує надсилання повідомлень`
    );
    return;
  }

  await (logChannel as TextChannel)
    .send({ embeds: [embed] })
    .catch((error: unknown) => {
      console.error(
        `Не вдалося надіслати повідомлення журналу до каналу ${logChannelId}:`,
        error instanceof Error ? error.message : error
      );
    });
}
