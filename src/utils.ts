export {
	ErrorMessage,
	QuickButton
};

import { ButtonBuilder } from "discord.js";

class ErrorMessage {
	content = '☠️There was an error while executing this command!☠️';
	ephemeral : boolean;

	constructor(ephemeral? : boolean) {
		this.ephemeral = ephemeral ? true : false;
	}
}

class QuickButton {
	component : ButtonBuilder
	static tick = "✅";
	static cross = "❌";
	static skull = "☠️";
	static style = {
		"blue" : 1,
		"grey" : 2,
		"green" : 3,
		"red" : 4,
	}
	constructor(emoji : "tick" | "cross" | "skull", colour : "blue" | "grey" | "green" | "red", identifier : string) {
		this.component = new ButtonBuilder().setEmoji(QuickButton[emoji]).setCustomId(identifier).setStyle(QuickButton.style[colour]);
	}

}
