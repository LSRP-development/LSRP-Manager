import { SlashCommandProps } from "commandkit";
import { SlashCommandBuilder } from "discord.js";
import suggestion from "../../subcommands/suggestion";

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
  );

export async function run({ interaction, client, handler }: SlashCommandProps) {
  const subcommand = interaction.options.getSubcommand();
  const subcommandGroup = interaction.options.getSubcommandGroup();

  if (!subcommandGroup) {
    switch (subcommand) {
      case "submit": await suggestion.submit({ interaction, client, handler }); break;
      default: break;
    }
  }
}
