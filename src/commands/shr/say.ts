import { SlashCommandProps } from "commandkit";
import { SlashCommandBuilder } from "discord.js";
import CustomCommandOptions from "../../types/CustomCommandOptions";

export const data = new SlashCommandBuilder()
  .setName("say")
  .setDescription("Make the bot say something.")
  .addStringOption(o => o
    .setName("input")
    .setDescription("The text for the bot to say.")
    .setRequired(true)
  )

export function run({ interaction }: SlashCommandProps) {
  const input = interaction.options.getString("input", true);
  interaction.reply({ flags: "Ephemeral", content: "ok" });
  if (interaction.channel && interaction.channel?.isTextBased() && interaction.channel.isSendable()) {
    interaction.channel.send({ content: input }).catch(console.log);
  }
}

export const options: CustomCommandOptions = {
  skipCategoryPerms: true,
  devShrOnly: true
}
