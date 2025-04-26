import 'dotenv/config';

import { Client, IntentsBitField } from 'discord.js';
import { CommandKit } from 'commandkit';

import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import config from './config';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

new CommandKit({
  client,
  eventsPath: join(__dirname, 'events'),
  commandsPath: join(__dirname, 'commands'),
  validationsPath: join(__dirname, "validations"),
  devUserIds: config.devUserIDs,
  devGuildIds: [config.devGuildID],
  bulkRegister: true,
});

(async () => {
  try {
    if (await mongoose.connect(process.env.DB_URL as string)) {
      console.log("✅ Connected to DB");
    } else {
      console.log("❌ Couldn't connect to DB");
      process.exit();
    }

    await client.login(process.env.TOKEN);
  } catch (e) {
    console.log("❌ There was an error while connecting to the database and/or logging in.");
    console.log(e);
    process.exit();
  }
})();

