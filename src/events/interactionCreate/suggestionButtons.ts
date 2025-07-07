import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
  Interaction,
  MessageReferenceType,
  Snowflake,
} from "discord.js";
import { mainConfigManager } from "../../config";
import Suggestions from "../../schemas/Suggestion";
import _ from "lodash";

export default async function (interaction: Interaction, client: Client<true>) {
  if (!interaction.inCachedGuild()) return;
  if (!interaction.isButton()) return;
  if (!interaction.customId.startsWith("sug")) return;

  const [, action, id]: [unknown, "up" | "down" | "myvote", string] =
    interaction.customId.split("_") as [
      "sug",
      "up" | "down" | "myvote",
      string,
    ];

  action !== "myvote"
    ? await interaction.deferUpdate()
    : await interaction.deferReply({ flags: "Ephemeral" });

  const vote = action !== "myvote" ? action : null;

  const document = await Suggestions.findOne({ ID: id });
  if (!document) {
    await interaction.followUp({
      flags: "Ephemeral",
      content: "Suggestion not found",
    });
    return;
  }

  const suggestionsChannel = await client.channels.fetch(
    mainConfigManager.config.channels.suggestions,
  );
  if (
    !suggestionsChannel ||
    !suggestionsChannel.isSendable() ||
    !suggestionsChannel.isTextBased()
  )
    return;

  await suggestionsChannel.messages.fetch();
  const suggestionMessage = suggestionsChannel.messages.cache.get(
    document.messageID,
  );
  if (!suggestionMessage) return;

  let userCurrentVote: "up" | "down" | null =
    document.votes?.get(interaction.user.id) ?? null;

  if (
    document.author === interaction.user.id &&
    vote &&
    userCurrentVote !== vote
  ) {
    await interaction.followUp({
      content: "You cannot vote for your own suggestion",
      flags: "Ephemeral",
    });
    return;
  }

  const votesMap = document.votes ?? new Map<Snowflake, "up" | "down">();

  if (action === "myvote") {
    await interaction.editReply({
      content: `You have ${!userCurrentVote ? "not " : ""}voted ${userCurrentVote ? userCurrentVote + " " : ""}for this suggestion`,
    });
    return;
  }

  if (vote === userCurrentVote) {
    votesMap?.delete(interaction.user.id);
  } else if (vote === "up") {
    votesMap?.set(interaction.user.id, "up");
  } else if (vote === "down") {
    votesMap?.set(interaction.user.id, "down");
  }

  const [upvotes, downvotes] = _.partition(
    [...votesMap.values()],
    (v) => v === "up",
  );
  const count = { up: upvotes.length, down: downvotes.length };

  const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents([
    new ButtonBuilder({
      customId: `sug_up_${document.ID}`,
      label: `${count.up} | Upvote`,
      style: ButtonStyle.Success,
    }),
    new ButtonBuilder({
      customId: `sug_down_${document.ID}`,
      label: `${count.down} | Downvote`,
      style: ButtonStyle.Danger,
    }),
    new ButtonBuilder({
      customId: `sug_myvote_${document.ID}`,
      label: `Check my vote`,
      style: ButtonStyle.Secondary,
    }),
  ]);

  await suggestionMessage.edit({ components: [actionRow] }).catch(() => null);

  await document.updateOne({
    $set: { votes: [...votesMap.entries()].length > 0 ? votesMap : null },
  });

  if (count.up >= mainConfigManager.config.suggestionUpvoteTreshold) {
    const mgmtChannel = await client.channels.fetch(
      mainConfigManager.config.channels.mgmtSuggestionNotifications,
    );
    if (!mgmtChannel?.isTextBased() || !mgmtChannel?.isSendable()) return;
    const messages = await mgmtChannel.messages.fetch();
    if (
      messages.find((msg) => {
        const reference = msg.reference?.messageId;
        if (!reference || msg.reference?.type !== MessageReferenceType.Forward)
          return false;
        return suggestionsChannel.messages.cache
          .get(reference)
          ?.embeds.at(0)
          ?.footer?.text.includes(`ID: ${document.ID}`);
      })
    )
      return;

    suggestionMessage.forward(mgmtChannel);
  }
}
