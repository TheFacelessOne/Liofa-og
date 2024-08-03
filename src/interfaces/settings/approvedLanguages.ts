import { ActionRowBuilder, ButtonStyle, EmbedBuilder } from "discord.js"
import { BotInterface, type UIManagerApprovedInteraction, generateButtons } from "../manager"
import { ButtonBuilder } from "@discordjs/builders"
import type { GuildDBEntry } from "../../database/initialize";
import { ErrorMessage } from "../messages";
import { getGuildDB, setGuildDB } from "../../database/functions";
import { languageList } from "../../utils/languages";
type ISO639_1_CODE = keyof typeof languageList;


export type CustomCacheType = {
	[key: string]
	: Record<string, BotInterface>
	| ButtonBuilder[]
	| Record<string, Function>;
};

// Created a cache for this interface for efficiency purposes
const cache: CustomCacheType = {};

// Generates the embed for the approved languages screen
async function generateEmbed(GuildInfo: GuildDBEntry): Promise<EmbedBuilder> {

	// Title
	const languageEmbed = new EmbedBuilder().setTitle('Approved Languages');

	// If you have no approved languages
	if (GuildInfo.settings.whitelistedLanguages.length === 0) {
		languageEmbed.setDescription('No Languages are approved\n**This is not recommended, your server will be spammed by this bot**')
	}
	else {

		// Retrieve whitelist and create list
		let whitelist = GuildInfo.settings.whitelistedLanguages as ISO639_1_CODE[];
		let whitelistMessage = '';

		// Adds all elements of the array to the message
		whitelist.map((whitelistISOcode: ISO639_1_CODE) => {
			whitelistMessage += languageList[whitelistISOcode].name + '\n';
		})


		// Build embed
		languageEmbed.setDescription('**Whitelisted Languages**\n' + whitelistMessage)
	}

	return languageEmbed;

}


// Creates the page controls at the top of the buttons
const controlsRow = (pageNumber: number) => {
	return new ActionRowBuilder<ButtonBuilder>()
		.addComponents(
			new ButtonBuilder()
				.setCustomId('pageLeft')
				.setLabel('⬅️')
				.setStyle(ButtonStyle.Primary),
			new ButtonBuilder()
				.setCustomId('pageRight')
				.setLabel('➡️')
				.setStyle(ButtonStyle.Primary),
			new ButtonBuilder()
				.setCustomId(pageNumber.toString())
				.setLabel(pageNumber.toString())
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(true),
			new ButtonBuilder()
				.setCustomId('accept')
				.setLabel('Accept')
				.setStyle(ButtonStyle.Success),
			new ButtonBuilder()
				.setCustomId('back')
				.setLabel('Exit')
				.setStyle(ButtonStyle.Danger)
		)

}

// Sorts the buttons alphabetically
const sortButtons = (a: ButtonBuilder, b: ButtonBuilder) => {
	const languageCodeA = <ISO639_1_CODE>a.data.label;
	const languageCodeB = <ISO639_1_CODE>b.data.label;
	if (typeof languageCodeA != 'undefined' && typeof languageCodeB != 'undefined') {
		return languageList[languageCodeA].name.localeCompare(languageList[languageCodeB].name)
	}
	console.error('Tried to sort a button without a label');
	return 1;
}


// Checks if a language is whitelisted and colours the button accordingly
const addButtonColours = (
	button: ButtonBuilder,
	whitelist: ISO639_1_CODE[]
): ButtonBuilder => {
	if (!button.data.label) throw console.error('button label is undefined');

	// Whitelisted languages get green buttons
	if (whitelist.includes(button.data.label as ISO639_1_CODE)) {
		button.setStyle(ButtonStyle.Success);
	}
	else {
		button.setStyle(ButtonStyle.Secondary);
	}
	// Changes the button label to the language name
	button.setLabel(languageList[button.data.label as ISO639_1_CODE].name);
	return button;
}


