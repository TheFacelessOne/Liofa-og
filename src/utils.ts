export {
	ErrorMessage,
	QuickButton
};

import { ButtonBuilder, ComponentEmojiResolvable } from "discord.js";

class ErrorMessage {
	content = '☠️There was an error while executing this command!☠️';
	ephemeral : boolean;

	constructor(ephemeral? : boolean) {
		this.ephemeral = ephemeral ? true : false;
	}
}

type acceptedEmojiStrings = "tick" | "cross" | "skull";
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
