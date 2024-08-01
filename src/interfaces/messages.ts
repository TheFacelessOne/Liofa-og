export {
	ErrorMessage,
	TimeOutMessage,
	LiofaResponse
};

import {
	ButtonInteraction,
	type CacheType,
	CommandInteraction,
	EmbedBuilder,
	StringSelectMenuInteraction,
} from "discord.js";
import type { GuildDBEntry } from "../database/initialize";
import { BotInterface } from "../../dist/Interface/Manager";

// Creates an error message for the user
class ErrorMessage {

	constructor(interaction: CommandInteraction<CacheType> | ButtonInteraction<CacheType> | StringSelectMenuInteraction<CacheType>, errorCode: Number | String) {

		console.error(errorCode);
		// Errors if it can't respond
		if (!interaction.isRepliable()) { throw ("Error message failed, cannot reply to message error: " + errorCode) }

		// Makes a silly message
		const errorResponse = new EmbedBuilder()
			.setTitle('Error: ' + errorCode)
			.setDescription('Uh oh! Something went wrong 🤡')
			.setImage('https://i.pinimg.com/originals/42/d3/1e/42d31ed24169f20fd886338e025536c8.gif')
			.setColor('Red');

		// Sends the silly message
		if (interaction.replied || interaction.deferred) {
			interaction.editReply({ content: ' ', embeds: [errorResponse], components: [] });
		}
		else {
			interaction.reply({ content: ' ', embeds: [errorResponse], components: [] });
		}

		return false;
	}
}

class TimeOutMessage {

	constructor(
		interaction: CommandInteraction<CacheType>
			| ButtonInteraction<CacheType>
			| StringSelectMenuInteraction<CacheType>
	) {

		// Errors if message is not repliable
		if (!interaction.isRepliable()) { throw ("Timeout message failed, cannot reply to message") }

		// Creates silly message
		const timeoutResponse = new EmbedBuilder()
			.setTitle('You timed out!')
			.setDescription('You took too long to respond so I stopped listening')
			.setImage('https://media2.giphy.com/media/xT5LMEMzdKTE2a6xfG/200w.gif?cid=6c09b952xqasvsrqldq9qjg1s3bi9fubomz8q8wdw5qqm8k1&ep=v1_gifs_search&rid=200w.gif&ct=g')
			.setColor('Orange');

		// Sends silly message
		if (interaction.replied || interaction.deferred) {
			interaction.editReply({ content: ' ', embeds: [timeoutResponse], components: [] });
		}
		else {
			interaction.reply({ content: ' ', embeds: [timeoutResponse], components: [] });
		}
		return 'timeout';
	}

}

class LiofaResponse extends BotInterface {
	constructor(settings: GuildDBEntry["settings"]) {
		super();

		const responseEmbed = new EmbedBuilder;

		responseEmbed.setAuthor({
			name: "Liofa",
			url: "https://github.com/TheFacelessOne/Liofa-Bot",
			iconURL: "https://top.gg/_next/image?url=https%3A%2F%2Fimages.discordapp.net%2Favatars%2F866186816645890078%2Ff3b461b3e604bcf0619a47f50304dfc1.png%3Fsize%3D128&w=256&q=75",
		});

		responseEmbed.setTitle('Please speak x Language');

		const showTranslatorLink = settings.appearance.translator;
		if (showTranslatorLink) {
			responseEmbed.setURL('https://translate.google.com/?sl=auto&tl=en&op=translate');
		}

		responseEmbed.setColor('Red');

		responseEmbed.setFooter({
			text: 'You have x warnings remaining'
		})

		const responseMessage = new BotInterface().addEmbed(responseEmbed)

		return responseMessage;

	}
}