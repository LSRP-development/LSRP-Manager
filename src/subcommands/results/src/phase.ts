import { SlashCommandProps } from "commandkit";
import getCommandFailedToRunEmbed from "../../../utils/getCommandFailedToRunEmbed";
import { mainConfigManager } from "../../../config";
import { EmbedBuilder, GuildMember, Snowflake } from "discord.js";
import getCommandLoadingEmbed from "../../../utils/getCommandLoadingEmbed";
import getCommandSuccessEmbed from "../../../utils/getCommandSuccessEmbed";

export default async function ({ interaction }: SlashCommandProps) {
  await interaction.deferReply({ flags: "Ephemeral" });
  await interaction.editReply({
    embeds: [getCommandLoadingEmbed("Loading...")],
  });

  const phase = interaction.options.getString("phase", true);
  const member = interaction.options.getMember("member");
  const score = interaction.options.getNumber("score", true);
  const notes = interaction.options.getString("notes", false);

  if (!member || !(member instanceof GuildMember)) {
    await interaction.editReply({
      embeds: [
        getCommandFailedToRunEmbed(
          "This person is not a member of this server!",
        ),
      ],
    });
    return;
  }

  let min, max;
  let rolesToRemove: Snowflake[], rolesToAdd: Snowflake[];

  switch (phase) {
    case "phase_a":
      ({ min, max } = mainConfigManager.config.phases.phaseA);
      rolesToRemove = [mainConfigManager.config.roles.PhaseA];
      rolesToAdd = [mainConfigManager.config.roles.PhaseB];
      break;
    case "phase_b":
      ({ min, max } = mainConfigManager.config.phases.phaseB);
      rolesToRemove = [mainConfigManager.config.roles.PhaseB];
      rolesToAdd = [mainConfigManager.config.roles.PhaseC];
      break;
    case "phase_c":
      ({ min, max } = mainConfigManager.config.phases.phaseC);
      rolesToRemove = [
        mainConfigManager.config.roles.PhaseC,
        mainConfigManager.config.roles.MIT,
      ];
      rolesToAdd = [
        mainConfigManager.config.roles.TM,
        mainConfigManager.config.roles.ModTeam,
      ];
      break;
    default:
      return;
  }

  const passed = score >= min;
  const phaseLetter = phase.split("_").at(-1)?.toUpperCase();
  if (!phaseLetter) return;

  const embed = new EmbedBuilder()
    .setTitle(`Phase ${phaseLetter} results.`)
    .setDescription(
      `**Phase:** ${phaseLetter}\n` +
        `**Trainee:** <@!${member.user.id}>\n` +
        `**Score:** ${score}/${max}\n` +
        `**Notes:** ${notes ?? "N/A"}`,
    )
    .setColor(passed ? "Green" : "Red");

  if (passed) {
    await interaction.editReply({
      embeds: [getCommandLoadingEmbed("Modifying member's roles...")],
    });
    await member.roles.add(rolesToAdd);
    await member.roles.remove(rolesToRemove);
  }

  await interaction.editReply({
    embeds: [getCommandLoadingEmbed("Sending messages...")],
  });

  const channel = await interaction.client.channels.fetch(
    mainConfigManager.config.channels.phaseResults,
  );
  if (!channel?.isSendable()) return;

  await channel.send({
    embeds: [embed],
    content: `Phase ${phaseLetter} - ${score}/${max} points - ${passed ? "Pass" : "Fail"}`,
  });

  await interaction.editReply({ embeds: [getCommandSuccessEmbed()] });
}
