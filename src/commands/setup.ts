import type { CommandInteraction, Message, MessageActionRowComponentBuilder } from "discord.js";
import { QuickButton } from "../utils";
import { PermissionFlagsBits, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, parseEmoji } from "discord.js";



module.exports = {
	data : new SlashCommandBuilder()
		.setName("setup")
		.setDescription('Helps you modify settings for liofa')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	ephemeral : true,
	
	async execute(interaction : CommandInteraction) {
		let message = this.start(interaction);
	},
	async start(interaction : CommandInteraction) : Promise<Message<boolean>> {
		const menu = new EmbedBuilder()
			.setTitle('Welcome to the setup wizard!')
			.addFields({ name: 'Are you ready to begin?', value: ' '});

		const button1 = new QuickButton("tick", "green", "confirm");

		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button1)

		const updatedMessage = await interaction.editReply({
			content : " ", 
			embeds : [menu],
			components : [row],
		})
		return updatedMessage;

	}
}
