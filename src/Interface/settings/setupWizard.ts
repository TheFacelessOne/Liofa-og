import { 
	ActionRowBuilder, 
	ButtonBuilder, 
	ButtonStyle, 
	EmbedBuilder, 
} from "discord.js";
import { BotInterface, UIManagerApprovedInteraction } from "../manager";

const closeButtonActionRow = new ActionRowBuilder<ButtonBuilder>()
.addComponents(new ButtonBuilder()
	.setCustomId('end')
	.setLabel('Exit')
	.setStyle(ButtonStyle.Danger)
)

export const botInterfaces = (interaction : UIManagerApprovedInteraction) => {
	return {
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
			}
		),


		start : new BotInterface()
			.addEmbed( new EmbedBuilder()
				.setTitle('Welcome to the Setup Wizard!')
				.setDescription('TODO'))
			.addComponents( closeButtonActionRow )
			.addFunction('end', () => {
				return false;
			}
		),
	}
}