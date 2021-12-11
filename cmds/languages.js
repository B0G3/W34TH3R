const embedUtil = require('../util/embedUtil.js');

const execFunction = async (bot, message) => {
	const embed = await embedUtil.languageListEmbed(message);
	message.channel.send({ embeds: [embed] });
};

module.exports = {
	run: execFunction,
	name: 'languages',
	aliases: ['l', 'lang'],
	description: 'CMD_LANG_DESCRIPTION',
	categoryId: 0,
};