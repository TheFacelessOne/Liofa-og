import { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js"
import { type UIManagerApprovedInteraction } from "../manager"
import { LiofaResponse } from "../messages"
import { getGuildDB, setGuildDB } from "../../database/functions"
import { languageList, type languageCodes } from "../../utils/languages"
import type { GuildDBEntry } from "../../database/initialize"

// Select menu for settings pages
const appearanceSelectMenu = new ActionRowBuilder<StringSelectMenuBuilder>()
	.addComponents(new StringSelectMenuBuilder()
		.setCustomId('appearanceSelect')
		.setPlaceholder('Choose what to edit')
		.addOptions(new StringSelectMenuOptionBuilder()
			.setLabel('Translator link')
			.setValue('editTranslator')
		)
	)

// Creates a LiofaResponse message to preview them while editing the appearance
async function generatePreview(interaction: UIManagerApprovedInteraction, screenName: string, guildData: GuildDBEntry): Promise<LiofaResponse> {
	if (!interaction.guild?.id) throw 'No Guild ID given';
	const settings = guildData.settings

	// Creates a liofa message
	// Adds a select menu for choosing an option
	let preview = new LiofaResponse(
		settings,
		<languageCodes>settings.whitelistedLanguages[0],
		interaction.client.user.avatarURL()
	).addComponents(appearanceSelectMenu)

	// adds a function to the bot interface for updating the preview
	// runs a given updater function when the preview is updated
	const updatePreview = async () => {
		preview = new LiofaResponse(
			settings,
			<languageCodes>settings.whitelistedLanguages[0],
			interaction.client.user.avatarURL()
			// adds the appearance option select menu
		).addComponents(appearanceSelectMenu)
		return screenName;
	}

	return preview.addFunction('update', updatePreview);

}

let appearance: {
	translator: boolean;
	nativeName: boolean;
	showUserAvatar: boolean;
}

let guildData: GuildDBEntry | null;

// Generates the interfaces for the appearance settings
export const botInterfaces = async (interaction: UIManagerApprovedInteraction) => {

	if (!guildData) {
		if (interaction.guildId === null) throw 'No Guild ID';
		guildData = await getGuildDB(interaction.guildId);
		if (guildData === null) throw 'null Guild Database entry'
	}

	const exitButton = new ButtonBuilder()
		.setCustomId('Back')
		.setEmoji('🔙')
		.setStyle(ButtonStyle.Secondary)

	if (!appearance) {
		appearance = guildData.settings.appearance;
	}
	guildData.settings.appearance = appearance;

	// Generates the preview with the appearance select menu
	const preview = await generatePreview(interaction, 'preview', guildData);

	// Adds the exit button
	preview.addComponents(new ActionRowBuilder<ButtonBuilder>().addComponents(exitButton));

	// Button to turn on and off the translator link
	// Changes appearance dynamically
	const translatorLinkButton = new ButtonBuilder()
		.setCustomId('toggleTranslator')
		.setLabel(appearance.translator ? 'Turn off' : 'Turn on')
		.setStyle(appearance.translator ? ButtonStyle.Danger : ButtonStyle.Success)

	const editTranslatorScreen = await generatePreview(interaction, 'editTranslator', guildData);


	editTranslatorScreen.addComponents(
		new ActionRowBuilder<ButtonBuilder>().addComponents(exitButton).addComponents(translatorLinkButton)
	).addFunction('toggleTranslator', async () => {
		if (!guildData) throw 'No Guild Data'
		appearance.translator = !appearance.translator;
		await setGuildDB(interaction.guildId!, guildData);
		return 'update';
	})


	if (appearance.translator) generateTranslatorComponents(editTranslatorScreen, guildData.settings.whitelistedLanguages);

	return {
		preview: preview,
		editTranslator: editTranslatorScreen
	}

}

async function generateTranslatorComponents(screen: LiofaResponse, whitelist: languageCodes[]) {

	const translatorLanguageSelector = [];
	for (let languages of whitelist) {
		translatorLanguageSelector.push(
			new StringSelectMenuOptionBuilder()
				.setLabel(languageList[languages].name)
				.setValue('setTranslatorLink ' + languages)
				.setDescription('The translator will link to ' + languageList[languages].name)
		)
		screen.addFunction('setTranslatorLink ' + languages, async () => {
			if (!guildData) throw 'No Guild Data'
			const languageIndex = whitelist.findIndex(lang => lang === languages);
			const linkCode = whitelist.splice(languageIndex)[0];
			whitelist.unshift(linkCode);
			await setGuildDB(guildData.guild_id, guildData);
			return 'update';
		})
	}
	screen.addComponents(new ActionRowBuilder<StringSelectMenuBuilder>()
		.addComponents(
			new StringSelectMenuBuilder()
				.setCustomId(
					'translatorLinkLanguageSelection'
				).setPlaceholder(
					'Choose a language for the translator'
				).setOptions(translatorLanguageSelector)
		)
	)
}