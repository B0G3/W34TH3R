const parseSlashArguments = (data, argArray) => {
	data.forEach(e => {
		if (e.value) {argArray.push(e.value.toString());}
		else {
			if (e.options) parseSlashArguments(e.options, argArray);
		}
	});
};

module.exports = {
	name: 'interactionCreate',
	async run(bot, interaction) {
		if (!interaction.isCommand()) return;

		const { commandName, options } = interaction;

		const cmd = bot.commands.get(commandName);
		if (!cmd) return;

		const args = [];
		parseSlashArguments(options.data, args);

		const message = interaction;
		message.author = interaction.user;

		const prefix = await bot.prefix(message);
		interaction.reply({ content: `${prefix}${commandName} ${args.join(' ')}` });
		cmd.run(bot, message, args);
	},
};