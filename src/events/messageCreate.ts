import { Events } from 'discord.js';
import type { Message } from 'discord.js';
import { getGuildDB } from '../database/functions';
import type { GuildDBEntry } from '../database/initialize';
import { LiofaResponse } from '../interfaces/messages';

// Response received from api
type detectorResponse = { detected_language: string, confidence: number };

// Function for calling the API for language detection
export async function detectLanguage(text: string): Promise<{ code: string, confidence: number } | null> {
	try {
		const response = await fetch(`http://127.0.0.1:${process.env.LANGDETECTORPORT}/detect-language/`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ text }),
		});

		if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

		const data = <detectorResponse>await response.json();
		return {
			code: data.detected_language.toLowerCase(),
			confidence: data.confidence
		};
	} catch (error) {
		console.error('Error calling language detection API:', error);
		return null;
	}
}

// Runs when a new message is sent somewhere that liofa can see
export default {
	reactsTo: Events.MessageCreate,

	async execute(message: Message) {
		// Stops liofa from listening to bots
		if (message.author.bot === true) return;

		try {
			const initialChecks = await Promise.all([
				// Filters message based on content
				// Returns filtered message
				filterMessage(message),

				// Checks server settings
				// Returns server settings
				serverSettingsCheck(message)
			])

			// Detect the language and stop if it fails or isn't confident
			const language = await detectLanguage(initialChecks[0]);
			if (language === null) throw 'Language Detection failed';
			if (language.confidence < 0.8) throw 'Not confident enough';

			// Checks if it's a whitelisted language
			const whitelistedLanguages = initialChecks[1].whitelistedLanguages;
			if (whitelistedLanguages.includes(language.code)) return;

			// Creates a message and sends it
			const messageResponse = new LiofaResponse(initialChecks[1]);
			message.reply(messageResponse.render());

		} catch (err) {
			// console.error(err)
		}

	}
}

// Function for filtering out messages based on their content
async function filterMessage(message: Message): Promise<string> {
	if (message.content.length < 5) return Promise.reject('❌ Message too short before filtering\nMessage before filtering:' + message.content);

	const text = message.content;
	const urlRegex = /(https?:\/\/[^\s]+)/g;
	const emojiRegex = /(?:\p{Emoji})+/gu;
	const discordMentionRegex = /<@!?(\d+)>/g;
	const discordCustomEmojiRegex = /<a?:\w+:([0-9]+)>/g;
	const excessWhitespaceRegex = /^\s|\s$/g;
	const punctuationSpacing = /\s+|([.,])(?=\S)/g;


	// Improve readability
	const filteredText = text
		.replace(urlRegex, '')
		.replace(emojiRegex, '')
		.replace(discordMentionRegex, '')
		.replace(discordCustomEmojiRegex, '')
		.replace(excessWhitespaceRegex, ' ')
		.replace(punctuationSpacing, '$1 ');

	if (filteredText.length < 5) return Promise.reject('❌ Message too short after filtering\nMessage after filtering:' + filteredText);

	// Returns the filtered text
	return Promise.resolve(filteredText);

}

// Function for checking server settings
async function serverSettingsCheck(message: Message): Promise<GuildDBEntry["settings"]> {

	// If message is from outside of a server
	if (!message.guild) return Promise.reject();


	// Get Server data and error if it fails
	const guildDataRequest = await getGuildDB(message.guild.id);
	if (!guildDataRequest) {
		console.error('no guild data for server: ', message.guild.id);
		return Promise.reject();
	}

	const guildSettings = guildDataRequest.settings;

	// Check if liofa is active
	if (!guildSettings.active) return Promise.reject();

	// Returns list of whitelisted languages
	return Promise.resolve(guildSettings)

}
