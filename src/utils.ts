export {
	ErrorMessage,
	QuickButton,
	TimeOutMessage,
	BotInterface,
	UIManager
};

import { ActionRowBuilder, ButtonBuilder, CacheType, CommandInteraction, ComponentEmojiResolvable, EmbedBuilder, StringSelectMenuBuilder } from "discord.js";

// Creates an error message for the user
class ErrorMessage {

	constructor(interaction : CommandInteraction<CacheType>, errorCode : Number | String ) {

		// Errors if it can't respond
		if (!interaction.isRepliable()) { throw("Error message failed, cannot reply to message error: " + errorCode) }

		// Makes a silly message
		const errorResponse = new EmbedBuilder()
			.setTitle('Error: ' + errorCode)
			.setDescription('Uh oh! Something went wrong 🤡')
			.setImage('https://i.pinimg.com/originals/42/d3/1e/42d31ed24169f20fd886338e025536c8.gif')
			.setColor('Red');

		// Sends the silly message
		if (interaction.replied || interaction.deferred) {
			interaction.editReply({content : ' ', embeds : [errorResponse], components : []});
		}
		else {
			interaction.reply({content : ' ', embeds : [errorResponse], components : []});
		}
	}
}

class TimeOutMessage {

	constructor(interaction : CommandInteraction<CacheType>) {

		// Errors if message is not repliable
		if (!interaction.isRepliable()) { throw("Timeout message failed, cannot reply to message") }

		// Creates silly message
		const timeoutResponse = new EmbedBuilder()
			.setTitle('You timed out!')
			.setDescription('You took too long to respond so I stopped listening')
			.setImage('https://media2.giphy.com/media/xT5LMEMzdKTE2a6xfG/200w.gif?cid=6c09b952xqasvsrqldq9qjg1s3bi9fubomz8q8wdw5qqm8k1&ep=v1_gifs_search&rid=200w.gif&ct=g')
			.setColor('Orange');
		
		// Sends silly message
		if (interaction.replied || interaction.deferred) {
			interaction.editReply({content : ' ', embeds : [timeoutResponse], components : []});
		}
		else {
			interaction.reply({content : ' ', embeds : [timeoutResponse], components : []});
		}
	}

}

type acceptedEmojiStrings = "tick" | "cross" | "skull" | "stop";
type acceptedColourStrings = "blue" | "grey" | "green" | "red";

// Creates emoji buttons
class QuickButton extends ButtonBuilder{
    static buttonEmoji = (emoji: acceptedEmojiStrings) : ComponentEmojiResolvable => {
        switch (emoji) {
            case "tick":
                return "✅";
            case "cross":
                return "❌";
            case "skull":
                return "☠️";
			case "stop":
				return "🛑";
            default:
                throw new Error(`Invalid emoji: ${emoji}`);
        }
    };
	static style = {
		"blue" : 1,
		"grey" : 2,
		"green" : 3,
		"red" : 4,
	}

	constructor(emoji : acceptedEmojiStrings, colour : acceptedColourStrings, identifier : string) {
		super();
		this.setEmoji(QuickButton.buttonEmoji(emoji)).setCustomId(identifier).setStyle(QuickButton.style[colour]);
	}

}

// Class for user interfaces
// Designed to be used as interaction replies with ActionRowElements
class BotInterface {
	
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
	}
}

// Once called, it will handle all interactions from that interface
async function UIManager(
	// Interaction that generated the UI
	interaction : CommandInteraction,

	// All possible screens from this interface
	screens : Record<string, BotInterface>,

	// The first and last screens to show
	startingScreen : keyof typeof screens, 
	endingScreen? : keyof typeof screens
) {	

	let screen : string;

	try {
		do {
			// Loads in screen and sends it as a message
			screen = startingScreen;
			let ui = screens[screen].render();
			let message = await interaction.editReply(ui);
			if (screen === endingScreen) return;

			// Waits for response from user
			let interactionValue = await message.awaitMessageComponent({ filter : i => i.user.id === interaction.user.id, time : 60_000 });

			// Move to a new screen when the customId starts with '>'
			if (interactionValue.customId[0] === '>') {

				// Responds and immediatley deletes message
				// Prevents an interaction failure message sent to user
				interactionValue.reply(' ').then((i) => {return i.delete()})

				// Extract next screen from string
				startingScreen = interactionValue.customId.substring(1);
			}

			// Checks next screen is valid
		} while (Object.keys(screens).includes(startingScreen));

		return new ErrorMessage(interaction, 'Attempted to access incompatible screen');

	} catch (error) {
		console.log(error);
		return new TimeOutMessage(interaction);
	}
}