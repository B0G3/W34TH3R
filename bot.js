const botSettings = require("./botSettings.json");
const prefix = botSettings.prefix;

const Discord = require("discord.js");
const fs = require("fs");

const bot = new Discord.Client({ 
    intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES],
    allowedMentions: {
        parse: ['users'],
        repliedUser: false,
    }
});

bot.commands = new Discord.Collection();
bot.aliases = new Discord.Collection();

fs.readdir("./cmds/", (err, files) => {
    if(err) console.error(err);

    let jsfiles = files.filter(f => f.split(".").pop() === "js");
    if(jsfiles.length <= 0) {
        console.log("No commands to load!")
        return;
    }
    console.log(`Loading custom commands:`)
    jsfiles.forEach((f,i) => {
        let props = require(`./cmds/${f}`);

        try{
            console.log(`- ${f} loaded!`)
            bot.commands.set(props.name, props);

            props.aliases.forEach(alias => {
                bot.aliases.set(alias, props.name);
            })
        }catch(err){
            return console.log(err);
        }
    });
});

bot.on("ready", () => {
    console.log('Ready!');

    /*
    let inviteLink = bot.generateInvite({
        permissions: [
            Discord.Permissions.FLAGS.ADMINISTRATOR,
        ],
        scopes: ['bot'],
    })

    console.log(inviteLink);
    */
});

bot.on("messageCreate", async message => {
    if(message.author.bot) return;
    if(message.channel.type === "dm") return;

    let messageArray = message.content.split(" ");
    let command = messageArray[0];

    if(!command.startsWith(prefix)) return;
    let args = messageArray.slice(1);
    let cmdStr = command.slice(prefix.length);
    let cmd = bot.commands.get(cmdStr) || bot.commands.get(bot.aliases.get(cmdStr));

    if(cmd){
        if(!cmd.adminonly) cmd.run(bot, message, args);
    }else{
        message.channel.send("Nie znaleziono komendy.");
    }
});

bot.login(botSettings.discord_token);