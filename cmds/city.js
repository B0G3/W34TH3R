const Discord = require('discord.js');
const dataUtil = require("../util/dataUtil.js");
const embedUtil = require("../util/embedUtil.js");

async function execFunction(bot, message, args){
	if(!args[0]){
		message.channel.send({content: "Musisz podać nazwę miasta!"});
		return;
	}


    let result = await dataUtil.fetchByCity(args.join(' '));
    
    if(result.status != 200){
    	message.channel.send({content: `Wystapil błąd (${result.status}) podczas pobierania danych`});
    }else{
    	let embed = embedUtil.weatherEmbed(result.data);
    	await message.channel.send({embeds: [embed]});
    }
}

module.exports = {
	run: execFunction,
    name: "city",
    aliases: ["ct", "miasto"],
    description: "Sprawdzenie pogody w danym mieście",
    syntax: "<Nazwa miasta>",
    categoryId: 1,
}