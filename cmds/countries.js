const Discord = require('discord.js');
const iso3166 = require("../util/countryCodes.js").iso3166;
const embedUtil = require("../util/embedUtil.js");

 function execFunction(bot, message, args){
 	var countryCodes = [...iso3166];
    var embedList = [];
    var maxPerPage = 40;
    var pages = Math.floor(countryCodes.length/maxPerPage) + 1;
    var i = 0;
    var p = 1;
    var description = "";

    while(countryCodes.length>0){
    	const chunk = countryCodes.splice(0, maxPerPage);
    	var description = "";

    	for(c of chunk){
    		description += `\:flag_${c.toLowerCase()}: ${c}   `;

    	}
    	embed = embedUtil.countryListEmbed(message.author, description, p, pages);
    	embedList.push(embed);
    	p++;
    }

    embedUtil.createPages(bot, message, embedList, 120000);
}

module.exports = {
	run: execFunction,
    name: "countries",
    aliases: ["kraje", "kr", "iso3166"],
    description: "Listuje dostępne kody krajów (Standard iso3166)",
    syntax: null,
    categoryId: 0,
}