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
  }
): EmbedBuilder {
  const colors: Record<EmbedType, number> = {
    error: 0xff0000,
    usage: 0xe67e22,
    success: 0x2ecc71,
    info: 0x3498db,
  };

  const date = new Intl.DateTimeFormat("uk-UA", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date());

  const embed = new EmbedBuilder()
    .setColor(colors[type])
    .setTitle(options.title)
    .setFooter({
      text: `${author.username} • ${date}`,
      iconURL: author.displayAvatarURL({ extension: "png", size: 1024 }),
    });

  if (options.description) embed.setDescription(options.description);
  if (options.fields) embed.addFields(options.fields);
  if (options.thumbnailURL) embed.setThumbnail(options.thumbnailURL);

  return embed;
}
