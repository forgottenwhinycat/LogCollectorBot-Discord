import { Client, OAuth2Scopes, PermissionsBitField } from "discord.js";

export default async (client: Client) => {
  try {
    if (!client.user) {
      throw new Error(
        "Користувач клієнта недоступний. Переконайтеся, що бот увійшов у систему.."
      );
    }

    const invite = await client.generateInvite({
      permissions: [PermissionsBitField.Flags.Administrator],
      scopes: [OAuth2Scopes.Bot],
    });

    if (!invite) {
      throw new Error(
        "Не вдалося створити посилання для запрошення. Перевірте дозволи та області дії."
      );
    }

    console.log(`
==========================================
 Бот успішно запустився!
 Залогінено як: ${client.user.tag}
==========================================
 Додати бота на сервер можна за посиланням:
 ${invite}
==========================================
 Підказка: перевір, що в .env правильно вказаний LOG_CHANNEL_ID
 та що у бота є права на відправку повідомлень у цей канал.
==========================================
    `);
  } catch (error) {
    console.error(
      "Під час запуску бота сталася помилка:",
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  }
};
