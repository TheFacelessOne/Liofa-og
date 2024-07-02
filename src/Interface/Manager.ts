// Class for user interfaces
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, CommandInteraction, Message } from "discord.js";
import { ErrorMessage, TimeOutMessage } from "./messages";

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
		if (this.embeds) {
			this.embeds.push(embededContent)
			return this;
		}
		this.embeds = [embededContent];
		return this;

	}

	addFunction(name : string, arrowFunction : Function) {
		this.functions[name] = arrowFunction;
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
			let interactionResponse = await message.awaitMessageComponent({ filter : i => i.user.id === interaction.user.id, time : 90_000 });

			// Prevents an interaction failure message sent to user
			interactionResponse.deferUpdate();

			// Correctly assigns input value from selectMenus and buttons
			let interactionScriptRef : string;
			if (interactionResponse.isStringSelectMenu()) {
				interactionScriptRef = interactionResponse.values[0]
			}
			else {
				interactionScriptRef = interactionResponse.customId
			}

			// If there's a script by the given name associated with the current screen
			if (typeof screens[screen].functions[interactionScriptRef] != 'undefined') {
				
				// runs the script
				startingScreen = screens[screen].functions[interactionScriptRef](interaction);
				continue;
			}
				
			startingScreen = interactionScriptRef;

			// Checks next screen is valid
		} while (Object.keys(screens).includes(startingScreen));

		return new ErrorMessage(interaction, 'Attempted to access incompatible screen ' + startingScreen);

	} catch (error) {
		console.error(error);
		return new TimeOutMessage(interaction);
	}
}