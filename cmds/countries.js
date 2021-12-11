const embedUtil = require('../util/embedUtil.js');
const { iso3166 } = require('../countryCodes.json');

const execFunction = async (bot, message) => {
	const countryCodes = [...iso3166];
	const maxPerPage = 42;
	const embedList = [];

	while (countryCodes.length > 0) {
		const chunk = countryCodes.splice(0, maxPerPage);

		const embed = embedUtil.countryListEmbed(message, chunk);
		embedList.push(embed);
	}

	embedUtil.createPages(message, embedList, 120000);
};

module.exports = {
	run: execFunction,
	name: 'countries',
	aliases: ['ct', 'c', 'iso3166'],
	description: 'CMD_COUNTRIES_DESCRIPTION',
	syntax: null,
	categoryId: 0,
};