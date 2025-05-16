import { SlashCommandProps } from "commandkit";
import Suggestions from "../../../schemas/Suggestion";
import getCommandFailedToRunEmbed from "../../../utils/getCommandFailedToRunEmbed";
import { mainConfigManager } from "../../../config";
import getCommandLoadingEmbed from "../../../utils/getCommandLoadingEmbed";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Snowflake } from "discord.js";
import _ from "lodash";
import getCommandSuccessEmbed from "../../../utils/getCommandSuccessEmbed";

export default async function ({ interaction }: SlashCommandProps) {
  await interaction.deferReply({ flags: "Ephemeral" });
  await interaction.editReply({ embeds: [getCommandLoadingEmbed("Getting suggestion info...")] });
  const id = interaction.options.getString("id", true);
  const reason = interaction.options.getString("reason", true);

  const document = await Suggestions.findOne({ ID: id });
  if (!document) {
    await interaction.editReply({ embeds: [getCommandFailedToRunEmbed("Suggestion not found")] });
    return;
  }

  if (document.approvalStatus) {
    await interaction.editReply({ embeds: [getCommandFailedToRunEmbed("Suggestion is already approved/denied")] });
    return;
  }

  const suggestionsChannel = await interaction.client.channels.fetch(mainConfigManager.config.channels.suggestions);
  if (!suggestionsChannel || !suggestionsChannel.isTextBased()) return;

  const suggestionMessage = await suggestionsChannel.messages.fetch(document.messageID);
  if (!suggestionMessage) {
    await interaction.editReply({ embeds: [getCommandFailedToRunEmbed("Suggestion message not found")] });
    return;
  }

  await interaction.editReply({ embeds: [getCommandLoadingEmbed("Approving suggestion...")] });

  await document.updateOne({
    $set: {
      approvalStatus: "approved",
      actionBy: interaction.user.id
    }
  });

  const [upvotes, downvotes] = _.partition([...(document.votes ?? new Map<Snowflake, "up" | "down">).values()], v => v === "up");
  const count = { up: upvotes.length, down: downvotes.length };

  const actionRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents([
      new ButtonBuilder({
        customId: `sug_up_${document.ID}`,
        label: `${count.up} | Upvote`,
        style: ButtonStyle.Success,
        disabled: true
      }),
      new ButtonBuilder({
        customId: `sug_down_${document.ID}`,
        label: `${count.down} | Downvote`,
        style: ButtonStyle.Danger,
        disabled: true
      })
    ]);

  const embed = new EmbedBuilder()
    .setTitle("Suggestion")
    .setDescription(`**Approved** - ${reason}`)
    .addFields([
      {
        name: "Submitted by:",
        value: `<@!${interaction.user.id}> (\`${interaction.user.id}\`)`
      },
      {
        name: "Suggestion:",
        value: document.content
      }
    ])
    .setFooter({
      text: `Approved by ${interaction.user.username} | ID: ${document.ID}`,
      iconURL: interaction.user.avatarURL({ forceStatic: true }) ?? undefined
    })
    .setColor("Green");

  await suggestionMessage.edit({ components: [actionRow], embeds: [embed] }).catch(() => null);
  await interaction.editReply({ embeds: [getCommandSuccessEmbed()] });
}
