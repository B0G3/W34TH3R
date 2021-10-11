const Discord = require('discord.js');

async function execFunction(bot, message, args){
    
}

module.exports = {
	run: execFunction,
    name: "coords",
    aliases: ["latitude", "longitude", "lt", "koordynaty", "koordy"],
    description: "Sprawdzenie pogody na danej szerokości oraz długości geograficznej",
    syntax: "<X> <Y>",
    categoryId: 1,
}