import { EmbedBuilder, User } from "discord.js";

type EmbedType = "error" | "usage" | "success" | "info";

export function createEmbed(
  type: EmbedType,
  author: User,
  options: {
    title: string;
    description?: string;
    fields?: { name: string; value: string; inline?: boolean }[];
    thumbnailURL?: string;
    footerText?: string;
    showTimestamp?: boolean;
  }
): EmbedBuilder {
  const colors: Record<EmbedType, number> = {
    error: 0xed4245,
    usage: 0xfaa61a,
    success: 0x57f287,
    info: 0x5865f2,
  };

  const date = new Intl.DateTimeFormat("uk-UA", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date());

  const embed = new EmbedBuilder()
    .setColor(colors[type])
    .setTitle(options.title)
    .setFooter({
      text: options.footerText ?? `${author.username} • ${date}`,
      iconURL: author.displayAvatarURL({ extension: "png", size: 1024 }),
    });

  if (options.description) embed.setDescription(options.description);
  if (options.fields) embed.addFields(options.fields);
  if (options.thumbnailURL) embed.setThumbnail(options.thumbnailURL);
  if (options.showTimestamp) embed.setTimestamp(new Date());

  return embed;
}
