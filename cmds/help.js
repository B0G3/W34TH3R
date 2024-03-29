const Discord = require('discord.js');
const embedUtil = require('../util/embedUtil.js');
const categories = require('../categories.json');
const { getPhrase } = require('../util/languageUtil.js');

const execFunction = async (bot, message, args) => {
	if (args[0]) {
		const cmd = bot.commands.get(args[0]) || bot.commands.get(bot.aliases.get(args[0]));
		if (!cmd) {
			message.channel.send(getPhrase(message.guild, 'CMD_HELP_ERR1'));
			return;
		}

		const embed = embedUtil.helpEmbed(message, cmd);
		await message.channel.send({ embeds: [embed] });

		return;
	}

	const sortedCommands = [];

	for (const e in categories) {
		sortedCommands[e] = bot.commands.filter(v => v.categoryId == e);
	}

	const helpEmbed = new Discord.MessageEmbed()
		.setColor('#5865f2')
		.setTitle(`**${getPhrase(message.guild, 'CMD_HELP_AVAILABLE')}**`);
	for (const e in categories) {
		let sum = '';
		sortedCommands[e].forEach(el => {
			if (!el.hidden) {
				const syntax = (el.syntax != null) ? ` ${getPhrase(message.guild, el.syntax)}` : '';
				sum = sum + `${el.adminOnly ? ('[A]') : ('')}[${el.name}]${syntax} - ${getPhrase(message.guild, el.description)}\n`;
			}
		});
		helpEmbed.addFields(
			{ name: `${categories[e].icon} ${getPhrase(message.guild, categories[e].name)}`, value: '```CSS\n' + sum + '```' },
		);
	}
	helpEmbed.setDescription(`**[A]** - ${getPhrase(message.guild, 'CMD_HELP_ADMINONLY')}\n**!** - ${getPhrase(message.guild, 'CMD_HELP_OPTIONAL')}`);
	message.channel.send({ embeds: [helpEmbed] });
};

module.exports = {
	run: execFunction,
	name: 'help',
	aliases: ['h'],
	description: 'CMD_HELP_DESCRIPTION',
	syntax: 'CMD_HELP_SYNTAX',
	categoryId: 0,
	slashOptions: [
		{
			description: 'Command to check help for',
			name: 'command_name',
			type: 'STRING',
			required: false,
		},
	],
};