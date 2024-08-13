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
import { BotInterface } from "./manager"
import { languageList } from "../utils/languages";
import { sentence } from "../utils/translated";

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


// The Response message for when an unaccepted language is used
class LiofaResponse extends BotInterface {
	constructor(
		settings: GuildDBEntry["settings"],
		spokenLanguage: keyof typeof languageList,
		avatar: string | null

	) {
		super();

		const responseEmbed = new EmbedBuilder;

		// responseEmbed.setAuthor({
		// 	name: "Liofa",
		// 	url: "https://github.com/TheFacelessOne/Liofa-Bot",
		// 	iconURL: "https://images.discordapp.net/avatars/866186816645890078/f3b461b3e604bcf0619a47f50304dfc1.png",
		// });

		responseEmbed.setTitle(sentence[spokenLanguage]);

		const namingConvention = settings.appearance.nativeName ? 'nativeName' : 'name';

		const formatLanguageList = () => {
			let formattedList = '';
			for (const language of settings.whitelistedLanguages) {
				let preferred = false;
				if (language === settings.whitelistedLanguages[0]) {
					preferred = true;
					formattedList += '**'
				}
				formattedList += languageList[<typeof spokenLanguage>language][namingConvention] + '\n';
				formattedList += preferred ? '**' : '';
			}
			return formattedList;
		}
		responseEmbed.setDescription(formatLanguageList());

		if (settings.appearance.showUserAvatar) {
			responseEmbed.setThumbnail(avatar);
		}

		const showTranslatorLink = settings.appearance.translator;
		if (showTranslatorLink) {
			responseEmbed.setURL(`https://translate.google.com/?sl=auto&tl=${settings.whitelistedLanguages[0]}&op=translate`);
		}

		responseEmbed.setColor('Red'); // Change based on warning level

		// responseEmbed.setFooter({
		// 	text: 'You have x warnings remaining'
		// })

		const responseMessage = new BotInterface().addEmbed(responseEmbed)


		return responseMessage;

	}
}