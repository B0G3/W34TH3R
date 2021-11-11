const Discord = require('discord.js');
const prefixSchema = require("../models/prefix.js");
const botSettings = require("../botSettings.json");

const execFunction = async (bot, message, args) => {
    prefixSchema.findOne({guildId: message.guild.id}, async(err, data) => {
        if(err) throw err;
        if(data){
            await prefixSchema.findOneAndDelete({guildId: message.guild.id});
            message.channel.send(`Zresetowano prefix! **(${botSettings.prefix})**`);
        }else{
            message.channel.send(`Domyślny prefix jest już ustawiony!`);
        }
    })
}

module.exports = {
	run: execFunction,
	name: "resetprefix",
	aliases: ["resp", "rp"],
    adminOnly: true,
	description: "Resetuje własny prefix dla serwera",
	syntax: null,
	categoryId: 3,
}