import { SlashCommandProps } from "commandkit";
import { SlashCommandBuilder } from "discord.js";
import CustomCommandOptions from "../../types/CustomCommandOptions";
import getCommandFailedToRunEmbed from "../../utils/getCommandFailedToRunEmbed";

export const data = new SlashCommandBuilder()
  .setName("reply")
  .setDescription("Make the bot reply to a message with something.")
  .addStringOption(o => o
    .setName("id")
    .setDescription("The message to reply to")
    .setRequired(true)
  )
  .addStringOption(o => o
    .setName("input")
    .setDescription("The text for the bot to say.")
    .setRequired(true)
  )

export async function run({ interaction }: SlashCommandProps) {
  await interaction.deferReply({ flags: "Ephemeral" });
  try {
    const input = interaction.options.getString("input", true);
    const messageID = interaction.options.getString("id", true);
    const message = await interaction.channel?.messages.fetch(messageID);
    if (interaction.channel && interaction.channel?.isTextBased() && interaction.channel.isSendable() && message) {
      message.reply(input).catch(() => null);
    }
    interaction.editReply({ content: "ok" });
  } catch (e) {
    interaction.editReply({ embeds: [getCommandFailedToRunEmbed("There was an error.")] });
  }
}

export const options: CustomCommandOptions = {
  skipCategoryPerms: true,
  devShrOnly: true
}
