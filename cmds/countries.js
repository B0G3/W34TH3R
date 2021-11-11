const Discord = require('discord.js');
const countries = require("i18n-iso-countries");
const embedUtil = require("../util/embedUtil.js");
const {iso3166} = require("../util/countryCodes.js");

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
			let countryName = countries.getName(c, "pl");
			description += `\:flag_${c.toLowerCase()}: ${countryName} (${c}) `;
		}
		embed = embedUtil.countryListEmbed(message.author, description, p, pages);
		embedList.push(embed);
		p++;
	}

	embedUtil.createPages(message, embedList, 120000);
}

module.exports = {
	run: execFunction,
	name: "countries",
	aliases: ["ct", "c", "iso3166"],
	description: "Listuje dostępne kody krajów (Standard iso3166)",
	syntax: null,
	categoryId: 0,
}