// Class for user interfaces

import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, CommandInteraction, Message } from "discord.js";
import { ErrorMessage, TimeOutMessage } from "./Messages";

// Designed to be used as interaction replies with ActionRowElements
export class BotInterface {
	
	content : string = ' '; 
	embeds? : EmbedBuilder[];
	components : ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>[] = [];
	functions : Record<string, Function> = {};
	
	// Generates interface to be sent as a message
	render() {
		return {
			content : this.content ? this.content : ' ',
			embeds : this.embeds,
			components : this.components
		}
	}

	addContent(newContent : string) {
		this.content = newContent;
		return this;
	}

	addComponents(row : ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>) {
		this.components.push(row);
		return this;

	}

	addEmbed(embededContent : EmbedBuilder) {
		this.embeds = [embededContent];
		return this;

	}

	// To be used for interface elements that do not require changing screens but do require something to happen
	addFunction(name : string, newFunction : Function) {
		this.functions[name] = newFunction;
		return this;
	}
}

// Once called, it will handle all interactions from that interface
export async function UIManager(
	// Interaction that generated the UI
	interaction : CommandInteraction,

	// All possible screens from this interface
	screens : Record<string, BotInterface>,

	// The first and last screens to show
	startingScreen : keyof typeof screens, 
	endingScreen? : keyof typeof screens
) {	

	let screen : string | undefined;
	let message : Message<boolean>;

	try {
		do {
			// Loads in screen and sends it as a message
			screen = startingScreen;
			let ui = screens[screen].render();
			message = await interaction.editReply(ui);
			if (screen === endingScreen) return;

			// Waits for response from user
			let interactionValue = await message.awaitMessageComponent({ filter : i => i.user.id === interaction.user.id, time : 60_000 });

			// Prevents an interaction failure message sent to user
			interactionValue.deferUpdate();

			if (interactionValue.isStringSelectMenu()) {
				interactionValue.customId = interactionValue.values[0];
			}

			if(interactionValue.customId[0] === '!') {
				// Removes '!' and runs function
				const run = interactionValue.customId.substring(1);
				interactionValue.customId = await screens[screen].functions[run]();
			}

			// Extract next screen from string
			startingScreen = interactionValue.customId

			// Checks next screen is valid
		} while (Object.keys(screens).includes(startingScreen));

		return new ErrorMessage(interaction, 'Attempted to access incompatible screen ' + startingScreen);

	} catch (error) {
		return new TimeOutMessage(interaction);
	}
}