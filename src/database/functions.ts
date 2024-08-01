import { Guild } from "discord.js";
import { type GuildDBEntry, Guilds, settingsTemplate } from "./initialize";
export {
    addGuildDB,
    getGuildDB,
    toggleActivity,
    getActiveStatus,
    setGuildDB
}

// Add a guild to the database with an optional overwrite parameter
async function addGuildDB(guildRef: Guild["id"], overwrite?: boolean) {
    try {
        let newGuild = await settingsTemplate;
        newGuild.guild_id = guildRef;

        // Checks if an overwrite is necessary/possible
        const alreadyExists = Guilds.findOne({ guild_id: guildRef });
        const overwriteAble = overwrite ? await alreadyExists : false;

        // Overwrites document with template
        if (overwriteAble) {
            Guilds.replaceOne({ guild_id: guildRef }, settingsTemplate);
            return;
        }

        // Returns if document isn't being overwritten
        if (await alreadyExists) return;

        // Inserts new document if it doesn't exist
        return await Guilds.insertOne(newGuild);
    } catch (e) {
        console.error(e);
    }
}

async function getGuildDB(id: string): Promise<GuildDBEntry | null> {
    return <Promise<GuildDBEntry | null>>Guilds.findOne({ guild_id: id });
}

async function setGuildDB(id: string, guildEntry: GuildDBEntry): Promise<void> {
    Guilds.replaceOne({ guild_id: id }, guildEntry)
}

// Turns liofa on or off in the specified server
async function toggleActivity(id: string) {

    // Load settings
    const guildEntry = <GuildDBEntry>await Guilds.findOne({ guild_id: id });

    // Flips boolean
    guildEntry.settings.active = !guildEntry.settings.active;

    // Updates database
    Guilds.replaceOne({ guild_id: guildEntry.guild_id }, guildEntry)
    return guildEntry.settings.active;
}

// Getter function for whether or not Liofa is active in a server
async function getActiveStatus(id: string) {
    return await Guilds.findOne({ guild_id: id }).then((value): boolean => {
        if (!<GuildDBEntry>value || value == null) {
            throw ('There is no DB entry for this server')
        }
        if (value["settings"].active) return true;

        return false;
    });
}
