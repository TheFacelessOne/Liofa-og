import type { CommandInteraction } from "discord.js";

import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

module.exports = {
	data : new SlashCommandBuilder()
		.setName("setup")
		.setDescription('Helps you modify settings for liofa')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction : CommandInteraction) {
		await interaction.editReply({ content : 'Pong!' });
	}
}