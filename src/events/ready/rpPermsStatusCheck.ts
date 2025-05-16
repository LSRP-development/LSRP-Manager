import { ActionRowBuilder, ButtonStyle, Client, ClientUser, EmbedBuilder } from "discord.js";
import { RPPerms } from "../../schemas/RPPerms";
import { mainConfigManager } from "../../config";
import { ButtonKit } from "commandkit";
import { v4 as uuid } from "uuid";
import robloxApiWrapper from "../../wrappers/robloxApiWrapper";

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
    const players = await robloxApiWrapper.getUsernamesFromIDs(perm.members);

    if (!players || players === "ERR") continue;

    const playerUsers = players.usernames;

    const fields: { name: string, value: string, inline: boolean }[] = [
      { name: "Staff", value: `<@!${perm.actionBy}>`, inline: true },
      { name: "Players", value: `${playerUsers.join(", ")}`, inline: true },
      { name: "Roleplay", value: perm.type, inline: true },
      { name: "Executed at", value: `<t:${Math.floor(perm.time.executed / 1000)}:t>`, inline: true },
      { name: "Ends", value: `<t:${Math.floor(perm.time.ends / 1000)}:t> <t:${Math.floor(perm.time.ends / 1000)}:R>`, inline: true },
      { name: "Active", value: `Yes`, inline: false },
    ]

    const embed = new EmbedBuilder()
      .setTitle("Roleplay permissions")
      .addFields(fields)
      .setFooter({ text: `ID: ${perm.ID}` })
      .setColor("Green");

    const invalidateButton = new ButtonKit()
      .setCustomId(uuid())
      .setStyle(ButtonStyle.Danger)
      .setLabel("Invalidate");

    const row = new ActionRowBuilder<ButtonKit>().addComponents(invalidateButton);

    const message = await permsChannel.send({ embeds: [embed], components: [row], content: playerUsers.join(" ") });

    invalidateButton
      .onClick(
        (subInteraction) => {
          subInteraction.deferUpdate();
        },
        {
          message,
          time: perm.time.ends - Date.now(),
          max: 1,
          autoReset: false,
        }
      )
      .onEnd(
        async () => {
          invalidateButton.setDisabled(true);
          fields.find(f => f.name.startsWith("Active"))!.value = "No";
          embed.setFields(fields);
          embed.setColor("Red");
          message.edit({ components: [row], embeds: [embed] }).then(() => {
            setTimeout((): any => message.delete(), mainConfigManager.config.rpPermsMessageDeleteDelay);
          });
          await perm.updateOne({ $set: { active: false } });
        }
      );
  }
}
