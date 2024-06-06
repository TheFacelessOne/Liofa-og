import { Events } from 'discord.js';
import { Interaction } from 'discord.js';
import { ErrorMessage } from '../Interface/Messages';

module.exports = {
	// Event name used for tracking which event this is for
	reactsTo: Events.InteractionCreate,

	async execute(interaction : Interaction) {
		// All slash commands use this if statement
		if (interaction.isChatInputCommand()){

	
			const command = interaction.client.commands.get(interaction.commandName)
	
			if (interaction.guild === null) {
				console.error(`An chat input was generated from a server that doesn't exist\nCommand: \t${interaction.commandName}\nUser: \t${interaction.user.id} \t${interaction.user.username}`);
				return;
			}
	
			if (typeof command === 'undefined') {
				console.error(`A command was run that doesn't exist\nCommand: \t${interaction.commandName}\nServer ID:${interaction.guild.id}\nUser: \t${interaction.user.id} \t${interaction.user.username}`);
				return;
			}
	
			try {
				await interaction.reply({
					// loading animation
					content : "<a:8622loading:1247726650737557504>",

					// sets ephemeral status at beginning since it can't be changed later anyway
					ephemeral : command.ephemeral ? true : false
				});
				command.execute(interaction);
			} catch (error) {
				console.error(error);
				new ErrorMessage(interaction, 'Failed to execute command');
			}

		}
	},
};