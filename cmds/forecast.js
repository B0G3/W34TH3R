const Discord = require("discord.js");
const dataUtil = require("../util/dataUtil.js");
const embedUtil = require("../util/embedUtil.js");
const {iso3166} = require("../countryCodes.json");
const {getPhrase, getCode} = require("../util/languageUtil.js");

const execFunction = async (bot, message, args) => {
	let result;
	if(!args[0]){
		let location = await dataUtil.getUserLocation(message.author.id);
		if(!location) message.channel.send({content: getPhrase(message.guild, "CMD_FORECAST_ERROR_1")});
		else{
			let _args = [location.lat, location.lon];
			execFunction(bot, message, _args);
		}
		return;
	}else{
		// Kiedy podajemy nazwe miejscowosci
		if(isNaN(args[0])){
			result = await dataUtil.fetchForecastByCity(args.join(' '), getCode(message.guild));
		}else{
			// W przeciwnym przypadku musza byc dwa argumenty
			if(!args[1]){
				message.channel.send({content: getPhrase(message.guild, "CMD_FORECAST_ERROR_2")});
				return;
			}else{
				if(isNaN(args[1])){
					// Sprawdzenie po kodzie pocztowym
					let zipCode = args[0];
					let countryCode = args[1].toUpperCase();

					if(!iso3166.includes(countryCode)){
						message.channel.send({content: getPhrase(message.guild, "CMD_FORECAST_ERROR_3")});
						return;
					}

					result = await dataUtil.fetchForecastByZip(zipCode, countryCode, getCode(message.guild));
				}else{
					// Sprawdzenie po koordynatach
					let x = args[0];
					let y = args[1];
					result = await dataUtil.fetchForecastByCoords(x, y, false, getCode(message.guild));
				}
			}
		}
	}
	
	let embeds = [];
	if(!result.data || result.data.cod != 200){
		if(result.data) message.channel.send({content: `${getPhrase(message.guild, "ERR_PHRASE_1")} ${result.data.cod}): \`${result.data.message}\``});
		else message.channel.send({content: getPhrase(message.guild, "ERR_UNEXPECTED")});
	}else{
		const cityInfo = result.data.city;
		
		const dailyForecast = await dataUtil.fetchForecastByCoords(cityInfo.coord.lat, cityInfo.coord.lon, true, getCode(message.guild));
		if(!dailyForecast.data){
			message.channel.send({content: getPhrase(message.guild, "ERR_UNEXPECTED")});
			return;
		}

		const frontEmbed = await embedUtil.forecastFrontEmbed(message, dailyForecast.data.daily, cityInfo);
		embeds.push(frontEmbed);

		while(result.data.list.length>0){
			let day = result.data.list.splice(0, 8);
			const embed = await embedUtil.forecastPageEmbed(message, day, cityInfo);
			embeds.push(embed);
		}
		embedUtil.createPages(message, embeds, 120000);
	}
	
}

module.exports = {
	run: execFunction,
	name: "forecast",
	aliases: ["fc", "f"],
	description: "CMD_FORECAST_DESCRIPTION",
	longDescription: "CMD_FORECAST_DESCRIPTION_LONG",
	syntax: "CMD_FORECAST_SYNTAX",
	categoryId: 1,
	slashOptions: [
	{
		description: "Search by default location",
		name: "default",
		type: "SUB_COMMAND"
	},
	{
		description: "Search by city",
		name: "city",
		type: "SUB_COMMAND",
		options: [{
			description: "city name",
			name: "city_name",
			type: "STRING",
			required: true,
		}]
	},
	{
		description: "Search by coords",
		name: "coords",
		type: "SUB_COMMAND",
		options: [{
			description: "x coordinate",
			name: "x_coord",
			type: "INTEGER",
			required: true,
		},
		{
			description: "y coordinate",
			name: "y_coord",
			type: "INTEGER",
			required: true,
		}]
	},
	{
		description: "Search by zip code and country code",
		name: "zip",
		type: "SUB_COMMAND",
		options: [{
			description: "zip code",
			name: "zip_code",
			type: "INTEGER",
			required: true,
		},
		{
			description: "country code",
			name: "country_code",
			type: "STRING",
			required: true,
		}]
	}
	]
}