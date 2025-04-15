import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  Client,
  AutocompleteInteraction,
  SlashCommandSubcommandBuilder,
} from "discord.js";

export interface Command {
  data: SlashCommandBuilder;
  execute: (
    interaction: ChatInputCommandInteraction,
    client: Client
  ) => Promise<void>;
  autocomplete?: (
    interaction: AutocompleteInteraction,
    client: Client
  ) => Promise<void>;
  subcommands?: Record<
    string,
    {
      data: SlashCommandSubcommandBuilder;
      execute: (
        interaction: ChatInputCommandInteraction,
        client: Client
      ) => Promise<void>;
    }
  >;
}

export type Team = "CSK" | "DC" | "KKR" | "MI" | "PK" | "RCB" | "RR" | "SRH" | "LSG" | "GT";