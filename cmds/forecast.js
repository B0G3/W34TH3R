const Discord = require('discord.js');
const dataUtil = require("../util/dataUtil.js");
const embedUtil = require("../util/embedUtil.js");
const {iso3166} = require("../util/countryCodes.js");
const fs = require('fs');

const isNumeric = (str) => {
    return /^\d+$/.test(str);
}

const execFunction = async (bot, message, args) => {
	let result;
	if(!args[0]){
		let location = await dataUtil.getUserLocation(message.author.id);
		if(!location) message.channel.send({content: "Musisz podać conajmniej jeden argument lub ustawić domyślną lokację!"});
		else{
			let _args = [location.lat, location.lon];
			execFunction(bot, message, _args);
		}
		return;
	}else{
		// Kiedy podajemy nazwe miejscowosci
		if(!isNumeric(args[0].charAt(0))){
			result = await dataUtil.fetchForecastByCity(args.join(' '));
		}else{
			// W przeciwnym przypadku musza byc dwa argumenty
			if(!args[1]){
				message.channel.send({content: "Musisz podać conajmniej dwa argumenty!"});
				return;
			}else{
				if(!isNumeric(args[1].charAt(0))){
					// Sprawdzenie po kodzie pocztowym
					let zipCode = args[0];
					let countryCode = args[1];

					if(!iso3166.includes(countryCode)){
						message.channel.send({content: "Błędny kod państwa! Dostępne kody sprawdzisz komendą `countries`!"});
						return;
					}

					result = await dataUtil.fetchForecastByZip(zipCode, countryCode);
				}else{
					// Sprawdzenie po koordynatach
					let x = args[0];
					let y = args[1];
					result = await dataUtil.fetchForecastByCoords(x, y);
				}
			}
		}
	}
	
	let embeds = [];
	if(!result.data || result.data.cod != 200){
		if(result.data) message.channel.send({content: `Wystąpił błąd (kod ${result.data.cod}): \`${result.data.message}\``});
		else message.channel.send({content: `Wystąpił niespodziewany błąd`});
	}else{
		const cityInfo = result.data.city;
		
		let dailyForecast = await dataUtil.fetchForecastByCoords(cityInfo.coord.lat, cityInfo.coord.lon, true);
		if(!dailyForecast.data){
			message.channel.send({content: `Wystąpił niespodziewany błąd`});
			return;
		}

		let frontEmbed = await embedUtil.forecastFrontEmbed(dailyForecast.data.daily, cityInfo);
		embeds.push(frontEmbed);

		while(result.data.list.length>0){
			let day = result.data.list.splice(0, 8);
			let embed = await embedUtil.forecastPageEmbed(day, cityInfo);
			embeds.push(embed);
		}
		embedUtil.createPages(message, embeds, 120000);
	}
	
}

module.exports = {
	run: execFunction,
	name: "forecast",
	aliases: ["fc", "f"],
	description: "Sprawdzenie prognozy pogody (najbliższe 5 dni) zależnie od miasta / koordynatów / kodu pocztowego oraz kodu państwa",
	longDescription: `Sprawdza prognozę pogody (najbliższe 5 dni) zależnie od podanych danych. Danymi mogą być: \`miejscowość\`, \`koordynaty x i y\`, \`kod pocztowy i kod państwa\` lub domyślna lokacja użytkownika.\nPrzykłady użycia:\n\`forecast toruń\`\n\`forecast 53.0 18.6\`\n\`forecast 87-100 PL\`\n\`forecast\``,
	syntax: "<Dane>",
	categoryId: 1,
}