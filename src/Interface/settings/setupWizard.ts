import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
} from "discord.js";
import { BotInterface, UIManager, UIManagerApprovedInteraction } from "../manager";
import * as approvedLanguages from "./approvedLanguages";

const closeButtonActionRow = new ActionRowBuilder<ButtonBuilder>()
	.addComponents(new ButtonBuilder()
		.setCustomId('end')
		.setLabel('Exit')
		.setStyle(ButtonStyle.Danger)
	)

export const botInterfaces = (interaction: UIManagerApprovedInteraction) => {
	return {
		setupWizard: new BotInterface()
			.addEmbed(new EmbedBuilder()
				.setTitle('Let\'s get started!')
				.setDescription('This will walk you through all the basic settings in Liofa for you to get the bot up and running.\n\nClick the start button to get started.'))
			.addComponents(new ActionRowBuilder<ButtonBuilder>()
				.addComponents(
					new ButtonBuilder()
						.setStyle(ButtonStyle.Success)
						.setCustomId('approvedLanguages')
						.setLabel('Start'),
				))
			.addComponents(closeButtonActionRow)
			.addFunction('end', () => {
				return 'close';
			})
			.addFunction('approvedLanguages', async () => {
				if (await UIManager(interaction, approvedLanguages.botInterfaces, '0') === false) return false;
				return 'setupWizard' // replace with next screen
			}),
	}
}