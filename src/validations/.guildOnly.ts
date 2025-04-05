import { ValidationProps } from "commandkit";
import getCommandFailedToRunEmbed from "../utils/getCommandFailedToRunEmbed";
import CustomCommandOptions from "../types/CustomCommandOptions";

export default function({interaction, commandObj, handler}: ValidationProps) {
  if ((commandObj.options as CustomCommandOptions)?.allowDevDMs && handler.devUserIds.includes(interaction.user.id)) {
    return false;
  } 

  if (!interaction.inCachedGuild()) {
    if (interaction.isChatInputCommand()) {
      interaction.reply({embeds: [getCommandFailedToRunEmbed("Commands in DMs aren't allowed.")]});
    }
    return true;
  }
}
