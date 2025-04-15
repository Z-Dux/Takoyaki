import config from "../../config";
import {
  CommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Ping off!"),
  async execute(interaction: CommandInteraction) {
    await interaction.deferReply()
    const userId = interaction.user.id;
    await interaction.editReply(`${userId}`)
  },
};
