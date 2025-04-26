import { ValidationProps } from "commandkit";
import { mainConfigManager } from "../config";
import getNoPermissionEmbed from "../utils/getNoPermissionEmbed";

export default function ({ interaction, handler }: ValidationProps) {
  if (!interaction.inCachedGuild()) return false;

  const config = mainConfigManager.config;

  if (config.devOnlyMode) {
    if (!handler.devUserIds.includes(interaction.user.id)) {
      if (interaction.isChatInputCommand()) {
        interaction.reply({ flags: "Ephemeral", embeds: [getNoPermissionEmbed("The bot is currently in dev-only mode. Only developers are allowed to run commands.")] });
      }
      return true;
    }
  }
  return false;
}
