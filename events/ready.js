const botSettings = require('../botSettings.json');
const { getEnglishPhrase, loadLanguages } = require('../util/languageUtil.js');
const mongoose = require('mongoose');
const fs = require('fs');

const loadCommands = async (bot, guild = null) => {
	let slashCommands;
	if (guild) {
		slashCommands = guild.commands;
	}
	else {
		slashCommands = bot.application?.commands;
	}
	fs.readdir('./cmds/', (err, files) => {
		if (err) {console.error(err);}

		const jsfiles = files.filter(f => f.split('.').pop() === 'js');
		if (jsfiles.length <= 0) {
			console.log('No commands to load!');
			return;
		}
		console.log('Loading commands:');
		jsfiles.forEach((f) => {
			const props = require(`../cmds/${f}`);

			try {
				console.log(`- ${f} loaded!`);
				bot.commands.set(props.name, props);

				slashCommands?.create({
					name: props.name,
					description: getEnglishPhrase(props.description),
					options: props.slashOptions ? props.slashOptions : null,
				});

				props.aliases.forEach(alias => {
					bot.aliases.set(alias, props.name);
				});
			}
			catch (err) {
				return console.log(err);
			}
		});
	});
};

const loadDatabase = async () => {
	await mongoose.connect(botSettings.mongodb_srv).then(() => {
		console.log('Connected to database!');
	}).catch((err) => {
		console.log(err);
		process.exit(1);
	});
};

module.exports = {
	name: 'ready',
	once: true,
	async run(bot) {
		const guildId = botSettings.guild;
		const guild = bot.guilds.cache.get(guildId);

		await loadDatabase();
		await loadLanguages(bot);
		await loadCommands(bot, guild);
	},
};