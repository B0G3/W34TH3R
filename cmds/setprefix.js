const prefixSchema = require("../models/prefix.js");
const {getPhrase} = require("../util/languageUtil.js");

const execFunction = async (bot, message, args) => {
    if(!args[0]){
        message.channel.send(getPhrase(message.guild, "CMD_SETPREFIX_ERROR_1"));
        return;
    }else{
        if(args[0].length>5){
            message.channel.send(getPhrase(message.guild, "CMD_SETPREFIX_ERROR_2"));
            return;
        }
    }
    /*
    prefixSchema.findOne({guildId: message.guild.id}, async(err, data) => {
        if(err) throw err;
        if(data){
            await prefixSchema.findOneAndDelete({guildId: message.guild.id});
        }
        data = new prefixSchema({
            guildId: message.guild.id,
            prefix: args[0]
        })
        data.save();
        message.channel.send(`${getPhrase(message.guild, "CMD_SETPREFIX_SUCCESS")} **(${args[0]})**`);
    })
    */

    await prefixSchema.findOneAndUpdate({
		_id: message.guild.id
	}, {
		_id: message.guild.id,
		prefix: args[0]
	}, {
		upsert: true
	});

    message.channel.send(`${getPhrase(message.guild, "CMD_SETPREFIX_SUCCESS")} **(${args[0]})**`);
}

module.exports = {
	run: execFunction,
	name: "setprefix",
	aliases: ["setp", "sp"],
    adminOnly: true,
	description: "CMD_SETPREFIX_DESCRIPTION",
	syntax: "CMD_SETPREFIX_SYNTAX",
	categoryId: 3,
	slashOptions: [
		{
			description: "Prefix to set",
			name: "prefix",
			type: "STRING",
			required: true
		},
	]
}