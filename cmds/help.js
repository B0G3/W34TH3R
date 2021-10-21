const Discord = require('discord.js');
const embedUtil = require("../util/embedUtil.js");
const {categories} = require("../util/categoryUtil.js");

const execFunction = async (bot, message, args) => {
	if(args[0]){
		let cmd = bot.commands.get(args[0]) || bot.commands.get(bot.aliases.get(args[0]));
		if(!cmd){
			message.channel.send("Nie znaleziono komendy.");
			return;
		}

		let embed = embedUtil.helpEmbed(cmd);
		await message.channel.send({embeds: [embed]});

		return;
	}

	var sortedCommands = [];

	for(e in categories){
		sortedCommands[e] = bot.commands.filter(v => v.categoryId == e);
	}

	const helpEmbed = new Discord.MessageEmbed()
	.setColor(`#cb4b16`)
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
			{ name: `${categories[e].icon} ${categories[e].name}`, value: "```CSS\n"+sum+"```"}
		)
	}
	message.channel.send({embeds: [helpEmbed]});
}

module.exports = {
	run: execFunction,
	name: "help",
	aliases: ["h"],
	description: "Sprawdzenie dostępnych komend / szczegółów poszczególnej komendy",
	syntax: "!<Nazwa komendy>",
	categoryId: 0,
}