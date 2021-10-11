const Discord = require('discord.js');

async function execFunction(bot, message, args){
    
}

module.exports = {
	run: execFunction,
    name: "postal",
    aliases: ["pt", "kod"],
    description: "Sprawdzenie pogody po kodzie pocztowym oraz kodzie państwa",
    syntax: "<Kod pocztowy> <Kod państwa>",
    categoryId: 1,
}