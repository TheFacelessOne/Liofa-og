import { ActionRowBuilder, ButtonStyle, EmbedBuilder } from "discord.js"
import { BotInterface, UIManagerApprovedInteraction } from "../manager"
import { ButtonBuilder } from "@discordjs/builders"
import { GuildDBEntry } from "../../database/initialize";
import { ErrorMessage } from "../messages";
import { getGuildDB } from "../../database/functions";

const languageList = {
	"af": "Afrikaans",
	"am": "Amharic",
	"ar": "Arabic",
	"bg": "Bulgarian",
	"bg-Latn": "Bulgarian",
	"bn": "Bangla",
	"bs": "Bosnian",
	"ca": "Catalan",
	"ceb": "Cebuano",
	"co": "Corsican",
	"cs": "Czech",
	"cy": "Welsh",
	"da": "Danish",
	"de": "German",
	"el": "Greek",
	"el-Latn": "Greek",
	"en": "English",
	"eo": "Esperanto",
	"es": "Spanish",
	"et": "Estonian",
	"eu": "Basque",
	"fa": "Persian",
	"fi": "Finnish",
	"fil": "Filipino",
	"fr": "French",
	"fy": "Western Frisian",
	"ga": "Irish",
	"gd": "Scottish Gaelic",
	"gl": "Galician",
	"gu": "Gujarati",
	"ha": "Hausa",
	"haw": "Hawaiian",
	"hi": "Hindi",
	"hi-Latn": "Hindi",
	"hmn": "Hmong",
	"hr": "Croatian",
	"ht": "Haitian Creole",
	"hu": "Hungarian",
	"hy": "Armenian",
	"id": "Indonesian",
	"ig": "Igbo",
	"is": "Icelandic",
	"it": "Italian",
	"iw": "Hebrew",
	"ja": "Japanese",
	"ja-Latn": "Japanese",
	"jv": "Javanese",
	"ka": "Georgian",
	"kk": "Kazakh",
	"km": "Khmer",
	"kn": "Kannada",
	"ko": "Korean",
	"ku": "Kurdish",
	"ky": "Kyrgyz",
	"la": "Latin",
	"lb": "Luxembourgish",
	"lo": "Lao",
	"lt": "Lithuanian",
	"lv": "Latvian",
	"mg": "Malagasy",
	"mi": "Maori",
	"mk": "Macedonian",
	"ml": "Malayalam",
	"mn": "Mongolian",
	"mr": "Marathi",
	"ms": "Malay",
	"mt": "Maltese",
	"my": "Burmese",
	"ne": "Nepali",
	"nl": "Dutch",
	"no": "Norwegian",
	"ny": "Nyanja",
	"pa": "Punjabi",
	"pl": "Polish",
	"ps": "Pashto",
	"pt": "Portuguese",
	"ro": "Romanian",
	"ru": "Russian",
	"ru-Latn": "Russian",
	"sd": "Sindhi",
	"si": "Sinhala",
	"sk": "Slovak",
	"sl": "Slovenian",
	"sm": "Samoan",
	"sn": "Shona",
	"so": "Somali",
	"sq": "Albanian",
	"sr": "Serbian",
	"st": "Southern Sotho",
	"su": "Sundanese",
	"sv": "Swedish",
	"sw": "Swahili",
	"ta": "Tamil",
	"te": "Telugu",
	"tg": "Tajik",
	"th": "Thai",
	"tr": "Turkish",
	"uk": "Ukrainian",
	"ur": "Urdu",
	"uz": "Uzbek",
	"vi": "Vietnamese",
	"xh": "Xhosa",
	"yi": "Yiddish",
	"yo": "Yoruba",
	"zh": "Chinese Han",
	"zh-Latn": "Chinese",
	"zu": "Zulu"
}

type languageCodes = keyof typeof languageList;

