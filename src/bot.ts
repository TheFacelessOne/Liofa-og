// Required modules
import * as dotenv from 'dotenv';
import fs from 'fs';
import { Client, ClientEvents, Collection, GatewayIntentBits, IntentsBitField, SlashCommandBuilder } from 'discord.js';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { addGuildDB } from './database/functions';
dotenv.config();

// What permissions the bot needs
// Used for what events the bot can listen for too
const myIntents = new IntentsBitField();
myIntents.add(
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.MessageContent,
	GatewayIntentBits.GuildMembers,
);

// The client we intend to login on
const client = new Client({ intents: myIntents });
client.commands = new Collection;

type Commands = {
	data : SlashCommandBuilder
	execute : Function
	ephemeral? : boolean
}

// Registers Commands
const commands: Commands[] = [];
const commandFiles = fs.readdirSync('./src/commands').filter((file: string) => file.endsWith('.ts') || file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`).default;
    commands.push(command.data.toJSON());
	client.commands.set(command.data.name, command);
}

if (typeof process.env.DEVTOKEN === 'undefined' || typeof process.env.DEVCLIENTID === 'undefined') {
	throw('TOKEN or CLIENTID is undefined');
}
const token = process.env.DEVTOKEN;
const clientID = process.env.DEVCLIENTID;


const rest = new REST({ version: '9' }).setToken(token);

interface DiscordEvent {
	reactsTo : keyof ClientEvents,
	execute : any,
	once? : boolean,
}

// Chooses which events to act on
const eventFiles = fs.readdirSync('./src/events').filter((file: string) => file.endsWith('.ts') || file.endsWith('.js'));
for (const file of eventFiles) {
    const event : DiscordEvent = require(`./events/${file}`).default;

    if (event.once) {
        client.once(event.reactsTo, (...args: any) => event.execute(...args));
    } else {
        client.on(event.reactsTo, (...args: any) => event.execute(...args));
    }
}

console.group('⏰ Liofa\'s alarm is ringing');
client.login(token).then(() => {

	if (!client.user) throw new Error("user is null");
    console.log('🔑 Logged in as', client.user.tag);

    // Retrieve the list of guilds your bot is a part of
    const guilds = client.guilds.cache;

    // Extract guild IDs
    const guildIds = Array.from(guilds.keys());

    // Register commands for each guild
    registerCommandsForGuilds(guildIds).then(() => {
        console.log('✅ Commands successfully registered for all guilds.');
		console.groupEnd();
    }).catch(console.error);


	// Function to register commands for all specified guilds
	async function registerCommandsForGuilds(guildIds: string[]) {
		if (!client.user) throw new Error("user is null");
		for (const guildId of guildIds) {
			try {
				addGuildDB(guildId, false);
				await rest.put(
					Routes.applicationGuildCommands(clientID, guildId),
					{ body: commands },
				);
			} catch (error) {
				console.error(`❌ Failed to register commands for guild ${guildId}:`, error);
			}
		}
	}

}).catch(console.error);