import { SlashCommandProps } from "commandkit";
import { SlashCommandBuilder } from "discord.js";
import results from "../../subcommands/results";

export const data = new SlashCommandBuilder()
  .setName("results")
  .setDescription("Results system")
  .addSubcommand(s => s
    .setName("phase")
    .setDescription("Send phase results")
    .addStringOption(o => o
      .setName("phase")
      .setDescription("Which phase?")
      .setRequired(true)
      .addChoices([
        { name: "Phase A", value: "phase_a" },
        { name: "Phase B", value: "phase_b" },
        { name: "Phase C", value: "phase_c" },
      ])
    )
    .addUserOption(o => o
      .setName("member")
      .setDescription("Results of this member")
      .setRequired(true)
    )
    .addNumberOption(o => o
      .setName("score")
      .setDescription("The score")
      .setRequired(true)
      .setMinValue(0)
    )
    .addStringOption(o => o
      .setName("notes")
      .setDescription("The notes about the phase")
      .setRequired(false)
    )
  )


export async function run({ interaction, client, handler }: SlashCommandProps) {
  const subcommand = interaction.options.getSubcommand();
  const subcommandGroup = interaction.options.getSubcommandGroup();

  if (!subcommandGroup) {
    switch (subcommand) {
      case "phase": await results.phase({ interaction, client, handler }); break;
      default: break;
    }
  }
}
