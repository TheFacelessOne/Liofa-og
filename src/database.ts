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
        console.log("Connected successfully to MONGO 💾💾💾");
        // Perform operations on the collection here
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

main().catch(console.error);

type GuildDBEntry = {
    _id : ObjectId | undefined,
    guild_id : string,
    settings : {
        active : boolean
    }
}


const Guilds = client.db(process.env.LIOFADB).collection('Guilds');
const settingsTemplate = <Promise<GuildDBEntry>><unknown> Guilds.findOne({ _id : new ObjectId('000000000000000000000000')});
console.log('Settings template received:' + settingsTemplate);

export async function addGuildDB( guildRef : Guild["id"], overwrite? : boolean ) {
    try {
        let newGuild = await settingsTemplate;
        newGuild._id = undefined;
        newGuild.guild_id = guildRef;
        if(overwrite && await Guilds.findOne({guild_id : guildRef})) {
            Guilds.replaceOne({guild_id : guildRef}, settingsTemplate);
            return newGuild;
        }
        Guilds.insertOne(newGuild);
        return newGuild;
    } catch (e) {
        console.error(e);
    }
}

