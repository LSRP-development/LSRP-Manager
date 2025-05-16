import { ValidationProps } from "commandkit";
import { CommandCategories } from "../config/misc";
import { Snowflake } from "discord.js";
import getNoPermissionEmbed from "../utils/getNoPermissionEmbed";
import CustomCommandOptions from "../types/CustomCommandOptions";
import config, { mainConfigManager } from "../config";

export default function ({ interaction, handler, commandObj }: ValidationProps): boolean {
  if (!commandObj.category) return false;
  const commandCategory: CommandCategories = commandObj.category as CommandCategories;
  const commandOptions: CustomCommandOptions | undefined = commandObj.options;

  if (commandOptions?.skipCategoryPerms) return false;

  if (!interaction.member) return false;
  if (!interaction.inCachedGuild()) return false;

  if (interaction.member.roles.cache.hasAny(config.shrRole) && commandCategory !== "dev") {
    return false;
  }

  if (commandOptions?.skipCategoryPermsSubcommands && (interaction.isChatInputCommand() || interaction.isAnySelectMenu())) {
    let subcommand: null | string = null;
    try {
      subcommand = interaction.options.getSubcommand();
    } catch (e) { };
    const subcommandGroup = interaction.options?.getSubcommandGroup();

    for (const sc of commandOptions.skipCategoryPermsSubcommands) {
      if (sc.subcommand === subcommand) {
        if (sc.group) {
          if (sc.group === subcommandGroup) return false;
        } else return false;
      }
    }
  }

  let neededRoles: Array<Snowflake> | undefined;
  switch (commandCategory) {
    case "dev":
      if (!handler.devUserIds.includes(interaction.user.id)) {
        if (interaction.isChatInputCommand()) {
          interaction.reply({ flags: "Ephemeral", embeds: [getNoPermissionEmbed("This command is dev only.")] });
        }
        return true;
      }
      break;
    case "shr":
      neededRoles = [config.shrRole];
      break;
    case "staff":
      neededRoles = [mainConfigManager.config.roles.staff]
      break;
    default:
      neededRoles = undefined;
      break;
  }
  if (neededRoles === undefined) return false;
  if (!interaction.member.roles.cache.hasAny(...neededRoles)) {
    if (interaction.isChatInputCommand()) {
      interaction.reply({ flags: "Ephemeral", embeds: [getNoPermissionEmbed("Missing role.")] });
    }
    return true;
  }

  return false;
} 
