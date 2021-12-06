const prefixSchema = require("../models/prefix.js");
const botSettings = require("../botSettings.json");
const {getPhrase} = require("../util/languageUtil.js");

const execFunction = async (bot, message, args) => {
    prefixSchema.findOne({_id: message.guild.id}, async(err, data) => {
        if(err) throw err;
        if(data){
            await prefixSchema.findOneAndDelete({_id: message.guild.id});
            message.channel.send(getPhrase(message.guild, "CMD_RESETPREFIX_SUCCESS"));
        }else{
            message.channel.send(getPhrase(message.guild, "CMD_RESETPREFIX_FAILURE"));
        }
    })
}

module.exports = {
	run: execFunction,
	name: "resetprefix",
	aliases: ["resp", "rp"],
    adminOnly: true,
	description: "CMD_RESETPREFIX_DESCRIPTION",
	syntax: null,
	categoryId: 3,
}