import { Client } from "./structs/client";
import { log } from "./helper/utils";
import config from "./config";
import { readdirSync, statSync } from "fs";
import { join } from "path";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { Command } from "./structs/interface";
import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from "discord.js";

log("Starting Bot".yellow);
const client = new Client();

const commandFolders = readdirSync("./commands");
const commands = [];

for (const category of commandFolders) {
  const categoryPath = join(__dirname, "commands", category);
  const items = readdirSync(categoryPath);

  for (const item of items) {
    const itemPath = join(categoryPath, item);

    if (statSync(itemPath).isDirectory()) {
      const mainCommandFile = join(itemPath, `${item}.ts`);
      try {
        const mainCommand = require(mainCommandFile).default as Command;
        if (!mainCommand.data) continue;

        const subCommandFiles = readdirSync(itemPath)
          .filter((file) => file.endsWith(".ts") && file !== `${item}.ts`);
        const subCommandMap = new Map<any, any>()
        for (const subFile of subCommandFiles) {
          const subCommand = require(join(itemPath, subFile)).default;
          if (!subCommand.data) continue;
          if (!(subCommand.data instanceof SlashCommandSubcommandBuilder)) {
            log(`Invalid subcommand format in ${subFile}`.red);
            continue;
          }
          subCommandMap.set(subCommand.data.name as any, subCommand);
          (mainCommand.data as SlashCommandBuilder).addSubcommand(subCommand.data);
        }
        
        if(subCommandMap.size > 0) mainCommand.subcommands = subCommandMap as any
        client.commands.set(mainCommand.data.name, mainCommand);
        commands.push(mainCommand.data.toJSON());
      } catch (err) {
        console.error(`Failed to load subcommand: ${item}`, err);
      }
    } else if (item.endsWith(".ts")) {
      const command = require(itemPath).default as Command;
      if (!command.data) continue;

      client.commands.set(command.data.name, command);
      commands.push(command.data.toJSON());
    }
  }
}

const rest = new REST({ version: "9" }).setToken(config.token);

(async () => {
  try {
    log("Started refreshing application (/) commands.".yellow);

    await rest.put(Routes.applicationCommands(config.clientId), {
      body: commands,
    });

    log(
      `Successfully reloaded application (/) commands ( ${commands.length} ).`
        .black.bgGreen
    );
  } catch (error) {
    console.error(error);
  }
})();

const eventsPath = join(__dirname, "events");
const eventFiles = readdirSync(eventsPath).filter((file: string) =>
  file.endsWith(".ts")
);

for (const file of eventFiles) {
  const filePath = join(eventsPath, file);
  const event = require(filePath).default;

  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

client.login(config.token).catch((err: any) => {
  if (err) console.log("Invalid token!");
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
});