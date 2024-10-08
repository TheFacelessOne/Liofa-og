import { CommandInteraction } from "discord.js";
import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { UIManager } from "../interfaces/manager";
import * as ui from "../interfaces/settings/setup";


export default {
	data: new SlashCommandBuilder()
		.setName("setup")
		.setDescription('Modify settings for liofa')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	ephemeral: true,

	execute(interaction: CommandInteraction) {
		// Starts the UI manager
		UIManager(interaction, ui.botInterfaces, 'menu');

	},
}
