import { ValidationProps } from "commandkit";
import { EmbedBuilder } from "discord.js";
import CustomCommandOptions from "../types/CustomCommandOptions";
import getNoPermissionEmbed from "../utils/getNoPermissionEmbed";
import config from "../config";

export default function({commandObj, interaction, handler}: ValidationProps): boolean {
   //* Type checks 
   if (!commandObj.options) return false;
   if (!interaction.inCachedGuild()) return false;

   //* Property check
   const commandOptions: CustomCommandOptions = commandObj.options;
   if (!commandOptions.devShrOnly) return false;

   //* Dev Only check
   const noPermsEmbed = getNoPermissionEmbed("This command is dev and SHR only.");
  
   if (!handler.devUserIds.includes(interaction.user.id) && !interaction.member.roles.cache.has(config.shrRole)) {
      if (interaction.isChatInputCommand()) {
         interaction.reply({flags: "Ephemeral", embeds: [noPermsEmbed]});
      }
      return true;
   }

   return false;
}
