export {
	ErrorMessage,
	QuickButton,
	TimeOutMessage,
	BotInterface,
	UIManager
};

import { ActionRowBuilder, ButtonBuilder, CacheType, CommandInteraction, ComponentEmojiResolvable, EmbedBuilder, Interaction, MessagePayload, StringSelectMenuBuilder } from "discord.js";

class ErrorMessage {

	constructor(interaction : CommandInteraction<CacheType>, errorCode : Number | String ) {

		if (!interaction.isRepliable()) { throw("Error message failed, cannot reply to message error: " + errorCode) }

		const errorResponse = new EmbedBuilder()
			.setTitle('Error: ' + errorCode)
			.setDescription('Uh oh! Something went wrong 🤡')
			.setImage('https://i.pinimg.com/originals/42/d3/1e/42d31ed24169f20fd886338e025536c8.gif')
			.setColor('Red');

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

		const timeoutResponse = new EmbedBuilder()
			.setTitle('You timed out!')
			.setDescription('You took too long to respond so I stopped listening')
			.setImage('https://media2.giphy.com/media/xT5LMEMzdKTE2a6xfG/200w.gif?cid=6c09b952xqasvsrqldq9qjg1s3bi9fubomz8q8wdw5qqm8k1&ep=v1_gifs_search&rid=200w.gif&ct=g')
			.setColor('Orange');
		
		if (!interaction.isRepliable()) { throw("Timeout message failed, cannot reply to message") }

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

class BotInterface {
	
	content : string = ' '; 
	embeds? : EmbedBuilder[];
	components : ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>[] = [];
	functions : Record<string, Function> = {};
	
	getScreen() {

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

	addFunction(name : string, newFunction : Function) {
		this.functions[name] = newFunction;
	}
}

async function UIManager( 
	interaction : CommandInteraction,
	screens : Record<string, BotInterface>,
	startingScreen : keyof typeof screens, 
	endingScreen? : keyof typeof screens
) {	

	let screen : string;

	try {
		do {
			screen = startingScreen;
			let ui = screens[screen].getScreen();
			let message = await interaction.editReply(ui);
			if (screen === endingScreen) return;
			let interactionValue = await message.awaitMessageComponent({ filter : i => i.user.id === interaction.user.id, time : 60_000 });

			// Move to a new screen when the customId starts with '>'
			if (interactionValue.customId[0] === '>') {
				interactionValue.reply(' ').then((i) => {return i.delete()})
			}
			
			startingScreen = interactionValue.customId.substring(1);
		} while (Object.keys(screens).includes(startingScreen));

		return new ErrorMessage(interaction, 'Attempted to access incompatible screen');

	} catch (error) {
		console.log(error);
		return new TimeOutMessage(interaction);
	}
}