const countries = require("i18n-iso-countries");
const embedUtil = require("../util/embedUtil.js");
const {iso3166} = require("../countryCodes.json");
const {getPhrase, getCode} = require("../util/languageUtil.js");

const execFunction = async (bot, message, args) => {
	const countryCodes = [...iso3166];
	const maxPerPage = 40;
	const pages = Math.floor(countryCodes.length/maxPerPage) + 1;
	let embedList = [];
	let i = 0;
	let p = 1;
	let description = "";

	while(countryCodes.length>0){
		const chunk = countryCodes.splice(0, maxPerPage);
		description = "";

		for(c of chunk){
			let countryName = countries.getName(c, getCode(message.guild));
			description += `\:flag_${c.toLowerCase()}: ${countryName} (${c}) `;
		}
		embed = embedUtil.countryListEmbed(message, description, p, pages);
		embedList.push(embed);
		p++;
	}

	embedUtil.createPages(message, embedList, 120000);
}

module.exports = {
	run: execFunction,
	name: "countries",
	aliases: ["ct", "c", "iso3166"],
	description: "CMD_COUNTRIES_DESCRIPTION",
	syntax: null,
	categoryId: 0,
}