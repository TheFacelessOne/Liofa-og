import { Client, Collection, SlashCommandBuilder, CommandInteraction } from "discord.js"

declare module "discord.js" {
	interface Client {
		commands : Collection<String, { data : SlashCommandBuilder, async execute(CommandInteraction) : Promise<void>}>
	}
}