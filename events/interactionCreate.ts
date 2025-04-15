import { Events, Interaction, ChatInputCommandInteraction } from "discord.js";
import { Client } from "../structs/client";

export default {
  name: Events.InteractionCreate,
  execute: async (interaction: Interaction, client: Client) => {
    if (interaction.isAutocomplete()) {
      
      const command = client.commands.get(interaction.commandName);
      if (interaction.options.getSubcommand(false)) {
        const subcommandName = interaction.options.getSubcommand();
        //@ts-ignore
        const subcommand = command?.subcommands?.get(subcommandName);
        if(subcommand?.autocomplete) await subcommand.autocomplete(interaction, client)
      } else
        if (command?.autocomplete) {
          await command.autocomplete(interaction, client);
        }
      return;
    }

    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      if (interaction.options.getSubcommand(false)) {
        const subcommandName = interaction.options.getSubcommand();
        //@ts-ignore
        const subcommand = command?.subcommands?.get(subcommandName);

        if (!subcommand) {
          await interaction.reply({
            content: "This subcommand does not exist!",
            flags: [`Ephemeral`]
          });
          return;
        }

        await subcommand.execute(interaction as ChatInputCommandInteraction, client);
      } else {
        await command.execute(interaction as ChatInputCommandInteraction, client);
      }
    } catch (error: any) {
      console.error(error);
      await interaction.reply({
        content: "An error occurred!\n```\n" + error?.message + "\n```",
                    flags: [`Ephemeral`],
      }).catch(console.error);
    }
  },
};
