import type { CommandInteraction, Message } from "discord.js";
import { ErrorMessage, QuickButton, TimeOutMessage } from "../utils";
import { PermissionFlagsBits, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder } from "discord.js";



module.exports = {
	data : new SlashCommandBuilder()
		.setName("setup")
		.setDescription('Helps you modify settings for liofa')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	ephemeral : true,
	
	async execute(interaction : CommandInteraction) {
		
		async function start(interaction : CommandInteraction) : Promise<Message<boolean>> {
			const menu = new EmbedBuilder()
				.setTitle('Welcome to the setup wizard!')
				.addFields({ name: 'Are you ready to begin?', value: ' '});

			const confirm = new QuickButton('tick', 'green', 'confirm');
			const decline = new QuickButton('stop', 'red', 'decline');

			const row = new ActionRowBuilder<ButtonBuilder>()
				.addComponents(confirm)
				.addComponents(decline);

			const updatedMessage = await interaction.editReply({
				content : " ", 
				embeds : [menu],
				components : [row],
			});
			return updatedMessage;

		}

		let message = await start(interaction);
		let confirmation;

		try {
			confirmation = await message.awaitMessageComponent({ filter: i => i.user.id === interaction.user.id, time: 60_000 });
		} catch {
			return new TimeOutMessage(interaction);
		}

		if (!confirmation.isButton()) { new ErrorMessage(interaction, 'A different interaction was expected')}


	}
}
