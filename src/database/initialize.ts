import { MongoClient, ObjectId } from 'mongodb';
import * as dotenv from 'dotenv';
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
    guild_id : string,
    settings : {
        active : boolean,
        whitelistedLanguages : string[],
    },
    _id? : ObjectId,
    name? : string
} & Object

// type for settings entry in templates collection
type settingsTemplateType = { update? : boolean, name? : string } & GuildDBEntry

// variables for settings template and Guilds collection
export const Guilds = client.db(process.env.LIOFADB).collection('Guilds');
export const settingsTemplate = <Promise<GuildDBEntry>> client.db(process.env.LIOFADB)
    .collection('Templates')
    .findOne({name : 'settings'}) 
    .then( (template) : settingsTemplateType => {
        if (template === null) {throw console.log('❌ Failed to load template')}
        console.log('📃 Settings template received');
        

        return template as settingsTemplateType;
    })
    .then(async (template) => {

        const copiedTemplate = { ...template };
        
        // Tidy up the template so it looks more like a GuildDBEntry
        delete copiedTemplate._id;
        delete copiedTemplate.name;
        delete copiedTemplate.update;

        // If an update has been flagged on the template document
        console.log(template.update ? 
            await checkForUpdates(copiedTemplate) : '🟰  no database updates necessary' 
        );
        return template;
    })

console.groupEnd();

async function checkForUpdates( template : settingsTemplateType ) : Promise<string> {
    type objToUpdateType = Object & {
        [key: string]: any;
    };

    delete template.update; // remove the update flag

    // Recursive function for adding missing entries to an object
    // Returns the new object as a promise
    async function searchAdd(objToUpdate : objToUpdateType, template : Object) : Promise<Object> {
        for (const [key, value] of Object.entries(template)) {

            // If the key is missing
            // Updates the object with the missing entry
            if (!(key in objToUpdate)) {
                objToUpdate[key] = value;
                continue;
            }

            // If the value is an object
            // Searches the object for more missing entries
            // **Unsure how this interacts with arrays or other objects**
            if (typeof value === 'object') {
                objToUpdate[key] = await searchAdd(objToUpdate[key], value)
            }
        }

        return objToUpdate;
    }

    console.group('🆙 Updating database');

    // Collects all Guild documents into an array
    const allGuildInfo = (await Guilds.find({}).toArray())

    // Updates documents
    const updates = allGuildInfo.map( 
        async ( guildDoc ) => {
            try {
                await searchAdd(<objToUpdateType>guildDoc, template);
                console.log('  ➡️  Updated: ' + (<GuildDBEntry>guildDoc).guild_id);
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


