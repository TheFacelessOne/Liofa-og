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
import { BotInterface } from "./manager";
import { addGuildDB, getActiveStatus, toggleActivity } from "../database";

const closeButtonActionRow = new ActionRowBuilder<ButtonBuilder>()
.addComponents(new ButtonBuilder()
	.setCustomId('end')
	.setLabel('Exit')
	.setStyle(ButtonStyle.Danger)
)

export const botInterfaces = {
	start : new BotInterface()
		.addEmbed( new EmbedBuilder()
			.setTitle('Welcome to the Setup Wizard!')
			.setDescription('TODO'))
		.addComponents( closeButtonActionRow )
		.addFunction('end', () => {
			return false;
		}),
}