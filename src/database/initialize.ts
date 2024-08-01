import { MongoClient, ObjectId } from 'mongodb';
import * as dotenv from 'dotenv';
import { setGuildDB } from './functions';
dotenv.config()

// Instantiate MongoDB client
const uri = process.env.DATABASE;
export const client = new MongoClient(uri);


// Establish connection to database
async function main() {
    try {
        await client.connect();
        console.group("💾 Connected successfully to MONGO");
    } catch (e) {
        console.error(e);
    }
}

main();

// type for all database entries in the guild collection
export type GuildDBEntry = {
    guild_id: string,
    settings: {
        active: boolean,
        whitelistedLanguages: string[],
        appearance: {
            translator: boolean
        }
    },
    _id?: ObjectId,
    name?: string,
    update?: boolean
} & Object

// type for settings entry in templates collection
type settingsTemplateType = { update: boolean, name: string } & GuildDBEntry

// variables for settings template and Guilds collection
export const Guilds = client.db(process.env['LIOFADB']).collection('Guilds');
export const settingsTemplate = <Promise<GuildDBEntry>>client.db(process.env['LIOFADB']).collection('Templates')
    .findOne({ name: 'settings' })
    .then((template): settingsTemplateType => {
        if (template === null) { throw console.log('❌ Failed to load template') }
        console.log('📃 Settings template received');


        return template as settingsTemplateType;
    })
    .then(async (template) => {

        const copiedTemplate = { ...template } as GuildDBEntry;

        // Tidy up the template so it looks more like a GuildDBEntry
        delete copiedTemplate._id;
        delete copiedTemplate.name;
        delete copiedTemplate.update;

        // If an update has been flagged on the template document
        if (template.update) {

            // Updates documents
            console.log(await checkForUpdates(copiedTemplate));

            // Resets update flag
            template.update = false;
            client.db(process.env['LIOFADB']).collection('Templates')
                .replaceOne({ name: 'settings' }, template)
            return template;
        }
        console.log('🟰  no database updates necessary');
        return template;
    })

console.groupEnd();

// Checks what entries need to be updated
// Does not overide any values that are already set
async function checkForUpdates(template: GuildDBEntry): Promise<string> {
    type objToUpdateType = Object & {
        [key: string]: any;
    };

    // Recursive function for adding missing entries to an object
    // Returns the new object as a promise
    async function searchAdd(objToUpdate: objToUpdateType, template: Object): Promise<Object | false> {
        let somethingWasUpdated = false;
        for (const [key, value] of Object.entries(template)) {

            // If the key is missing
            // Updates the object with the missing entry
            if (!(key in objToUpdate)) {
                objToUpdate[key] = value;
                somethingWasUpdated = true;
                continue;
            }

            // If the value is an object
            // Searches the object for more missing entries
            // **Unsure how this interacts with arrays or other objects**
            if (typeof value === 'object') {

                const updatedObject = await searchAdd(objToUpdate[key], value);

                if (updatedObject) {
                    somethingWasUpdated = true;
                    objToUpdate[key] = updatedObject
                }

            }
        }

        if (somethingWasUpdated) return objToUpdate;

        return false;
    }

    console.group('🆙 Updating database');

    // Collects all Guild documents into an array
    const allGuildInfo = (await Guilds.find({}).toArray())

    // Updates documents
    const updates = allGuildInfo.map(
        async (guildDoc) => {
            try {
                const newDoc = await searchAdd(<objToUpdateType>guildDoc, template);
                if (newDoc) {
                    setGuildDB((newDoc as GuildDBEntry).guild_id, newDoc as GuildDBEntry)
                    console.log('  ➡️  Updated: ' + (guildDoc as GuildDBEntry).guild_id);
                    return;
                }
                console.log('  ➡️  No Updates to: ' + (guildDoc as GuildDBEntry).guild_id);
            }
            catch {
                throw console.error('update failed on: ' + (<GuildDBEntry>guildDoc).guild_id)
            }
        }
    )

    // Waits for updates to finish before continuing
    await Promise.all(updates);
    console.groupEnd();
    return '✅ Updates complete'
}


