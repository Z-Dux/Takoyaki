import { Client as DiscordClient, Collection, GatewayIntentBits, ClientUser } from "discord.js";
import { Command } from "./interface";

export class Client extends DiscordClient {
  public commands: Collection<string, Command>;

  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages,
      ],
    });

    this.commands = new Collection<string, Command>();
    
  }
}
