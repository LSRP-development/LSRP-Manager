import { SlashCommandProps } from "commandkit";
import { SlashCommandBuilder } from "discord.js";
import suggestion from "../../subcommands/suggestion";
import CustomCommandOptions from "../../types/CustomCommandOptions";

export const data = new SlashCommandBuilder()
  .setName("suggestion")
  .setDescription("Suggestion system")
  .addSubcommand(s => s
    .setName("submit")
    .setDescription("Submit a suggestion.")
    .addStringOption(o => o
      .setName("suggestion")
      .setDescription("The suggestion you want to submit.")
      .setRequired(true)
    )
  )
  .addSubcommand(s => s
    .setName("approve")
    .setDescription("Approve a suggestion")
    .addStringOption(o => o
      .setName("id")
      .setDescription("ID of the suggestion")
      .setRequired(true)
    )
    .addStringOption(o => o
      .setName("reason")
      .setDescription("Reason of the approval")
      .setRequired(true)
    )
  )
  .addSubcommand(s => s
    .setName("deny")
    .setDescription("Deny a suggestion")
    .addStringOption(o => o
      .setName("id")
      .setDescription("ID of the suggestion")
      .setRequired(true)
    )
    .addStringOption(o => o
      .setName("reason")
      .setDescription("Reason of the denial")
      .setRequired(true)
    )
  )

export async function run({ interaction, client, handler }: SlashCommandProps) {
  const subcommand = interaction.options.getSubcommand();
  const subcommandGroup = interaction.options.getSubcommandGroup();

  if (!subcommandGroup) {
    switch (subcommand) {
      case "submit": await suggestion.submit({ interaction, client, handler }); break;
      case "approve": await suggestion.approve({ interaction, client, handler }); break;
      case "deny": await suggestion.deny({ interaction, client, handler }); break;
      default: break;
    }
  }
}

export const options: CustomCommandOptions = {
  skipCategoryPermsSubcommands: [{ subcommand: "submit" }]
}
