const Discord = require('discord.js');
const prefixSchema = require("../models/prefix.js");

const execFunction = (bot, message, args) => {
    if(!args[0]){
        message.channel.send("Musisz podać prefix!");
        return;
    }else{
        if(args[0].length>5){
            message.channel.send("Długość prefixu nie może przekraczać 5 znaków!");
            return;
        }
    }
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
        message.channel.send(`Ustawiono nowy prefix! **(${args[0]})**`);
    })
}

module.exports = {
	run: execFunction,
	name: "setprefix",
	aliases: ["setp", "sp"],
    adminOnly: true,
	description: "Ustawia własny prefix bota dla danego serwera",
	syntax: "<Prefix>",
	categoryId: 3,
}