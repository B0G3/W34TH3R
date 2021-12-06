const Discord = require("discord.js");
const botSettings = require("./botSettings.json");
const prefixSchema = require("./models/prefix.js");
const statSchema = require("./models/stat.js");
const languageUtil = require("./util/languageUtil.js")
const mongoose = require("mongoose");
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
bot.prefix = async (message) => {
    let prefix;

    const data = await prefixSchema.findOne({guildId: message.guild.id}).catch(err => {
        console.log(err);
    })

    if(data) prefix = data.prefix;
    else prefix = botSettings.prefix;
 
    return prefix;
}

loadCommands = (guild = null) => {
    let slashCommands;
    if(guild) {
        slashCommands = guild.commands
    } else {
        commands = bot.application?.commands;
    }
    fs.readdir("./cmds/", (err, files) => {
        if(err) console.error(err);

        let jsfiles = files.filter(f => f.split(".").pop() === "js");
        if(jsfiles.length <= 0) {
            console.log("No commands to load!")
            return;
        }
        console.log(`Loading commands:`)
        jsfiles.forEach((f,i) => {
            let props = require(`./cmds/${f}`);

            try{
                console.log(`- ${f} loaded!`)
                bot.commands.set(props.name, props);
                
                slashCommands?.create({
                    name: props.name,
                    description: languageUtil.getEnglishPhrase(props.description),
                    options: props.slashOptions?props.slashOptions:null
                })

                props.aliases.forEach(alias => {
                    bot.aliases.set(alias, props.name);
                })
            }catch(err){
                return console.log(err);
            }
        });
    });
}

loadDatabase = async () => {
    await mongoose.connect(botSettings.mongodb_srv, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => {
        console.log('Connected to database!');
    }).catch((err)=>{
        console.log(err);
        process.exit(1);
    })
}

bot.on("ready", async () => {
    const guildId = '838462696046985236';
    const guild = bot.guilds.cache.get(guildId);

    await loadDatabase();
    await languageUtil.loadLanguages(bot);
    loadCommands(guild);
    
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

parseSlashArguments = (data, argArray) => {
    data.forEach(e => {
        if(e.value) argArray.push(e.value.toString());
        else{
            if(e.options) parseSlashArguments(e.options, argArray);
        }
    });
}

bot.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;

    let cmd = bot.commands.get(commandName);
    if(!cmd) return;

    let args = [];
    parseSlashArguments(options.data, args);

    let message = interaction;
    message.author = interaction.user;

    let prefix = await bot.prefix(message);
    interaction.reply({content: `${prefix}${commandName} ${args.join(' ')}`});
    cmd.run(bot, message, args);
    

})

updateStat = async (guild, user, cmd) => {
    await statSchema.findOneAndUpdate({
        cmdName: cmd.name,
        guildId: guild.id,
        userId: user.id,
	}, {
        $inc: {usages: 1}
	}, {
		upsert: true
	});
}

bot.on("messageCreate", async message => {
    if(message.author.bot) return;
    if(message.channel.type === "dm") return;

    let messageArray = message.content.toLowerCase().split(" ");
    let command = messageArray[0];

    let prefix = await bot.prefix(message);

    if(!command.startsWith(prefix)) return;
    let args = messageArray.slice(1);
    let cmdStr = command.slice(prefix.length);
    let cmd = bot.commands.get(cmdStr) || bot.commands.get(bot.aliases.get(cmdStr));

    if(cmd){
        if(!cmd.adminOnly){ 
            cmd.run(bot, message, args); 
            updateStat(message.guild, message.author, cmd);
        }
        else{
            if(message.member.permissions.has("ADMINISTRATOR")){ 
                cmd.run(bot, message, args);
                updateStat(message.guild, message.author, cmd);
            }
            else message.channel.send({content: languageUtil.getPhrase(message.guild, "ERR_CMD_NOPERM")});
        }
    }else{
        message.channel.send({content: languageUtil.getPhrase(message.guild, "ERR_CMD_NOTFOUND")});
    }
});

bot.login(botSettings.discord_token);