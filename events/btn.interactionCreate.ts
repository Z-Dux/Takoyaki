import {
  Events,
  Interaction,
  ChatInputCommandInteraction,
  GuildMemberRoleManager,
} from "discord.js";
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
      if (!interaction.inGuild())
        return await interaction.reply({
          content: `This command can only be used in a server!`,
          flags: [`Ephemeral`],
        });
      const roles = interaction.member.roles as GuildMemberRoleManager;
      if (!roles || !interaction.guild) return;
      if (!roles.cache.find((X) => X.id === config.adminRole))
        return await interaction.reply({
          content: `You need <@&${config.adminRole}> role to interact!`,
          flags: [`Ephemeral`],
        });
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
      if (!client.container.page)
        return await interaction.reply({
          content: `No browser instance found!`,
          flags: [`Ephemeral`],
        });

      switch (control) {
        case `play`:
          await interaction.reply({
            content: `Playing **${
              episode.title || `[episode](${episode.url})...`
            }**\n-# From: **${anime.title}**`,
          });
          await client.player.play({
            url: episode.url,
            user: interaction.user.id,
            anime: anime.id as string,
            episode: episode.id,
          });
          await client.container.playEpisode(episode.url);
          break;
        case `add_to_queue`:
          await interaction.reply({
            content: `Added **${
              episode.title || `[episode](${episode.url})...`
            }**\n-# From: **${anime.title}**`,
          });
          await client.player.play({
            url: episode.url,
            user: interaction.user.id,
            anime: anime.id as string,
            episode: episode.id,
          });
          break;
        default:
          break;
      }
    }
  },
};
