import { ApplicationCommandOptionType, Client, CommandInteractionOptionResolver, EmbedBuilder, Interaction, Snowflake } from "discord.js";
import config from "../../config";

export default async function (interaction: Interaction, client: Client<true>) {
  const logChannel = await client.channels.fetch(config.channels.globalCommandLogs);
  if (!logChannel?.isSendable()) return;
  if (!interaction.inCachedGuild()) return;
  if (!interaction.isChatInputCommand()) return;
  const channelID = interaction.channel ? interaction.channel.id : "UNKNOWN";

  let subcommand: null | string = null;
  try {
    subcommand = interaction.options.getSubcommand();
  } catch (e) { };
  const subcommandGroup = interaction.options?.getSubcommandGroup();

  const commandName = `${interaction.commandName}${subcommandGroup ? " " + subcommandGroup : ""}${subcommand ? " " + subcommand : ""}`;

  const time = Math.floor(Date.now() / 1000);

  const logEmbed = new EmbedBuilder()
    .setTitle("Command ran")
    .setDescription(
      `**Name:** ${commandName}\n` +
      `**Ran by:** ${interaction.user.username} (${interaction.user.id}\n` +
      `**Timestamp:** <t:${time}:R> <t:${time}:T>\n` +
      `**Channel:** <#${channelID}> (${channelID})\n` +
      `**Guild:** ${interaction.guild.name} (${interaction.guild.id})\n` +
      `**Options:**\n`
    )
    .addFields(
      interaction.options.data.map(c => {
        return { name: c.name || "", value: `\`${c.value?.toString() || ""}\``, inline: true }
      })
    )


  if (subcommand) {
    logEmbed.addFields(interaction.options.data.find(v => v.options)?.options?.map(c => { return { name: c.name || "", value: `\`${c.value?.toString() || ""}\``, inline: true } }) || []);
  }

  logChannel.send({ embeds: [logEmbed] });
}
