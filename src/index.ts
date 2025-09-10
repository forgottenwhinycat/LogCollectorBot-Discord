import "dotenv/config";
import { client } from "./client";

if (!process.env.DISCORD_TOKEN) {
  throw new Error("DISCORD_TOKEN не визначений в .env файлі");
}

client.login(process.env.DISCORD_TOKEN).catch((error) => {
  console.error("Бот не зміг приєднатися до діскорду:", error);
  process.exit(1);
});
