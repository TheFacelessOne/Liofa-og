import {
	Collection,
	CommandInteraction,
	SlashCommandBuilder,
} from "discord.js"

declare module "discord.js" {
	export interface Client {
		commands : Collection<String, {
			data : SlashCommandBuilder
			execute( interaction: CommandInteraction) : Promise<void>
			ephemeral? : boolean
		}>;
	}
}

