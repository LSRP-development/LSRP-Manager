import { SlashCommandProps } from "commandkit";
import { SlashCommandBuilder } from "discord.js";
import CustomCommandOptions from "../../types/CustomCommandOptions";

export const data = new SlashCommandBuilder()
  .setName("kill")
  .setDescription("Kill the bot")

export async function run({ interaction, client }: SlashCommandProps) {
  interaction.client.destroy();
  client.destroy();
  console.log("Destroyed the client");
}

export const options: CustomCommandOptions = {
  skipCategoryPerms: true,
  devShrOnly: true,
  allowDevDMs: true
}
