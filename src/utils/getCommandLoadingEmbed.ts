import { EmbedBuilder } from "discord.js";
import config from "../config";

/**
 * 
 * @param message The description (it will be put after the loading emoji)
 * @returns Embed ready to be sent
 */
export default function(message: string): EmbedBuilder {
   return new EmbedBuilder()
      .setDescription(`${config.emoji.loading} ${message}`)
      .setColor("Green")
}
