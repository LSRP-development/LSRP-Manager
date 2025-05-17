import { ActionRowBuilder, ButtonStyle, Client, ClientUser, EmbedBuilder } from "discord.js";
import { RPPerms } from "../../schemas/RPPerms";
import { mainConfigManager } from "../../config";
import { ButtonKit } from "commandkit";
import { v4 as uuid } from "uuid";
import robloxApiWrapper from "../../wrappers/robloxApiWrapper";
import { sendRPPermsMessage } from "../../subcommands/log/src/rp-perms";

export default async function (client: Client<true>) {
  let activePerms = await RPPerms.find({ active: true });

  const currentTime = Date.now();

  for (const perm of activePerms) {
    if (currentTime >= perm.time.ends) {
      await perm.updateOne({ $set: { active: false } });
    }
  }

  await mainConfigManager.updateCache();
  const permsChannel = await client.channels.fetch(mainConfigManager.config.channels.rpPerms);
  if (!permsChannel || !permsChannel.isTextBased() || !permsChannel.isSendable()) return;

  for (const [, msg] of await permsChannel.messages.fetch()) {
    await msg.delete();
  }

  activePerms = await RPPerms.find({ active: true });

  for (const perm of activePerms) {
    sendRPPermsMessage(perm.ID, client);
  }
}
