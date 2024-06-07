import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import { BotInterface } from "./manager";
import { addGuildDB } from "../database";



// Select menu for settings pages
const menuSelectActionRow = new ActionRowBuilder<StringSelectMenuBuilder>()
.addComponents(new StringSelectMenuBuilder()
	.setPlaceholder('Choose a setting to edit')
	.setCustomId('?menu selector')
	.addOptions( 
		new StringSelectMenuOptionBuilder()
		.setLabel('Reset')
		.setDescription('Reset settings to default')
		.setValue( 'reset' )
		.setEmoji('⚠️'),
		new StringSelectMenuOptionBuilder()
		.setLabel('Toggle Liofa') // TODO: change label / description / emoji based on liofa's status
		.setDescription('Reset settings to default')
		.setValue( 'toggle' ) // TODO make toggle page
		.setEmoji('⚠️'),
	)
);

const closeButtonActionRow = new ActionRowBuilder<ButtonBuilder>()
.addComponents(new ButtonBuilder()
	.setCustomId('close')
	.setLabel('Exit')
	.setStyle(ButtonStyle.Danger))

export const botInterfaces = {
	close : new BotInterface()
		.addEmbed(new EmbedBuilder()
			.setTitle('Bye 👋')
			.setImage('https://gifdb.com/images/high/bobby-hill-closing-door-slowly-4agdaxkuh78jqjah.gif')
	),
	
	menu : new BotInterface()
		.addComponents( menuSelectActionRow )
		.addComponents( closeButtonActionRow )
		.addEmbed(new EmbedBuilder()
			.setTitle('Welcome to the settings editor')
			.setDescription('First timers: check out the "Setup Wizard" section')
	),
	
	reset : new BotInterface()
		.addContent(' ')
		.addComponents(new ActionRowBuilder<ButtonBuilder>()
			.addComponents(new ButtonBuilder()
				.setStyle(ButtonStyle.Danger)
				.setCustomId("confirmReset")
				.setLabel('Reset Settings'))
			.addComponents(new ButtonBuilder()
				.setStyle(ButtonStyle.Primary)
				.setCustomId("menu")
				.setLabel('Cancel')))
		.addComponents( closeButtonActionRow )
		.addEmbed(new EmbedBuilder()
		.setDescription("This will reset all your settings to the default values\n**Generally not recommended**")
		.setTitle("Reset settings")
	),
	
	confirmReset : new BotInterface()
		.addComponents(new ActionRowBuilder<ButtonBuilder>()
			.addComponents(new ButtonBuilder()
				.setStyle(ButtonStyle.Danger)
				.setCustomId("resetSettings")
				.setLabel('Confirm'))
			.addComponents(new ButtonBuilder()
				.setStyle(ButtonStyle.Primary)
				.setCustomId("menu")
				.setLabel('Cancel')))
		.addComponents( closeButtonActionRow )
		.addEmbed(new EmbedBuilder()
		.setDescription("This will reset all your settings to the default values\n**Generally not recommended**")
			.setTitle("Reset settings")
	),

	resetConfirmed : new BotInterface()
		.addComponents(new ActionRowBuilder<ButtonBuilder>()
			.addComponents(new ButtonBuilder()
				.setStyle(ButtonStyle.Primary)
				.setEmoji('🔙')
				.setCustomId("menu")))
		.addComponents( closeButtonActionRow )
		.addEmbed(new EmbedBuilder()
			.setTitle('Settings have been reset to default')
			.setDescription('Hit the back button to return to the settings menu')
		)

}

// Scripts that return the next screen
export const scripts = {
	'resetSettings' : function (interaction : ButtonInteraction) {
		addGuildDB(interaction.guildId!, true);
		return 'resetConfirmed';
	}
}