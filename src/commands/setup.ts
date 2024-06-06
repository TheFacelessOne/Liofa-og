import type { CommandInteraction } from "discord.js";
import { BotInterface, UIManager } from "../utils";
import { PermissionFlagsBits, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder } from "discord.js";



module.exports = {
	data : new SlashCommandBuilder()
		.setName("setup")
		.setDescription('Modify settings for liofa')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	ephemeral : true,
	
	async execute(interaction : CommandInteraction) {

		// Select menu for settings to edit
		const menuSelect = new StringSelectMenuBuilder()
			.setPlaceholder('Choose an option to edit')
			.setCustomId('menu selector')
			.addOptions( 
				new StringSelectMenuOptionBuilder()
				.setLabel('Reset')
				.setDescription('Reset settings to default')
				.setValue('>reset') // moves to "reset" screen
				.setEmoji('⚠️')
			)
		
		// Possible user interfaces generated from this command
		const screens = {
			close : 
				new BotInterface()
				.addEmbed(new EmbedBuilder()
					.setTitle('Bye 👋')
					.setImage('https://gifdb.com/images/high/bobby-hill-closing-door-slowly-4agdaxkuh78jqjah.gif')
				),

			menu : 
				new BotInterface()
				.addContent(' ')
				.addComponents( new ActionRowBuilder<StringSelectMenuBuilder>()
					.addComponents(menuSelect))
				.addComponents( new ActionRowBuilder<ButtonBuilder>()
					.addComponents(new ButtonBuilder()
						.setCustomId('>close') // Moves to "close" screen
						.setLabel('❌Close Menu❌')
						.setStyle(2)))
				.addEmbed(new EmbedBuilder()
					.setTitle('Welcome to the settings editor')
					.setDescription('First timers: check out the "Setup Wizard" section')
				),
		}

		// Starts the UI manager
		UIManager(interaction, screens, 'menu', 'close')

	},
}
