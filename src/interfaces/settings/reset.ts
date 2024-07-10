import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ButtonInteraction } from "discord.js";
import { addGuildDB } from "../../database/functions";
import { BotInterface, UIManagerApprovedInteraction } from "../manager";


// Close button for menu
const closeButtonActionRow = new ActionRowBuilder<ButtonBuilder>()
	.addComponents(new ButtonBuilder()
		.setCustomId('end')
		.setLabel('Exit')
		.setStyle(ButtonStyle.Danger)
	)

export const botInterfaces = (interaction: UIManagerApprovedInteraction) => {
	return {
		reset: new BotInterface()
			.addContent(' ')
			.addFunction('end', () => {
				return 'close';
			})
			.addComponents(new ActionRowBuilder<ButtonBuilder>()
				.addComponents(new ButtonBuilder()
					.setStyle(ButtonStyle.Danger)
					.setCustomId("confirmReset")
					.setLabel('Reset Settings')))
			.addComponents(closeButtonActionRow)
			.addEmbed(new EmbedBuilder()
				.setDescription("This will reset all your settings to the default values\n**Generally not recommended**")
				.setTitle("Reset settings")
			),

		confirmReset: new BotInterface()
			.addFunction('end', () => {
				return false;
			})
			.addComponents(new ActionRowBuilder<ButtonBuilder>()
				.addComponents(new ButtonBuilder()
					.setStyle(ButtonStyle.Danger)
					.setCustomId("resetSettings")
					.setLabel('Confirm')))
			.addComponents(closeButtonActionRow)
			.addEmbed(new EmbedBuilder()
				.setDescription("This will reset all your settings to the default values\n⚠️**Generally not recommended**⚠️")
				.setTitle("Reset settings"))
			.addFunction('resetSettings', (interaction: ButtonInteraction) => {
				addGuildDB(interaction.guildId!, true);
				return 'resetConfirmed';
			}
			),

		resetConfirmed: new BotInterface()
			.addComponents(new ActionRowBuilder<ButtonBuilder>()
				.addComponents(new ButtonBuilder()
					.setStyle(ButtonStyle.Primary)
					.setEmoji('🔙')
					.setCustomId("menu")))
			.addComponents(closeButtonActionRow)
			.addEmbed(new EmbedBuilder()
				.setTitle('Settings have been reset to default')
				.setDescription('Hit the back button to return to the settings menu')
			),
	}
}