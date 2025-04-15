import { ANIME, IAnimeEpisode } from "@consumet/extensions"
import config from "../../config";
import {
    ActionRowBuilder,
    CommandInteraction,
    EmbedBuilder,
    Interaction,
    SlashCommandBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
} from "discord.js";
import { chunkize } from "../../helper/utils";

export default {
    data: new SlashCommandBuilder()
        .setName("search")
        .setDescription("Search for an anime!")
        .addStringOption((option) =>
            option
                .setName("query")
                .setDescription("Enter the name of the anime")
                .setRequired(true)
                .setAutocomplete(true)
        ),
    async execute(interaction: CommandInteraction) {
        if (!interaction.isChatInputCommand()) return;
        await interaction.deferReply();
        const userId = interaction.user.id;
        const query = interaction.options.getString("query");
        if (!query) return await interaction.editReply("No query provided");

        const zoro = new ANIME.Zoro();//(`https://consumet-rose-one.vercel.app/anime/zoro`);
        const search = await zoro.search(query);
        const result = search.results.find(x => x.id.startsWith(query)) || search.results[0];
        if (!result) return await interaction.editReply("No results found!");
        const anime = await zoro.fetchAnimeInfo(result.id);
        anime.relatedAnime = [];
        anime.recommendations = [];

        const { title, id, image, description } = anime;
        const embed = new EmbedBuilder()
            .setColor(config.embedColor)
            .setTitle(title.toString())
            //.setDescription(description)
            .setFooter({ text: `ID: ${id}` })


        if (image) embed.setThumbnail(image);
        if (anime.url) embed.setURL(anime.url);
        const str: string[] = [];
        if (anime.episodes) str.push(`Episodes: ${anime.episodes.length}`);
        if (anime.genres) str.push(`Genres: ${anime.genres.map((g) => g).join(", ")}`);
        if (anime.status) str.push(`Status: ${anime.status}`);
        if (anime.releaseDate) str.push(`Release Date: ${anime.releaseDate}`);
        if (anime.score) str.push(`Score: ${anime.score}`);
        if (anime.japaneseTitle.length > 0) embed.data.title += ` (${anime.japaneseTitle})`
        if (anime.type) str.push(`Type: ${anime.type}`);
        if (anime.duration) str.push(`Duration: ${anime.duration}`);
        if (anime.hasDub) str.push(`Dub: ${anime.hasDub ? `Available` : `None`}`);
        if (anime.hasSub) str.push(`Sub: ${anime.hasSub ? `Available` : `None`}`);
        if (anime.source) str.push(`Source: ${anime.source}`);
        if (anime.studios) str.push(`Studios: ${anime.studios.map((s) => s).join(", ")}`);
        if (description) embed.setDescription(description.toString().substring(0, 250) + `...`);

        embed.addFields([{ name: `Details`, value: str.map(x => `- **${x.substring(0, x.indexOf(`:`) + 1)}**${x.substring(x.indexOf(`:`) + 1)}`).join("\n") }]);
        let components:any[] = [];
        if (anime.episodes?.length || 0 > 0) {
            const actionRows = await formRow(anime.episodes || [], id);
            components = (actionRows)

        }
        await interaction.editReply({
            embeds: [embed],
            components
        });
    },
    async autocomplete(interaction: Interaction) {

        if (!interaction.isAutocomplete()) return;

        const zoro = new ANIME.Zoro();//(`http://consumet-rose-one.vercel.app/`)

        const query = interaction.options.getString("query");
        if (!query) return;
        const search = await zoro.search(query);
        const results = search.results
        const choices = results.map((result) => ({
            name: typeof result.title === "string" ? result.title : result.title.english,
            value: result.id,
        }));
        const res = choices.map((choice) => ({
            name: (choice.name) || choice.value,//.substring(0, 25),
            value: (choice.value).substring(0, 100)//.substring(Math.max(choice.value.length-25, 0), choice.value.length),
        })).slice(0, 25);

        await interaction.respond(
            res
        );
    }
};


async function formRow(episodes: IAnimeEpisode[], id: string) {
    const chunked = chunkize(episodes, { size: 25 });
    const rows: ActionRowBuilder[] = [];
    let pg = 0;
    for (const chunk of chunked) {
        const row = new ActionRowBuilder();
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(`watch-${id}`)
            .setPlaceholder(`Anime Episodes (${25 * pg + chunk.length}/${episodes.length})`)
            .addOptions(chunk.map((x, i) => new StringSelectMenuOptionBuilder().setLabel(`${x.number}. ${x.isFiller?`⭐ `:``}${x.title}`).setValue(x.id)));
        row.addComponents(selectMenu);
        pg++;
        rows.push(row);
    }
    return rows;
}