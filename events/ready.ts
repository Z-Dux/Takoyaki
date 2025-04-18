import { Events } from "discord.js";
import { log } from "../helper/utils";
import { Client } from "../structs/client";

export default {
  name: Events.ClientReady,
  once: true,
  async execute(client: Client) {
    if (!client.user || !client.application) return;
    log(`Logged in as ${client.user.tag} ${client.user.id}`.green);
    client.user.setActivity(`Takoyaki`);
  },
};