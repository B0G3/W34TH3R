const dataUtil = require("../util/dataUtil.js");
const locationSchema = require("../models/location.js");
const {getPhrase, getCode} = require("../util/languageUtil.js");
const {iso3166} = require("../countryCodes.json");

const execFunction = async (bot, message, args) => {
    let result;
	if(!args[0]){
        let location = await dataUtil.getUserLocation(message.author.id);
		if(location) message.channel.send({content: `${getPhrase(message.guild, "CMD_LOCATION_RESPONSE_1")} ${location.name} | \`${location.lat}, ${location.lon}\``});
		else message.channel.send({content: getPhrase(message.guild, "CMD_LOCATION_ERROR_1")});
		return;
	}else{
		// Kiedy podajemy nazwe miejscowosci
		if(isNaN(args[0])){
			result = await dataUtil.fetchByCity(args.join(' '), getCode(message.guild));
		}else{
			// W przeciwnym przypadku musza byc dwa argumenty
			if(!args[1]){
				message.channel.send({content: getPhrase(message.guild, "CMD_LOCATION_ERROR_2")});
				return;
			}else{
				if(isNaN(args[1])){
					// Sprawdzenie po kodzie pocztowym
					let zipCode = args[0];
					let countryCode = args[1].toUpperCase();

					if(!iso3166.includes(countryCode)){
						message.channel.send({content: getPhrase(message.guild, "CMD_LOCATION_ERROR_3")});
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
		await locationSchema.findOneAndUpdate({
			_id: message.author.id
		}, {
			_id: message.author.id,
			name: result.data.name,
			lon: result.data.coord.lon,
			lat: result.data.coord.lat
		}, {
			upsert: true
		});
		message.channel.send(`${getPhrase(message.guild, "CMD_LOCATION_SUCCESS")} - ${result.data.name} | \`${result.data.coord.lat}, ${result.data.coord.lon}\``);
	
	}
}

module.exports = {
	run: execFunction,
	name: "location",
	aliases: ["l", "lc"],
	description: "CMD_LOCATION_DESCRIPTION",
	syntax: "CMD_LOCATION_SYNTAX",
	categoryId: 0,
	slashOptions: [
		{
			description: "Set location by city",
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
			description: "Set location by coords",
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
			description: "Set location by zip code and country code",
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