function generateEmbed(GuildInfo : GuildDBEntry) : EmbedBuilder {

	const languageEmbed = new EmbedBuilder().setTitle('Approved Languages');

	if (GuildInfo.settings.whitelistedLanguages.length === 0) {
		languageEmbed.setDescription('No Languages are approved, **This is not recommended, your server will be spammed by this bot**')		
	}
	else {

		let whitelist = GuildInfo.settings.whitelistedLanguages as languageCodes[];

		let whitelistMessage = '';
		whitelist.map((element: languageCodes) => languageList[element]).forEach((element : string) => {
			whitelistMessage += element + '\n';
		});
		
		languageEmbed.addFields(
			{ name: 'Whitelisted Languages', value : whitelistMessage }
		)
	}

	return languageEmbed;

}

function generateButtons() : ButtonBuilder[] {

	let buttons : ButtonBuilder[] = []

	for (const key in languageList) {

		if (key.includes('Latn')) continue;
		
		buttons.push( 
			new ButtonBuilder()
			.setLabel(key)
			.setCustomId('toggle ' + key)
		)
	}
	return buttons;

}

const controlsRow = (pageNumber : number) => {
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
			.setCustomId('page')
			.setLabel(pageNumber.toString())
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(true),
		new ButtonBuilder()
			.setCustomId('accept')
			.setLabel('Accept')
			.setStyle(ButtonStyle.Success),
		new ButtonBuilder()
			.setCustomId('end')
			.setLabel('Exit')
			.setStyle(ButtonStyle.Danger)
	)

}

type LanguageKey = keyof typeof languageList

async function generatePages(interaction : UIManagerApprovedInteraction) : Promise<BotInterface[]> {

	if (interaction.guildId === null) throw console.error('null guild ID');

	const GuildInfo = await getGuildDB(interaction.guildId);

	if (GuildInfo === null) throw console.error('null GuildInfo');

	const initializeButtons = generateButtons();
	const allButtons = Array.from(initializeButtons);

	allButtons.map(( button : ButtonBuilder) => {
		if ( button.data.label === undefined ) throw console.error('button label is undefined');
		if (button.data.label === 'en' || button.data.label === 'English') console.log('this is supposed to be en :', button.data.label)
		if ( GuildInfo.settings.whitelistedLanguages.includes(button.data.label) ){
			button.setStyle(ButtonStyle.Success);
		}
		else {
			button.setStyle(ButtonStyle.Secondary);
		}
		button.setLabel(languageList[button.data.label as LanguageKey] || button.data.label)
		return button;
	});

	const pages : BotInterface[] = [];
	const actionRows : ActionRowBuilder<ButtonBuilder>[] = [];

	const languageEmbed = generateEmbed(GuildInfo);
	
	for (let buttonIndex = 0; buttonIndex < allButtons.length; buttonIndex += 5) {
		const currentRow = new ActionRowBuilder<ButtonBuilder>()

		let batchCounter = 0
		for (let i = buttonIndex; allButtons[i] != undefined; i++) {
			currentRow.addComponents(allButtons[i]);
			batchCounter++;
			if (batchCounter === 5) break;
		}

		actionRows.push(currentRow);

	}

	for (let actionRowIndex = 0; actionRowIndex < actionRows.length; actionRowIndex += 4) {

		const currentPage = new BotInterface()
		.addComponents(controlsRow(Math.ceil(actionRowIndex / 4) + 1 ))
		.addContent(' ')
		.addEmbed(languageEmbed)
		.addFunction('back', () => {
			return false;
		})

		let batchCounter = 0
		for (let i = actionRowIndex; actionRows[i] != undefined; i++) {
			currentPage.addComponents(actionRows[i]);
			batchCounter++;
			if (batchCounter === 4) break;
		}
		pages.push(currentPage);
	}

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
		})
	}


	return pages;
}
  

export const botInterfaces = async ( interaction : UIManagerApprovedInteraction ) => { 

	if ( interaction.guildId === null) throw new ErrorMessage(interaction, 'Tried to use an interaction with a null Guild ID');
	let GuildInfo = await getGuildDB(interaction.guildId);
	if ( GuildInfo === null || GuildInfo === undefined ) throw new ErrorMessage(interaction, 'Database returned null or undefined');


	let pages = await generatePages(interaction);

	let screens : Record<string, BotInterface> = {}

	for (let i = 0; i < pages.length; i++) {
		screens[i] = pages[i];
	}
	
	return { ...screens};
}
