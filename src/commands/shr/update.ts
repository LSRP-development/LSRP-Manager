import { SlashCommandProps } from "commandkit";
import { SlashCommandBuilder } from "discord.js";
import { updateConfigCaches } from "../../config";
import getCommandSuccessEmbed from "../../utils/getCommandSuccessEmbed";
import getCommandLoadingEmbed from "../../utils/getCommandLoadingEmbed";

export const data = new SlashCommandBuilder()
  .setName("update")
  .setDescription("Updates department roles")

export async function run({ interaction }: SlashCommandProps) {
  await interaction.deferReply({ flags: "Ephemeral" })
  await interaction.editReply({ embeds: [getCommandLoadingEmbed("Updating")] })
  await updateConfigCaches();
  interaction.editReply({ embeds: [getCommandSuccessEmbed()] });
}
