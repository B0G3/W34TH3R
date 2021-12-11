const statSchema = require('../models/stat.js');
const languageUtil = require('../util/languageUtil.js');

const updateStat = async (guild, user, cmd) => {
	await statSchema.findOneAndUpdate({
		cmdName: cmd.name,
		guildId: guild.id,
		userId: user.id,
	}, {
		$inc: { usages: 1 },
	}, {
		upsert: true,
	});
};

module.exports = {
	name: 'messageCreate',
	async run(bot, message) {
		if (message.author.bot) return;
		if (message.channel.type === 'dm') return;

		const messageArray = message.content.toLowerCase().split(' ');
		const command = messageArray[0];

		const prefix = await bot.prefix(message);

		if (!command.startsWith(prefix)) return;
		const args = messageArray.slice(1);
		const cmdStr = command.slice(prefix.length);
		const cmd = bot.commands.get(cmdStr) || bot.commands.get(bot.aliases.get(cmdStr));

		if (cmd) {
			if (!cmd.adminOnly) {
				cmd.run(bot, message, args);
				updateStat(message.guild, message.author, cmd);
			}
			else {
				if (message.member.permissions.has('ADMINISTRATOR')) {
					cmd.run(bot, message, args);
					updateStat(message.guild, message.author, cmd);
				}
				else {message.channel.send({ content: languageUtil.getPhrase(message.guild, 'ERR_CMD_NOPERM') });}
			}
		}
		else {
			message.channel.send({ content: languageUtil.getPhrase(message.guild, 'ERR_CMD_NOTFOUND') });
		}
	},
};