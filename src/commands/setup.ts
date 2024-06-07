import type { CommandInteraction } from "discord.js";
import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { UIManager } from "../interface/manager";
import * as ui from "../interface/setup";



export default {
	data : new SlashCommandBuilder()
		.setName("setup")
		.setDescription('Modify settings for liofa')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	ephemeral : true,
	
	execute(interaction : CommandInteraction) {

		
		// Possible user interfaces generated from this command
		const screens = ui.botInterfaces;
		// Starts the UI manager
		UIManager(interaction, screens, ui.scripts, 'menu', 'close');

	},
}
