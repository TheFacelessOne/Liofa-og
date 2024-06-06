import type { CommandInteraction } from "discord.js";
import { PermissionFlagsBits, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { BotInterface, UIManager } from "../interface/manager";



export default {
	data : new SlashCommandBuilder()
		.setName("setup")
		.setDescription('Modify settings for liofa')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	ephemeral : true,
	
	execute(interaction : CommandInteraction) {

		// Select menu for settings to edit
		const menuSelectActionRow = new ActionRowBuilder<StringSelectMenuBuilder>()
		.addComponents(new StringSelectMenuBuilder()
			.setPlaceholder('Choose an option to edit')
			.setCustomId('?menu selector')
			.addOptions( 
				new StringSelectMenuOptionBuilder()
				.setLabel('Reset')
				.setDescription('Reset settings to default')
				.setValue('reset') // moves to "reset" screen
				.setEmoji('⚠️')
			))
		
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
				.addComponents( menuSelectActionRow )
				.addComponents( new ActionRowBuilder<ButtonBuilder>()
					.addComponents(new ButtonBuilder()
						.setCustomId('close') // Moves to "close" screen
						.setLabel('❌Close Menu❌')
						.setStyle(2)))
				.addEmbed(new EmbedBuilder()
					.setTitle('Welcome to the settings editor')
					.setDescription('First timers: check out the "Setup Wizard" section')
				),
			reset :
				new BotInterface()
				.addContent(' ')
				.addComponents( menuSelectActionRow )
				.addComponents(new ActionRowBuilder<ButtonBuilder>()
					.addComponents(new ButtonBuilder()
						.setStyle(ButtonStyle.Primary)
						.setCustomId("confirmReset")
						.setLabel('Reset Settings')))
				.addEmbed(new EmbedBuilder()
				.setDescription("This will reset all your settings to the default values\n**Generally not recommended**")
				.setTitle("Reset settings")),

			confirmReset :
				new BotInterface()
				.addComponents( menuSelectActionRow )
				.addComponents(new ActionRowBuilder<ButtonBuilder>()
					.addComponents(new ButtonBuilder()
						.setStyle(ButtonStyle.Primary)
						.setCustomId("!resetSettings")
						.setLabel('Confirm')))
				.addEmbed(new EmbedBuilder()
				.setDescription("This will reset all your settings to the default values\n**Generally not recommended**")
					.setTitle("Reset settings"))
				.addFunction('resetSettings', () => {return 'menu'})
		}
		// Starts the UI manager
		UIManager(interaction, screens, 'menu', 'close');

	},
}
