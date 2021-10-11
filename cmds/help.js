const Discord = require('discord.js');
const categories = require("../util/categoryUtil.js").categories;

async function execFunction(bot, message, args){
    var sortedCommands = [];

    for(e in categories){
        sortedCommands[e] = bot.commands.filter(v => v.categoryId == e);
    }

    const helpEmbed = new Discord.MessageEmbed()
    .setColor(`#5865f2`)
    .setTitle(`**Lista dostępnych komend:**`)

    
    for(e in categories){
        var sum = '';
        sortedCommands[e].forEach(el => {
            if(!el.hidden){
                let syntax = (el.syntax!=null)?` ${el.syntax}`:'';
                sum = sum + `[${el.name}]${syntax} - ${el.description}\n`
            }
        });
        helpEmbed.addFields(
            { name: categories[e].name, value: "```CSS\n"+sum+"```"}
        )
    }
    message.channel.send({embeds: [helpEmbed]});
}

module.exports = {
	run: execFunction,
    name: "help",
    aliases: ["h", "pomoc"],
    description: "Sprawdzenie dostępnych komend",
    syntax: null,
    categoryId: 0,
}