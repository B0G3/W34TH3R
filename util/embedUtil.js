const Discord = require('discord.js');
const countries = require("i18n-iso-countries");
const dataUtil = require("../util/dataUtil.js");
const {categories} = require("../util/categoryUtil.js");

const capitalize = (s) => (s && s[0].toUpperCase() + s.slice(1)) || ""

const parseDate = (input) => {
	const parts = input.match(/(\d+)/g);
	return {
		year: parts[0],
		month: parts[1],
		day: parts[2],
		hour: parts[3], 
		minute: parts[4]
	};
}

const calcAverage = (array) => {
    let sum = 0;
    for(e in array){
        sum += array[e];
    }
    return sum/array.length;
}

module.exports = {
    createPages: async (message, pages, timeout) => {
        const pageAmount = pages.length;
        const forwardButton = new Discord.MessageButton()
        .setCustomId(`frwd_btn`)
        .setLabel("")
        .setEmoji("⏩")
        .setStyle("PRIMARY")

        const backwardButton = new Discord.MessageButton()
        .setCustomId(`bcwd_btn_embed`)
        .setLabel("")
        .setEmoji("⏪")
        .setStyle("PRIMARY")

        const abandonButton = new Discord.MessageButton()
        .setCustomId(`ab_btn_embed`)
        .setLabel("ZAKOŃCZ")
        .setStyle("SUCCESS")

        const pageMovingButtons = new Discord.MessageActionRow()
        .addComponents(backwardButton)
        .addComponents(forwardButton)
        .addComponents(abandonButton)
        let currentPage = 0;
        let m = await message.channel.send({content: 'Proszę czekać...'});
        m.edit({content: `Strona \`[${currentPage+1}/${pageAmount}]\``, embeds: [pages[currentPage]], components: [pageMovingButtons]});

        const filter = i => (i.customId == 'frwd_btn' || i.customId == 'bcwd_btn_embed' || i.customId == 'ab_btn_embed');
        
        const collector = m.createMessageComponentCollector({ componentType: 'BUTTON', filter, time: timeout });

        collector.on('collect', async i => {
            if (i.user.id != message.author.id) {
                i.reply({ content: `Nie możesz tego użyć!`, ephemeral: true });
                return;
            }

            if(i.customId == "bcwd_btn_embed"){
                if(currentPage - 1 < 0){
                    currentPage = pages.length - 1
                } else{
                    currentPage -= 1;
                }
            } else if(i.customId == "frwd_btn"){
                if(currentPage + 1 == pages.length){
                    currentPage = 0;
                } else{
                    currentPage += 1;
                }
            }

            if((i.customId == "bcwd_btn_embed" || i.customId == "frwd_btn")){
                await i.deferUpdate();
                await i.editReply({content: `Strona \`[${currentPage+1}/${pageAmount}]\``, embeds: [pages[currentPage]], components: [pageMovingButtons]});
            }else{
                collector.stop();
            }
        });

        collector.on('end', collected => {
            m.edit({components: []});
        });

    },
    helpEmbed: (cmd) => {
        let description = `**Kategoria**: ${categories[cmd.categoryId].name}\n`;
        description += cmd.syntax?(`**Syntax**: ${cmd.syntax}\n`):'';
        description += `**Aliasy**: ${cmd.aliases.join(', ')}\n`;
        description += cmd.longDescription?cmd.longDescription:cmd.description;

        const embed = new Discord.MessageEmbed()
        .setColor('#cb4b16')
        .setTitle(`${categories[cmd.categoryId].icon} | Komenda \`${cmd.name}\``)
        .setDescription(description);
        return embed;
    },
    countryListEmbed: (author, description) => {
        const embed = new Discord.MessageEmbed()
        .setColor('#3ba55d')
        .setTitle(`Dostępne kraje | ISO3166`)
        .setTimestamp()
        .setFooter(`Wywołane przez ${author.username}`)
        .setDescription(description);
        return embed;
    },
    weatherEmbed: async (data, _countryData = null) => {
        let countryInfo = '';
        let countryCode = (_countryData!=null)?_countryData.country:data.sys.country;
        if(countryCode) countryInfo = ", " + countries.getName(countryCode, "pl", {select: "official"}) + `, ${countryCode} \:flag_${countryCode.toLowerCase()}:`;

        const embed = new Discord.MessageEmbed()
        .setColor('#5865f2')
        .setAuthor(capitalize(data.weather[0].description), `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`)
        .setDescription((_countryData!=null)?_countryData.name:data.name + countryInfo)
        .addField(`Temperatura:`, `${data.main.temp}\u00B0 C`, true)
        .addField(`Temp max:`, `${data.main.temp_max}\u00B0 C`, true)
        .addField(`Temp min:`, `${data.main.temp_min}\u00B0 C`, true)
        .addField(`Wilgotność:`, `${data.main.humidity} %`, true)
        .addField(`Wiatr:`, `${data.wind.speed} m/s`, true)
        .addField(`Ciśnienie:`, `${data.main.pressure} hpa`, true)
        return embed;
    },
    forecastPageEmbed: async (dayData, cityData) => {
        const tempChart = await dataUtil.fetchForecastChart(dayData);
        const tempArr = dayData.map(e => e.main.temp);
        const humidityArr = dayData.map(e => e.main.humidity);

        const avgTemp = calcAverage(tempArr);
        const avgHumidity = calcAverage(humidityArr);

        const countryCode = cityData.country;
        const cityName = cityData.name;
        const dateString = dayData[0].dt_txt + ' \+ 24h';

        const embed = new Discord.MessageEmbed()
        .setColor('#5865f2')
        .setTitle('Prognoza pogody'+ (countryCode?(` | ${cityName}, ${countries.getName(countryCode, 'pl', {select: "official"})}, ${countryCode}`):''))
        .setThumbnail(`http://openweathermap.org/img/wn/${dayData[0].weather[0].icon}.png`)
        .addField(`Śr. temp:`, `${Math.round(avgTemp, 2)}\u00B0 C`, true)
        .addField(`Śr. wilg:`, `${Math.round(avgHumidity, 2)} %`, true)
        .addField(`Ciśnienie:`, `${dayData[0].main.pressure} hPa`, true)
        .setDescription(`**Data:** \`\`${dateString}\`\``)
        .setImage(tempChart)
        return embed;
    }
}