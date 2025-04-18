import { Events, Interaction, ChatInputCommandInteraction } from "discord.js";
import { Client } from "../structs/client";
import { ANIME } from "@consumet/extensions";
import config from "../config";
type ControlBtns =
  | "play"
  | "pause"
  | "stop"
  | "add_to_queue"
  | "remove_from_queue"
  | "previous"
  | "next";

export default {
  name: Events.InteractionCreate,
  execute: async (interaction: Interaction, client: Client) => {
    if (!interaction.isButton()) return;
    const { customId } = interaction;
    const ops = customId.split("-");
    if (ops[0] == `ct`) {
      const control = ops[1] as ControlBtns;
      switch (control) {
        case `play`:
          const zoro = new ANIME.Zoro(config.animeApi);
          const epId = ops.slice(2).join("-");
          const animeId = epId.substring(0, epId.indexOf("$"));
          const anime = await zoro.fetchAnimeInfo(animeId).catch((err) => null);
          if (!anime)
            return await interaction.reply({
              content: `No anime found!`,
              flags: [`Ephemeral`],
            });
          if (!anime.episodes || anime.episodes.length === 0 || !epId)
            return await interaction.reply({
              content: `No episodes found!`,
            });
          const episode = anime.episodes.find((e) => e.id === epId);
          if (!episode || !episode.url)
            return await interaction.reply({
              content: `No episode found?`,
            });
            await interaction.reply({
                content: `Playing **${episode.title || `[episode](${episode.url})...`}**\n-# From: **${anime.title}**`,
            })
          await client.container.playEpisode(episode.url);

          break;

        default:
          break;
      }
    }
  },
};
