import { log } from "../helper/utils";
import { Container, DiscordManager } from "./browser";
import { Client } from "./client";

interface Episode {
    url: string;
    user: string;
    anime: string;
    episode: string;
}


export class PlayerManager {
    queue: Episode[] = [];
    nowPlaying: Episode | null = null;
    client: Client;
    constructor(client: Client) {
        this.client = client;
        this.queue = [];
        this.nowPlaying = null;
    }
    addToQueue(episode: Episode) {
        this.queue.push(episode);
        if(this.nowPlaying === null) {
            this.play(episode);
        }
    }
    removeFromQueue(episode: Episode) {
        this.queue = this.queue.filter((e) => e.url !== episode.url);
    }
    async play(episode: Episode) {
        this.nowPlaying = episode;
        await this.client.container.playEpisode(episode.url);
    }
    skip() {
        if(this.queue.length === 0) return;
        this.nowPlaying = this.queue.shift() || null;
        if(this.nowPlaying) {
            this.client.container.playEpisode(this.nowPlaying.url);
        }
    }
    async start() {
        this.client.container = new Container();
        this.client.container.launch().then(async () => {
          //return;
          const extTab = await this.client.container.loadExtension();
          await this.client.container.getPage();
          await extTab?.close();
          await this.client.container.playEpisode(
            `https://hianime.to/watch/jujutsu-kaisen-2nd-season-18413?ep=103634`
          );
          const discorder = new DiscordManager(this.client.container);
          await discorder.login();
          await discorder.joinVoice();
          await discorder.startScreenShare();
          log(`Finished!`.green);
        });
    }
    async terminate() {
        await this.client.container.page.close()
        await this.client.container.browser.close();
        this.nowPlaying = null;
        this.queue = [];
    }
}