// Creates all the possible pages within the approved languages screen
async function generatePages(interaction: UIManagerApprovedInteraction): Promise<BotInterface[]> {

	// Error checking
	if (interaction.guildId === null) throw console.error('null guild ID');

	// DB query and error checking
	const GuildInfo = await getGuildDB(interaction.guildId);
	if (GuildInfo === null) throw console.error('null GuildInfo');

	// Make the embed for each BotInterface
	const languageEmbed = generateEmbed(GuildInfo);

	let allButtons: ButtonBuilder[] = await generateButtons(languageList);

	allButtons.sort(sortButtons);
	allButtons.forEach((button) => {
		return addButtonColours(
			button,
			GuildInfo.settings.whitelistedLanguages as ISO639_1_CODE[]
		)
	});

	// Variables for arrays of ActionRowBuilders and BotInterfaces
	const pages: BotInterface[] = [];
	const actionRows: ActionRowBuilder<ButtonBuilder>[] = [];

	// Adds buttons to ActionRows in batches of 5
	for (let buttonIndex = 0; buttonIndex < allButtons.length; buttonIndex += 5) {

		// Init ActionRow
		const currentRow = new ActionRowBuilder<ButtonBuilder>()

		// Add at most 5 buttons to the ActionRow
		let batchCounter = 0
		for (let i = buttonIndex; allButtons[i] != undefined; i++) {
			currentRow.addComponents(allButtons[i]);
			batchCounter++;
			if (batchCounter === 5) break;
		}

		// Add the ActionRow to an array
		actionRows.push(currentRow);

	}

	// Adds ActionRows to BotInterfaces in batches of 4
	for (let actionRowIndex = 0; actionRowIndex < actionRows.length; actionRowIndex += 4) {

		const pageNumber = Math.ceil(actionRowIndex / 4) + 1;
		// Init BotInterface
		const currentPage = new BotInterface()
			.addComponents(controlsRow(pageNumber))
			.addContent(' ')
			.addEmbed(await languageEmbed)
			.addFunction('back', () => {
				return 'close';
			})

		// Adds at most 4 ActionRows to a BotInterface
		let batchCounter = 0
		for (let i = actionRowIndex; actionRows[i] != undefined; i++) {
			currentPage.addComponents(actionRows[i]);
			batchCounter++;
			if (batchCounter === 4) break;
		}
		pages.push(currentPage);
	}

	// Adds page movement functions to each screen
	for (let i = 0; i < pages.length; i++) {
		pages[i]
			.addFunction('pageLeft', () => {
				let prevPage = (i - 1) % pages.length;
				if (prevPage === -1) prevPage = pages.length - 1;
				return prevPage.toString();
			})
			.addFunction('pageRight', () => {
				let nextPage = ((i + 1) + pages.length % pages.length);
				if (nextPage === pages.length) nextPage = 0;
				return nextPage.toString();
			});
	}


	return pages;
}



// Creates the functions for each of the language buttons
async function generateButtonFunction(key: ISO639_1_CODE, interaction: UIManagerApprovedInteraction, whitelistedLanguages: ISO639_1_CODE[], GuildInfo: GuildDBEntry) {


	if (!interaction) throw console.error('Tried to create a button with no interaction');
	if (!interaction.guildId) throw console.error('Tried to create a button with no guild');


	return async () => {

		// Toggles the language in the whitelisted languages array
		const existsAtPosition = whitelistedLanguages.indexOf(key);
		if (existsAtPosition < 0) {
			whitelistedLanguages.push(key);
			setGuildDB(interaction.guildId!, GuildInfo);
		}
		else {
			GuildInfo.settings.whitelistedLanguages.splice(existsAtPosition, 1)
			setGuildDB(interaction.guildId!, GuildInfo);
		}

		// Clears the cache
		if (cache[`approvedLanguagesScreens_${interaction.guildId}`]) {
			delete cache[`approvedLanguagesScreens_${interaction.guildId}`];
		}

		// Gets the current page number based on the button's label
		const message = await interaction.fetchReply();
		let currentPage: string;
		try {
			currentPage = message.components[0].components[2].customId as string;
		}
		catch {
			currentPage = '1';
		}

		// returns the current page number
		const pageNum = Number.parseInt(currentPage) - 1;
		return pageNum.toString();
	}
}

// Generates interfaces for approvedLanguages Screens
export const botInterfaces = async (interaction: UIManagerApprovedInteraction) => {

	// Get Guild information
	if (interaction.guildId === null) throw new ErrorMessage(interaction, 'Tried to use an interaction with a null Guild ID');
	const GuildInfo = await getGuildDB(interaction.guildId);
	if (GuildInfo === null || GuildInfo === undefined) throw new ErrorMessage(interaction, 'Database returned null or undefined');


	// Starts a cache so screens do not need to be recreated every time
	const cacheKey = `approvedLanguagesScreens_${interaction.guildId}`;
	let screens: Record<string, BotInterface> = {};

	// Loads from cache if present
	if (cache[cacheKey]) {
		screens = cache[cacheKey] as Record<string, BotInterface>;
		return { ...screens };
	}

	// Generates all the pages of languages
	const pages = await generatePages(interaction);
	for (let i = 0; i < pages.length; i++) {
		screens[i] = pages[i];
		for (const key in languageList) {
			screens[i].addFunction(
				key,
				await generateButtonFunction(
					key as ISO639_1_CODE,
					interaction,
					GuildInfo.settings.whitelistedLanguages as ISO639_1_CODE[],
					GuildInfo
				)
			)
		}
	}

	// Caches generated pages
	cache[cacheKey] = screens;

	return { ...screens };
}
