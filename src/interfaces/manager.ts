// Class for user interfaces
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, CommandInteraction, Message, ButtonInteraction, StringSelectMenuInteraction } from "discord.js";
import { TimeOutMessage } from "./messages";

// Designed to be used as interaction replies with ActionRowElements
export class BotInterface {

	content: string = ' ';
	embeds?: EmbedBuilder[];
	components: ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>[] = [];
	functions: Record<string, Function> = {};

	// Generates interface to be sent as a message
	render() {
		return {
			content: this.content ? this.content : ' ',
			embeds: this.embeds,
			components: this.components
		}
	}

	addContent(newContent: string) {
		this.content = newContent;
		return this;
	}

	addComponents(row: ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>) {
		this.components.push(row);
		return this;

	}

	addEmbed(embededContent: EmbedBuilder) {
		if (this.embeds) {
			this.embeds.push(embededContent)
			return this;
		}
		this.embeds = [embededContent];
		return this;

	}

	addFunction(name: string, arrowFunction: Function) {
		this.functions[name] = arrowFunction;
		return this;
	}
}

export type UIManagerApprovedInteraction = CommandInteraction | ButtonInteraction | StringSelectMenuInteraction;

// Screen for when people exit the interface
const endScreen = new BotInterface()
	.addEmbed(new EmbedBuilder()
		.setTitle('Bye 👋')
		.setImage('https://gifdb.com/images/high/bobby-hill-closing-door-slowly-4agdaxkuh78jqjah.gif')
	)

// Once called, it will handle all interactions from that interface
export async function UIManager(
	// Interaction that generated the UI
	interaction: UIManagerApprovedInteraction,

	// All possible screens from this interface
	screensFunction: (interaction: UIManagerApprovedInteraction) => Record<string, BotInterface> | Promise<Record<string, BotInterface>>,

	// The first and last screens to show
	startingScreen: string | false
): Promise<false | string> {

	let screen: string | false;
	let message: Message<boolean>;

	try {

		let screens: Record<string, BotInterface> | Promise<Record<string, BotInterface>>

		do {

			// Load in all screens
			screens = await screensFunction(interaction);

			// Loads in new screen
			screen = startingScreen;

			// Ends UIManager instances, useful for nested instances
			if (screen === false) break;

			// Sends screen by editing previous message
			let ui = screens[screen].render();
			message = await interaction.editReply(ui);

			// Waits for response from user
			let interactionResponse = await message.awaitMessageComponent(
				{ filter: i => i.user.id === interaction.user.id, time: 90_000 }
			).catch(() => {
				new TimeOutMessage(interaction)
				return undefined;
			});

			if (interactionResponse === undefined) return false;

			// Prevents an interaction failure message sent to user
			interactionResponse.deferUpdate();

			// Correctly assigns input value from selectMenus and buttons
			let interactionScriptRef: string | false;
			if (interactionResponse.isStringSelectMenu()) {
				interactionScriptRef = interactionResponse.values[0]
			}
			else {
				interactionScriptRef = interactionResponse.customId
			}

			// If there's a script by the given name associated with the current screen
			while (typeof screens[screen].functions[interactionScriptRef] != 'undefined') {

				// runs the script
				// if it returns false, it will not change the screen and will end this UIManager instance
				// this allows nested UIManager instances starting and ending from scripts
				interactionScriptRef = await screens[screen].functions[interactionScriptRef](interaction);

				if (interactionScriptRef === false) return false;
			}

			startingScreen = interactionScriptRef;

			// Checks next screen is valid
		} while (Object.keys(screens).includes(startingScreen));

		if (startingScreen === 'close') {
			interaction.editReply(endScreen);
			return false;
		}

		// If it's not another interface
		// and it's not a function
		// return the string to what called the UIManager
		return startingScreen;

	} catch (error) {
		console.error(error);
		return false;
	}
}

// Generates a list of buttons from an object
export async function generateButtons(object: Record<string, any>): Promise<ButtonBuilder[]> {

	let buttons: ButtonBuilder[] = [];

	// Iterates all object elements
	for (const key in object) {

		// Uses object key for button settings
		buttons.push(
			new ButtonBuilder()
				.setLabel(key)
				.setCustomId(key)
		);

	}
	return buttons;
}