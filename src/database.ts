import { MongoClient, ObjectId } from 'mongodb';
import * as dotenv from 'dotenv';
import { Guild } from 'discord.js';
dotenv.config()

const uri = process.env.DATABASE;
const client = new MongoClient(uri);


async function main() {
    const uri = process.env.DATABASE; // Replace with your MongoDB connection string
    const client = new MongoClient(uri);
    try {
        await client.connect();
        console.log("💾 Connected successfully to MONGO");
        // Perform operations on the collection here
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

main().catch(console.error);

type GuildDBEntry = {
    guild_id : string,
    settings : {
        active : boolean
    },
    _id? : ObjectId,
    name? : string
}


const Guilds = client.db(process.env.LIOFADB).collection('Guilds');
const settingsTemplate = <Promise<GuildDBEntry>><unknown> client.db(process.env.LIOFADB)
    .collection('Templates').findOne({name : 'settings'})
    .then((template) => {
        console.log('📃 Settings template received');
        return template;
    }
)

export async function addGuildDB( guildRef : Guild["id"], overwrite? : boolean ) {
    try {
        let newGuild = await settingsTemplate;
        newGuild.guild_id = guildRef;
        
        delete newGuild._id;
        delete newGuild.name;

        const alreadyExists = Guilds.findOne({guild_id : guildRef});
        const overwriteAble = overwrite ? await alreadyExists : false;

        if(overwriteAble) {
            Guilds.replaceOne({guild_id : guildRef}, settingsTemplate);
            return newGuild;
        }
        if (await alreadyExists) {
            return alreadyExists
        }
        return await Guilds.insertOne(newGuild);
    } catch (e) {
        console.error(e);
    }
}

export async function getGuildDB(id:string) {
    return Guilds.findOne({guild_id : id});
}

export async function toggleActivity(id:string) {
    const guildEntry = <GuildDBEntry> await Guilds.findOne({guild_id : id});
    guildEntry.settings.active = !guildEntry.settings.active;
    Guilds.replaceOne({guild_id : guildEntry.guild_id}, guildEntry)
    return guildEntry.settings.active;
}

export async function getActiveStatus(id:string) {
    return await Guilds.findOne({guild_id : id}).then((value) : boolean => {
        if (!<GuildDBEntry>value || value == null) {
            throw('There is no DB entry for this server')
        }
        if(value.settings.active) return true;

        return false;
    });
}

