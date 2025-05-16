import { SlashCommandProps } from "commandkit";
import { SlashCommandBuilder } from "discord.js";
import log from "../../subcommands/log";

export const data = new SlashCommandBuilder()
  .setName("log")
  .setDescription("Log stuff")
  .addSubcommand(s => s
    .setName("rp-perms")
    .setDescription("Logs roleplay permissions for a Roblox player")
    .addStringOption(o => o
      .setName("players")
      .setDescription("The player/players to grant the perms (separate with spaces if multiple)")
      .setRequired(true)
    )
    .addStringOption(o => o
      .setName("roleplay")
      .setDescription("The Roleplay type")
      .setRequired(true)
    )
  )


export async function run({ interaction, client, handler }: SlashCommandProps) {
  const subcommandGroup = interaction.options.getSubcommandGroup();
  const subcommand = interaction.options.getSubcommand();

  if (!subcommandGroup) {
    switch (subcommand) {
      case "rp-perms":
        await log.rpPerms({ interaction, handler, client });
        break;
    }
  }
}
