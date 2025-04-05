import { CommandOptions, SlashCommandProps } from "commandkit";
import { SlashCommandBuilder } from "discord.js";
import CustomCommandOptions from "../../types/CustomCommandOptions";
import { departmentsManager, mainConfigManager, updateConfigCaches } from "../../config";
import { updateRolesInMain } from "../../funcs/memberRoleCheck";
import getCommandSuccessEmbed from "../../utils/getCommandSuccessEmbed";
import getCommandLoadingEmbed from "../../utils/getCommandLoadingEmbed";


export const data = new SlashCommandBuilder()
  .setName("mcheck")
  .setDescription(("idk"));


export async function run({interaction}: SlashCommandProps) {
  await interaction.deferReply({flags: "Ephemeral"});
  await interaction.editReply({embeds: [getCommandLoadingEmbed("Updating")]})
  await updateConfigCaches();
  await updateRolesInMain();
  interaction.editReply({embeds: [getCommandSuccessEmbed()]});
}

export const options: CustomCommandOptions = {
 devOnly: true,
 skipCategoryPerms: true
}
