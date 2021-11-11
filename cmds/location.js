const Discord = require('discord.js');
const dataUtil = require("../util/dataUtil.js");
const locationSchema = require("../models/location.js");

const isNumeric = (str) => {
    return /^\d+$/.test(str);
}

const execFunction = async (bot, message, args) => {
    let result;
	if(!args[0]){
        let location = await dataUtil.getUserLocation(message.author.id);
		if(location) message.channel.send({content: `Twoja obecna domyślna lokacja to ${location.name} | \`${location.lon}, ${location.lat}\``});
		else message.channel.send({content: "Nie ustawiłeś domyślnej lokalizacji. Musisz podać conajmniej jeden argument!"});
		return;
	}else{
		// Kiedy podajemy nazwe miejscowosci
		if(!isNumeric(args[0].charAt(0))){
			result = await dataUtil.fetchByCity(args.join(' '));
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

					result = await dataUtil.fetchByZip(zipCode, countryCode);
				}else{
					// Sprawdzenie po koordynatach
					let x = args[0];
					let y = args[1];
					result = await dataUtil.fetchByCoords(x, y);
				}
			}
		}
	}

	if(!result.data || result.data.cod != 200){
		if(result.data) message.channel.send({content: `Wystąpił błąd (kod ${result.data.cod}): \`${result.data.message}\``});
		else message.channel.send({content: `Wystąpił niespodziewany błąd`});
	}else{

        locationSchema.findOne({userId: message.author.id}, async(err, data) => {
            if(err) throw err;
            if(data){
                await locationSchema.findOneAndDelete({userId: message.author.id});
            }
            data = new locationSchema({
                userId: message.author.id,
                name: result.data.name,
                lon: result.data.coord.lon,
                lat: result.data.coord.lat
            })
            data.save();
            message.channel.send(`Ustawiłeś nową domyślną lokację - ${result.data.name} | \`${result.data.coord.lon}, ${result.data.coord.lat}\``);
        })
	}
}

module.exports = {
	run: execFunction,
	name: "location",
	aliases: ["l", "lc"],
	description: "Ustawia domyślną lokację użytkownika lub sprawdza obecną",
	syntax: "!<Lokacja>",
	categoryId: 0,
}