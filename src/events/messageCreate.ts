import { Events } from 'discord.js';
import type { Message } from 'discord.js';

export async function detectLanguage(text: string): Promise<string | null> {
	try {
		const response = await fetch(`http://127.0.0.1:${process.env.LANGDETECTORPORT}/detect-language/`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ text }),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		return data.detected_language;
	} catch (error) {
		console.error('Error calling language detection API:', error);
		return null;
	}
}

export default {
	reactsTo: Events.MessageCreate,

	async execute(message: Message) {
		const detectedLanguage = detectLanguage(message.content)
		console.log(await detectedLanguage);

	}
}