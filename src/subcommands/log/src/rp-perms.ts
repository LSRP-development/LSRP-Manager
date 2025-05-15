import { ButtonKit, SlashCommandProps } from "commandkit";
import { ActionRowBuilder, ButtonStyle, EmbedBuilder, EmbedField } from "discord.js";
import { mainConfigManager } from "../../../config";
import getCommandFailedToRunEmbed from "../../../utils/getCommandFailedToRunEmbed";
import splitPlayerString from "../../../utils/splitPlayerString";
import { v4 as uuid } from "uuid";
import { RPPerms } from "../../../schemas/RPPerms";
import robloxApiWrapper from "../../../wrappers/robloxApiWrapper";
import getCommandSuccessEmbed from "../../../utils/getCommandSuccessEmbed";
import { config } from "dotenv";

export default async function ({ interaction }: SlashCommandProps) {
  await interaction.deferReply({ flags: "Ephemeral" });
  const playersString = interaction.options.getString("players", true);
  const roleplay = interaction.options.getString("roleplay", true);

  const players = splitPlayerString(playersString);
  const playerUsers = (await robloxApiWrapper.getIdsFromUsernames(players));

  if (playerUsers === "ERR") {
    interaction.editReply({ embeds: [getCommandFailedToRunEmbed("There was an error while running this command.")] })
    return;
  }

  if (!playerUsers) {
    interaction.editReply({ embeds: [getCommandFailedToRunEmbed("At least one player is invalid.")] });
    return;
  }

  const playerIDs = playerUsers.ids;

  const playerNameUsers = (await robloxApiWrapper.getUsernamesFromIDs(playerIDs));
  if (!playerNameUsers || playerNameUsers === "ERR") return;
  const playerNames = playerNameUsers.usernames;

  const channel = await interaction.client.channels.fetch(mainConfigManager.config.channels.rpPerms);
  if (!channel?.isSendable()) {
    await interaction.editReply({ embeds: [getCommandFailedToRunEmbed("Invalid config - roleplayPerms channel invalid")] });
    return;
  }

  const permsID = uuid();

  const executed = Date.now();
  const ends = Date.now() + mainConfigManager.config.rpPermsLifetime;

  const fields: { name: string, value: string, inline: boolean }[] = [
    { name: "Staff", value: `<@!${interaction.user.id}> (${interaction.user.username})`, inline: true },
    { name: "Players", value: `${playerNames.join(", ")}`, inline: true },
    { name: "Roleplay", value: roleplay, inline: true },
    { name: "Executed at", value: `<t:${Math.floor(executed / 1000)}:t>`, inline: true },
    { name: "Ends", value: `<t:${Math.floor(ends / 1000)}:t> <t:${Math.floor(ends / 1000)}:R>`, inline: true },
    { name: "Active", value: `Yes`, inline: false },
  ]

  const embed = new EmbedBuilder()
    .setTitle("Roleplay permissions")
    // .setDescription(
    //   `**Perms by:** <@!${interaction.user.id}> (${interaction.user.username})\n` +
    //   `**Players:** ${players.join(", ")}\n` +
    //   `**Roleplay:** ${roleplay}\n` +
    //   `**Time executed:** <t:${Math.floor(executed / 1000)}:t>\n` +
    //   `**Ends at:** <t:${Math.floor(ends / 1000)}:t> <t:${Math.floor(ends / 1000)}:R>`
    // )
    .addFields(fields)
    .setFooter({ text: `ID: ${permsID}` })
    .setColor("Green");


  const doc = await RPPerms.create({
    ID: permsID,
    actionBy: interaction.user.id,
    type: roleplay,
    members: playerIDs,
    time: {
      executed,
      ends
    }
  })


  const invalidateButton = new ButtonKit()
    .setCustomId(uuid())
    .setStyle(ButtonStyle.Danger)
    .setLabel("Invalidate");

  const row = new ActionRowBuilder<ButtonKit>().addComponents(invalidateButton);

  const message = await channel.send({ embeds: [embed], components: [row] });

  invalidateButton
    .onClick(
      (subInteraction) => {
        subInteraction.deferUpdate();
      },
      {
        message,
        time: mainConfigManager.config.rpPermsLifetime,
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
        await doc.updateOne({ $set: { active: false } });
      }
    );

  await interaction.editReply({ embeds: [getCommandSuccessEmbed()] });
}
