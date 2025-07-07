import { ButtonKit, SlashCommandProps } from "commandkit";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  Snowflake,
  ThreadAutoArchiveDuration,
} from "discord.js";
import { v4 as uuid } from "uuid";
import { mainConfigManager } from "../../../config";
import getCommandFailedToRunEmbed from "../../../utils/getCommandFailedToRunEmbed";
import getCommandSuccessEmbed from "../../../utils/getCommandSuccessEmbed";
import Suggestions from "../../../schemas/Suggestion";

export default async function ({ interaction }: SlashCommandProps) {
  await interaction.deferReply({ flags: "Ephemeral" });
  const suggestion = interaction.options.getString("suggestion", true);
  const attachment = interaction.options.getAttachment("attachment", false);

  if (attachment && !attachment.contentType?.startsWith("image/")) {
    await interaction.editReply({
      embeds: [getCommandFailedToRunEmbed("You can only attach images")],
    });
    return;
  }

  const channel = await interaction.client.channels.fetch(
    mainConfigManager.config.channels.suggestions,
  );
  if (!channel?.isSendable()) {
    await interaction.editReply({
      embeds: [
        getCommandFailedToRunEmbed(
          "Invalid config - suggestion channel invalid",
        ),
      ],
    });
    return;
  }

  const suggestionID = uuid();

  const embed = new EmbedBuilder()
    .setTitle("Suggestion")
    .addFields([
      {
        name: "Submitted by:",
        value: `<@!${interaction.user.id}> (\`${interaction.user.id}\`)`,
      },
      {
        name: "Suggestion:",
        value: suggestion,
      },
    ])
    .setFooter({
      text: `ID: ${suggestionID}`,
    });

  if (attachment) {
    embed.setImage(attachment.url);
  }

  const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents([
    new ButtonBuilder({
      customId: `sug_up_${suggestionID}`,
      label: `0 | Upvote`,
      style: ButtonStyle.Success,
    }),
    new ButtonBuilder({
      customId: `sug_down_${suggestionID}`,
      label: `0 | Downvote`,
      style: ButtonStyle.Danger,
    }),
    new ButtonBuilder({
      customId: `sug_myvote_${suggestionID}`,
      label: `Check my vote`,
      style: ButtonStyle.Secondary,
    }),
  ]);

  const message = await channel.send({
    content: `<@!${interaction.user.id}>`,
    embeds: [embed],
    components: [actionRow],
  });
  message
    .startThread({
      name: suggestion.slice(0, 100),
      autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
      reason: "Automatically opened thread under a suggestion",
    })
    .then((thread) => thread.send("Thread opened for discussion!"));

  await Suggestions.create({
    ID: suggestionID,
    content: suggestion,
    attachmentURL: attachment?.url ?? null,
    author: interaction.user.id,
    messageID: message.id,
  });

  await interaction.editReply({ embeds: [getCommandSuccessEmbed()] });
}
