const Discord = require('discord.js');
const dataUtil = require("../util/dataUtil.js");
const embedUtil = require("../util/embedUtil.js");
const {iso3166} = require("../countryCodes.json");
const {getPhrase, getCode} = require("../util/languageUtil.js");

const isNumeric = (str) => {
    return /^\d+$/.test(str);
}

const execFunction = async (bot, message, args) => {
	let result;
	if(!args[0]){
		let location = await dataUtil.getUserLocation(message.author.id);
		if(!location) message.channel.send({content: getPhrase(message.guild, "CMD_WEATHER_ERROR_1")});
		else{
			let _args = [location.lat, location.lon];
			execFunction(bot, message, _args);
		}
		return;
	}else{
		// Kiedy podajemy nazwe miejscowosci
		if(!isNumeric(args[0].charAt(0))){
			result = await dataUtil.fetchByCity(args.join(' '), getCode(message.guild));
		}else{
			// W przeciwnym przypadku musza byc dwa argumenty
			if(!args[1]){
				message.channel.send({content: getPhrase(message.guild, "CMD_WEATHER_ERROR_2")});
				return;
			}else{
				if(!isNumeric(args[1].charAt(0))){
					// Sprawdzenie po kodzie pocztowym
					let zipCode = args[0];
					let countryCode = args[1].toUpperCase();

					if(!iso3166.includes(countryCode)){
						message.channel.send({content: getPhrase(message.guild, "CMD_WEATHER_ERROR_3")});
						return;
					}

					result = await dataUtil.fetchByZip(zipCode, countryCode, getCode(message.guild));
				}else{
					// Sprawdzenie po koordynatach
					let x = args[0];
					let y = args[1];
					result = await dataUtil.fetchByCoords(x, y, getCode(message.guild));
				}
			}
		}
	}
	
	if(!result.data || result.data.cod != 200){
		if(result.data) message.channel.send({content: `${getPhrase(message.guild, "ERR_PHRASE_1")} ${result.data.cod}): \`${result.data.message}\``});
		else message.channel.send({content: getPhrase(message.guild, "ERR_UNEXPECTED")});
	}else{
		let embed = await embedUtil.weatherEmbed(message, result.data);
		await message.channel.send({embeds: [embed]});
	}
}

module.exports = {
	run: execFunction,
	name: "weather",
	aliases: ["wt", "w"],
	description: "CMD_WEATHER_DESCRIPTION",
	longDescription: "CMD_WEATHER_DESCRIPTION_LONG",
	syntax: "CMD_WEATHER_SYNTAX",
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