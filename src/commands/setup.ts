import type { CommandInteraction } from "discord.js";
import { QuickButton } from "../utils";
import { PermissionFlagsBits, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, parseEmoji } from "discord.js";



module.exports = {
	data : new SlashCommandBuilder()
		.setName("setup")
		.setDescription('Helps you modify settings for liofa')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction : CommandInteraction) {

		let menu = new EmbedBuilder()
			.setTitle('Welcome to the setup wizard!')
			.addFields({ name: 'Are you ready to begin?', value: ' '});

		const button1 = new QuickButton("tick", "green", "check");

		const row : any = new ActionRowBuilder().addComponents(button1.component)
		if (typeof row.data.type === 'undefined') throw ("Action row type undefined");

		interaction.editReply({
			content : " ", 
			embeds : [menu],
			components : [row],
		})
	}
}