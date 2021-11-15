const Discord = require('discord.js');
const embedUtil = require("../util/embedUtil.js");
const categories = require("../categories.json");
const {getPhrase} = require("../util/languageUtil.js");

const execFunction = async (bot, message, args) => {
	if(args[0]){
		let cmd = bot.commands.get(args[0]) || bot.commands.get(bot.aliases.get(args[0]));
		if(!cmd){
			message.channel.send(getPhrase(message.guild, "CMD_HELP_ERR1"));
			return;
		}

		let embed = embedUtil.helpEmbed(message, cmd);
		await message.channel.send({embeds: [embed]});

		return;
	}

	let sortedCommands = [];

	for(e in categories){
		sortedCommands[e] = bot.commands.filter(v => v.categoryId == e);
	}

	const helpEmbed = new Discord.MessageEmbed()
	.setColor(`#cb4b16`)
	.setTitle(`**${getPhrase(message.guild, "CMD_HELP_AVAILABLE")}**`)
	
	for(e in categories){
		let sum = '';
		sortedCommands[e].forEach(el => {
			if(!el.hidden){
				let syntax = (el.syntax!=null)?` ${getPhrase(message.guild, el.syntax)}`:'';
				sum = sum + `[${el.name}]${syntax} - ${getPhrase(message.guild, el.description)}\n`
			}
		});
		helpEmbed.addFields(
			{ name: `${categories[e].icon} ${getPhrase(message.guild, categories[e].name)}`, value: "```CSS\n"+sum+"```"}
		)
	}
	message.channel.send({embeds: [helpEmbed]});
}

module.exports = {
	run: execFunction,
	name: "help",
	aliases: ["h"],
	description: "CMD_HELP_DESCRIPTION",
	syntax: "CMD_HELP_SYNTAX",
	categoryId: 0,
	slashOptions: [
		{
			description: "Command to check help for",
			name: "command_name",
			type: "STRING",
			required: false
		},
	]
}