import { 
	ActionRowBuilder, 
	ButtonBuilder, 
	ButtonInteraction, 
	ButtonStyle, 
	EmbedBuilder, 
	StringSelectMenuBuilder, 
	StringSelectMenuInteraction, 
	StringSelectMenuOptionBuilder
} from "discord.js";
import { BotInterface, UIManager, UIManagerApprovedInteraction } from "../manager";
import * as setupWiz from "./setupWizard";
import * as reset from "./reset"
import { toggleActivity, getActiveStatus } from "../../database/functions";



// Select menu for settings pages
const menuSelectActionRow = new ActionRowBuilder<StringSelectMenuBuilder>()
.addComponents(new StringSelectMenuBuilder()
	.setPlaceholder('Choose a setting to edit')
	.setCustomId('menu selector')
	.addOptions(
		new StringSelectMenuOptionBuilder()
			.setLabel('Setup Wizard')
			.setDescription('Walks you through setting up Liofa')
			.setValue('setupWizard')
			.setEmoji('🧙‍♂️'),
		new StringSelectMenuOptionBuilder()
			.setLabel('Toggle Liofa') // TODO: change label / description / emoji based on liofa's status
			.setDescription('Turn liofa off or on')
			.setValue( 'toggleMenu' ) // TODO make toggle page
			.setEmoji('⚡'),
		new StringSelectMenuOptionBuilder()
			.setLabel('Reset')
			.setDescription('Reset settings to default')
			.setValue( 'reset' )
			.setEmoji('⚠️'),
	)
);

// Close button for menu
const closeButtonActionRow = new ActionRowBuilder<ButtonBuilder>()
.addComponents(new ButtonBuilder()
	.setCustomId('close')
	.setLabel('Exit')
	.setStyle(ButtonStyle.Danger)
)

const toggleSwitch = async (interaction : ButtonInteraction) => {
	if (interaction.guildId == null) throw('Guild ID not found');
	return await toggleActivity(interaction.guildId) ? 'toggleOff' : 'toggleOn'
}



export const botInterfaces = (interaction : UIManagerApprovedInteraction) => {
	return {
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
				.setDescription('First timers: check out the "Setup Wizard" section'))
			.addFunction( 'toggleMenu', async () => {
				if (interaction.guildId == null) throw('Guild ID not found');
				if (await getActiveStatus(interaction.guildId)) return 'toggleOff';
				return 'toggleOn';
			})
			.addFunction('setupWizard', async () => {
				await UIManager(interaction, setupWiz.botInterfaces, 'setupWizard');
				return 'menu';
			})
			.addFunction( 'reset', async () => {
				await UIManager(interaction, reset.botInterfaces, 'reset')
				return 'menu';
			}
		),

		toggleOff : new BotInterface()
			.addComponents(new ActionRowBuilder<ButtonBuilder>()
				.addComponents( new ButtonBuilder()
					.setStyle(ButtonStyle.Danger)
					.setEmoji('😴')
					.setCustomId('toggleIt'),
				new ButtonBuilder()
					.setStyle(ButtonStyle.Primary)
					.setCustomId("menu")
					.setLabel('Back')
				)
			)
			.addComponents(closeButtonActionRow)
			.addEmbed( new EmbedBuilder()
				.setTitle('Liofa is currently Turned on')
				.setDescription('Hit the 😴 button to turn off liofa'))
			.addFunction('toggleIt', toggleSwitch),

		toggleOn : new BotInterface()
			.addComponents(new ActionRowBuilder<ButtonBuilder>()
				.addComponents( new ButtonBuilder()
					.setStyle(ButtonStyle.Success)
					.setEmoji('🔔')
					.setCustomId('toggleIt'),
				new ButtonBuilder()
					.setStyle(ButtonStyle.Primary)
					.setCustomId("menu")
					.setLabel('Back')
				)
			)
			.addComponents(closeButtonActionRow)
			.addEmbed( new EmbedBuilder()
				.setTitle('Liofa is currently Turned off')
				.setDescription('Hit the 🔔 button to turn on liofa')
			)
			.addFunction('toggleIt', toggleSwitch),
	}
}