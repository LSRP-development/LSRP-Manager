import { ButtonKit, SlashCommandProps } from "commandkit";
import { ActionRowBuilder, ButtonStyle, Client, EmbedBuilder, EmbedField } from "discord.js";
import { mainConfigManager } from "../../../config";
import getCommandFailedToRunEmbed from "../../../utils/getCommandFailedToRunEmbed";
import splitPlayerString from "../../../utils/splitPlayerString";
import { v4 as uuid } from "uuid";
import { RPPerms } from "../../../schemas/RPPerms";
import robloxApiWrapper from "../../../wrappers/robloxApiWrapper";
import getCommandSuccessEmbed from "../../../utils/getCommandSuccessEmbed";
import { config } from "dotenv";
import getCommandLoadingEmbed from "../../../utils/getCommandLoadingEmbed";

export async function sendRPPermsMessage(permsID: string, client: Client): Promise<"SUCCESS" | "ERR_PERMS_NOT_FOUND" | "ERR_DOC_CORRUPTED" | "ERR_INVALID_CHANNEL"> {
  const doc = await RPPerms.findOne({ ID: permsID });
  if (!doc) return "ERR_PERMS_NOT_FOUND";

  const playerNameUsers = (await robloxApiWrapper.getUsernamesFromIDs(doc.members));
  if (!playerNameUsers || playerNameUsers === "ERR") return "ERR_DOC_CORRUPTED";
  const playerNames = playerNameUsers.usernames;

  const fields: { name: string, value: string, inline: boolean }[] = [
    { name: "Staff", value: `<@!${doc.actionBy}>`, inline: true },
    { name: "Players", value: `${playerNames.join(", ")}`, inline: true },
    { name: "Roleplay", value: doc.type, inline: true },
    { name: "Executed at", value: `<t:${Math.floor(doc.time.executed / 1000)}:t>`, inline: true },
    { name: "Ends", value: `<t:${Math.floor(doc.time.ends / 1000)}:t> <t:${Math.floor(doc.time.ends / 1000)}:R>`, inline: true },
    { name: "Active", value: `Yes`, inline: false },
  ]

  const channel = await client.channels.fetch(mainConfigManager.config.channels.rpPerms);
  if (!channel?.isTextBased() || !channel.isSendable()) return "ERR_INVALID_CHANNEL";

  const embed = new EmbedBuilder()
    .setTitle("Roleplay permissions")
    .addFields(fields)
    .setFooter({ text: `ID: ${permsID}` })
    .setColor("Green");

  const invalidateButton = new ButtonKit()
    .setCustomId(uuid())
    .setStyle(ButtonStyle.Danger)
    .setLabel("Invalidate");

  const row = new ActionRowBuilder<ButtonKit>().addComponents(invalidateButton);

  const message = await channel.send({ embeds: [embed], components: [row], content: playerNames.join(" ") });

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
        const currentDate = Date.now();
        invalidateButton.setDisabled(true);
        fields.find(f => f.name.startsWith("Active"))!.value = "No";
        fields.push({ name: "Invalid since", value: `<t:${Math.floor(currentDate / 1000)}:t>`, inline: true });
        embed.setFields(fields);
        embed.setColor("Red");
        message.edit({ components: [row], embeds: [embed] }).then(() => {
          setTimeout((): any => message.delete(), mainConfigManager.config.rpPermsMessageDeleteDelay);
        });
        const time = doc.time;
        time.invalidated = currentDate;
        await doc.updateOne({ $set: { active: false, time } });
      }
    );

  return "SUCCESS";
}

export default async function ({ interaction }: SlashCommandProps) {
  await interaction.deferReply({ flags: "Ephemeral" });
  const playersString = interaction.options.getString("players", true);
  const roleplay = interaction.options.getString("roleplay", true);

  await interaction.editReply({ embeds: [getCommandLoadingEmbed("Finding players...")] });

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

  const channel = await interaction.client.channels.fetch(mainConfigManager.config.channels.rpPerms);
  if (!channel?.isSendable()) {
    await interaction.editReply({ embeds: [getCommandFailedToRunEmbed("Invalid config - roleplayPerms channel invalid")] });
    return;
  }

  const permsID = uuid();

  const executed = Date.now();
  const ends = Date.now() + mainConfigManager.config.rpPermsLifetime;

  await interaction.editReply({ embeds: [getCommandLoadingEmbed("Saving in database...")] });

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

  await interaction.editReply({ embeds: [getCommandLoadingEmbed("Sending messages...")] });

  const result = await sendRPPermsMessage(permsID, interaction.client);

  if (result !== "SUCCESS") {
    await interaction.editReply({ embeds: [getCommandFailedToRunEmbed("There was an error while sending the message.")] });
    return;
  }

  await interaction.editReply({ embeds: [getCommandSuccessEmbed()] });
}
