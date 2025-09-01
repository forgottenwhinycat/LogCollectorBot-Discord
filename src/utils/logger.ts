import {
  Client,
  Message,
  PartialMessage,
  GuildMember,
  MessageReaction,
  PartialMessageReaction,
  User,
  PartialUser,
} from "discord.js";

import ready from "../event/client/ready";
import guildMemberAdd from "../event/guild/guildMemberAdd";
import guildMemberRemove from "../event/guild/guildMemberRemove";
import messageCreate from "../event/message/messageCreate";
import messageDelete from "../event/message/messageDelete";
import messageUpdate from "../event/message/messageUpdate";
import reactionAdd from "../event/message/reactions/reactionAdd";
import reactionRemove from "../event/message/reactions/reactionRemove";

export function registerEvents(client: Client) {
  try {
    if (!client) {
      throw new Error("Клієнт не ініціалізовано");
    }

    if (typeof ready !== "function") {
      throw new Error("Обробник події Ready не є функцією");
    }

    client.once("clientReady", ready);

    if (typeof messageCreate !== "function") {
      throw new Error("Обробник події messageCreate не є функцією");
    }

    client.on("messageCreate", messageCreate);

    client.on("messageDelete", async (message: Message | PartialMessage) => {
      try {
        if (message.partial) {
          try {
            const fullMessage = await message.fetch();
            if (typeof messageDelete !== "function") {
              throw new Error("Обробник події messageDelete не є функцією");
            }
            messageDelete(fullMessage);
          } catch (err: any) {
            if (err.code === 10008) {
              console.warn(
                "Повідомлення вже недоступне (Unknown Message). Пропускаю."
              );
              return;
            }
            console.error("Не вдалося отримати видалене повідомлення:", err);
          }
        } else {
          if (typeof messageDelete !== "function") {
            throw new Error("Обробник події messageDelete не є функцією");
          }
          messageDelete(message);
        }
      } catch (err) {
        console.error("Помилка в обробці події messageDelete:", err);
      }
    });

    if (typeof messageUpdate !== "function") {
      throw new Error("Обробник події messageUpdate не є функцією");
    }
    client.on("messageUpdate", messageUpdate);

    client.on(
      "messageReactionAdd",
      async (
        reaction: MessageReaction | PartialMessageReaction,
        user: User | PartialUser
      ) => {
        try {
          if (reaction.partial) {
            reaction = await reaction.fetch();
          }
          if (user.partial) {
            user = await user.fetch();
          }

          if (typeof reactionAdd !== "function") {
            throw new Error("Обробник події reactionAdd не є функцією");
          }
          reactionAdd(reaction as MessageReaction, user as User);
        } catch (err) {
          console.error("Помилка при обробці доданої реакції:", err);
        }
      }
    );

    client.on(
      "messageReactionRemove",
      async (
        reaction: MessageReaction | PartialMessageReaction,
        user: User | PartialUser
      ) => {
        try {
          if (reaction.partial) {
            reaction = await reaction.fetch();
          }
          if (user.partial) {
            user = await user.fetch();
          }

          if (typeof reactionRemove !== "function") {
            throw new Error("Обробник події reactionRemove не є функцією");
          }
          reactionRemove(reaction as MessageReaction, user as User);
        } catch (err) {
          console.error("Помилка при обробці видаленої реакції:", err);
        }
      }
    );

    if (typeof guildMemberAdd !== "function") {
      throw new Error("Обробник події guildMemberAdd не є функцією");
    }
    
    client.on("guildMemberAdd", guildMemberAdd);

    client.on("guildMemberRemove", (member) => {
      try {
        if (typeof guildMemberRemove !== "function") {
          throw new Error("Обробник події guildMemberRemove не є функцією");
        }
        guildMemberRemove(member as GuildMember);
      } catch (err) {
        console.error("Помилка в обробці події guildMemberRemove:", err);
      }
    });
  } catch (err) {
    console.error(
      "Помилка під час реєстрації на подію:",
      err instanceof Error ? err.message : err
    );
    throw err;
  }
}
