import { Events, Interaction, ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { Client } from "../structs/client";
import { ANIME, StreamingServers } from "@consumet/extensions";
import { chunkize } from "../helper/utils";

export default {
    name: Events.InteractionCreate,
    execute: async (interaction: Interaction, client: Client) => {
        if (interaction.isAnySelectMenu()) {
            const animeId = interaction.customId
            const epId = interaction.values[0];
            const zoro = new ANIME.Zoro();
            await interaction.deferReply();
            const anime = await zoro.fetchAnimeInfo(animeId);
            if (!anime.episodes || anime.episodes.length === 0 || !epId) return await interaction.editReply({
                content: `No episodes found!`,
            })
            const episode = anime.episodes.find((e) => e.id === epId);
            if (!episode) return await interaction.editReply({
                content: `No episode found?`,
            })
            const embed = new EmbedBuilder()
                .setTitle(`${anime.title} - Episode ${episode.number}`)
                .setDescription(`-# *Title:* \n### **${episode.title}**`)
                .setFooter({ text: `Filler Episode: ${episode.isFiller ? `Yes` : `No`}` })
                .setColor(0x0099ff)
            if (episode.url) embed.setURL(episode.url)
            if (anime.image) embed.setThumbnail(anime.image);
            const components = controlBtns([`play`, `add-to-queue`], episode.id, episode.url) as any
            await interaction.editReply({
                embeds: [embed],
                components
            })
        }
    },
};

type ControlBtns = "play" | "pause" | "stop" | "add-to-queue" | "remove-from-queue" | "previous" | "next";

const Buttons: { id: ControlBtns, button: ButtonBuilder }[] = [
    {
        id: "play",
        button: new ButtonBuilder()
            .setCustomId("play")
            .setStyle(ButtonStyle.Success)
            .setEmoji("▶️")
    },
    {
        id: "pause",
        button: new ButtonBuilder()
            .setCustomId("pause")
            .setStyle(ButtonStyle.Secondary)
            .setEmoji("⏸️")
    },
    {
        id: "stop",
        button: new ButtonBuilder()
            .setCustomId("stop")
            .setStyle(ButtonStyle.Danger)
            .setEmoji("⏹️")
    },
    {
        id: "add-to-queue",
        button: new ButtonBuilder()
            .setCustomId("add-to-queue")
            .setStyle(ButtonStyle.Secondary)
            .setEmoji("➕")
    },
    {
        id: "remove-from-queue",
        button: new ButtonBuilder()
            .setCustomId("remove-from-queue")
            .setStyle(ButtonStyle.Secondary)
            .setEmoji("➖")
    },
    {
        id: "previous",
        button: new ButtonBuilder()
            .setCustomId("previous")
            .setStyle(ButtonStyle.Secondary)
            .setEmoji("⏮️")
    },
    {
        id: "next",
        button: new ButtonBuilder()
            .setCustomId("next")
            .setStyle(ButtonStyle.Secondary)
            .setEmoji("⏭️")
    }
];
const urlBtn = (url: string) => new ButtonBuilder().setEmoji("🔗").setURL(url).setStyle(ButtonStyle.Link);

function controlBtns(btns: ControlBtns[], id: string, url?: string) { // Play, Add to Queue
    const buttons = btns.map((btn) => {
        const button = Buttons.find((b) => b.id === btn);
        if (!button) return;
        button.button.setCustomId(`${btn}-${id}`);
        return button.button;
    }).filter((b) => b !== undefined);

    if (url) {
        buttons.splice(4, 0, urlBtn(url)); // Add the URL button to the 5th position
    }

    const chunks = chunkize(buttons, { size: 5 });
    return chunks.map(x => new ActionRowBuilder().setComponents(x));
}
