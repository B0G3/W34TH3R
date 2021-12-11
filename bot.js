const Discord = require('discord.js');
const botSettings = require('./botSettings.json');
const prefixSchema = require('./models/prefix.js');
const fs = require('fs');

const bot = new Discord.Client({
	intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES],
	allowedMentions: {
		parse: ['users'],
		repliedUser: false,
	},
});

bot.prefix = async (message) => {
	let prefix;

	const data = await prefixSchema.findOne({ guildId: message.guild.id }).catch(err => {
		console.log(err);
	});

	if (data) prefix = data.prefix;
	else prefix = botSettings.prefix;

	return prefix;
};

bot.commands = new Discord.Collection();
bot.aliases = new Discord.Collection();

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		bot.once(event.name, (...args) => event.run(bot, ...args));
	}
	else {
		bot.on(event.name, (...args) => event.run(bot, ...args));
	}
}

bot.login(botSettings.discord_token);