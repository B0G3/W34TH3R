const {languages} = require('../lang.json');
const languageSchema = require("../models/language.js");
const {setLanguage,getPhrase} = require('../util/languageUtil.js')


const execFunction = async (bot, message, args) => {
	if(!args[0]){
        message.channel.send(getPhrase(message.guild, "CMD_SETLANG_ERROR_1"));
        return;
	}
	const { guild } = message;
	const targetLang = args[0].toLowerCase();
	if (!languages.includes(targetLang)){
		message.channel.send({content: getPhrase(message.guild, "CMD_SETLANG_ERROR_2")});
		return
	}

	setLanguage(guild, targetLang);

	await languageSchema.findOneAndUpdate({
		_id: guild.id
	}, {
		_id: guild.id,
		language: targetLang
	}, {
		upsert: true
	});

	message.channel.send(`${getPhrase(message.guild, "CMD_SETLANG_SUCCESS")} **(${targetLang})**`);

}

module.exports = {
	run: execFunction,
	name: "setlang",
	aliases: ["setl", "sl"],
    adminOnly: true,
	description: "CMD_SETLANG_DESCRIPTION",
	syntax: "CMD_SETLANG_SYNTAX",
	categoryId: 3,
	slashOptions: [
		{
			description: "Language to set",
			name: "language",
			type: "STRING",
			required: true
		},
	]
}