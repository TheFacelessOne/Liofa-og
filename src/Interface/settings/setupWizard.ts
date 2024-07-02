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
import { BotInterface } from "../manager";
import { addGuildDB, getActiveStatus, toggleActivity } from "../../database";

const closeButtonActionRow = new ActionRowBuilder<ButtonBuilder>()
.addComponents(new ButtonBuilder()
	.setCustomId('end')
	.setLabel('Exit')
	.setStyle(ButtonStyle.Danger)
)

export const botInterfaces = {
	setupWizard : new BotInterface()
		.addEmbed( new EmbedBuilder()
			.setTitle('Let\'s get started!')
			.setDescription('This will walk you through all the basic settings in Liofa for you to get the bot up and running.\n\nClick the start button to get started.'))
		.addComponents(new ActionRowBuilder<ButtonBuilder>()
			.addComponents( 
				new ButtonBuilder()
					.setStyle(ButtonStyle.Success)
					.setCustomId('start')
					.setLabel('Start'),
				))
		.addComponents(closeButtonActionRow)
		.addFunction('end', () => {
			return false;
		}),


	start : new BotInterface()
		.addEmbed( new EmbedBuilder()
			.setTitle('Welcome to the Setup Wizard!')
			.setDescription('TODO'))
		.addComponents( closeButtonActionRow )
		.addFunction('end', () => {
			return false;
		}),
}