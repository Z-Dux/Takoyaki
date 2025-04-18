import { Client as DiscordClient, Collection, GatewayIntentBits, ClientUser } from "discord.js";
import { Command } from "./interface";
import { Container, DiscordManager } from "./browser";
import { log } from "../helper/utils";


const container = new Container();
container.launch().then(async () => {
  //return;
  const extTab = await container.loadExtension();
  await container.getPage();
  await extTab?.close();
  await container.playEpisode(
    `https://hianime.to/watch/jujutsu-kaisen-2nd-season-18413?ep=103634`
  );
  const discorder = new DiscordManager(container);
  //await discorder.prepare();
  await discorder.login();
  await discorder.joinVoice();
  await discorder.startScreenShare();
  log(`Finished!`.green);
});

DiscordManager
export class Client extends DiscordClient {
  public commands: Collection<string, Command>;
  public container: Container = container;
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
