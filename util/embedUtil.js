const Discord = require("discord.js");
const countries = require("i18n-iso-countries");
const dataUtil = require("../util/dataUtil.js");
const categories = require("../categories.json");
const {getPhrase, getCode} = require("../util/languageUtil.js");

const capitalize = (s) => (s && s[0].toUpperCase() + s.slice(1)) || ""

parseDate = (input) => {
	let parts = input.match(/(\d+)/g);
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
        .setLabel(getPhrase(message.guild, "EMBED_PAGE_BTN_END"))
        .setStyle("SUCCESS")

        const pageMovingButtons = new Discord.MessageActionRow()
        .addComponents(backwardButton)
        .addComponents(forwardButton)
        .addComponents(abandonButton)
        let currentPage = 0;
        let m = await message.channel.send({content: getPhrase(message.guild, "EMBED_PAGE_WAIT")});
        m.edit({content: `Strona \`[${currentPage+1}/${pageAmount}]\``, embeds: [pages[currentPage]], components: [pageMovingButtons]});

        const filter = i => (i.customId == 'frwd_btn' || i.customId == 'bcwd_btn_embed' || i.customId == 'ab_btn_embed');
        
        const collector = m.createMessageComponentCollector({ componentType: 'BUTTON', filter, time: timeout });

        collector.on('collect', async i => {
            if (i.user.id != message.author.id) {
                i.reply({ content: getPhrase(message.guild, "EMBED_PAGE_ERROR_1"), ephemeral: true });
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
                await i.editReply({content: `${getPhrase(message.guild, "EMBED_PAGE_PAGE")} \`[${currentPage+1}/${pageAmount}]\``, embeds: [pages[currentPage]], components: [pageMovingButtons]});
            }else{
                collector.stop();
            }
        });

        collector.on('end', collected => {
            m.edit({components: []});
        });

    },
    helpEmbed: (message, cmd) => {
        let description = `**${getPhrase(message.guild, "EMBED_HELP_CATEGORY")}**: ${getPhrase(message.guild, categories[cmd.categoryId].name)}\n`;
        description += cmd.syntax?(`**${getPhrase(message.guild, "EMBED_HELP_SYNTAX")}**: ${getPhrase(message.guild, cmd.syntax)}\n`):'';
        description += `**${getPhrase(message.guild, "EMBED_HELP_ALIASES")}**: ${cmd.aliases.join(', ')}\n`;
        description += getPhrase(message.guild, cmd.longDescription?cmd.longDescription:cmd.description);

        const embed = new Discord.MessageEmbed()
        .setColor('#cb4b16')
        .setTitle(`${categories[cmd.categoryId].icon} | ${getPhrase(message.guild, "EMBED_HELP_COMMAND")} \`${cmd.name}\``)
        .setDescription(description);
        return embed;
    },
    countryListEmbed: (message, description) => {
        const embed = new Discord.MessageEmbed()
        .setColor('#3ba55d')
        .setTitle(`${getPhrase(message.guild, "EMBED_COUNTRYLIST_COUNTRIES")} | ISO3166`)
        .setTimestamp()
        .setFooter(`${getPhrase(message.guild, "EMBED_COUNTRYLIST_CALLER")} ${message.author.username}`)
        .setDescription(description);
        return embed;
    },
    weatherEmbed: async (message, data, _countryData = null) => {
        let countryInfo = '';
        let countryCode = (_countryData!=null)?_countryData.country:data.sys.country;
        if(countryCode) countryInfo = ", " + countries.getName(countryCode, getCode(message.guild), {select: "official"}) + `, ${countryCode} \:flag_${countryCode.toLowerCase()}:`;

        const embed = new Discord.MessageEmbed()
        .setColor('#5865f2')
        .setAuthor(capitalize(data.weather[0].description), `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`)
        .setDescription((_countryData!=null)?_countryData.name:data.name + countryInfo)
        .addField(`${getPhrase(message.guild, "EMBED_WEATHER_TEMPERATURE")}:`, `${data.main.temp}\u00B0 C`, true)
        .addField(`${getPhrase(message.guild, "EMBED_WEATHER_TEMP_MAX")}:`, `${data.main.temp_max}\u00B0 C`, true)
        .addField(`${getPhrase(message.guild, "EMBED_WEATHER_TEMP_MIN")}:`, `${data.main.temp_min}\u00B0 C`, true)
        .addField(`${getPhrase(message.guild, "EMBED_WEATHER_HUMIDITY")}:`, `${data.main.humidity} %`, true)
        .addField(`${getPhrase(message.guild, "EMBED_WEATHER_WIND")}:`, `${data.wind.speed} m/s`, true)
        .addField(`${getPhrase(message.guild, "EMBED_WEATHER_PRESSURE")}:`, `${data.main.pressure} hpa`, true)
        return embed;
    },
    forecastFrontEmbed: async (message, daysInfo, cityData) => {
        const dayNames = ['DAY_SHORT_SUNDAY', 'DAY_SHORT_MONDAY', 'DAY_SHORT_TUESDAY', 'DAY_SHORT_WEDNESDAY', 'DAY_SHORT_THURSDAY', 'DAY_SHORT_FRIDAY', 'DAY_SHORT_SATURDAY'];
        let dayDescription = '';
        let tempDescription = '';
        let overallDescription = '';
        for(i in daysInfo){
            let day = daysInfo[i];
            let date = new Date(day.dt * 1000);
            let dayName = getPhrase(message.guild, dayNames[date.getDay()]) + ".";
            //console.log(date);
            dayDescription += `${date.getMonth()}-${date.getDate()} ${dayName}\n`
            tempDescription += `${Math.round(day.temp.min,1)} ${getPhrase(message.guild, "EMBED_FORECASTFRONT_TO")} ${Math.round(day.temp.max,1)}\u00B0 C\n`
            overallDescription += `${day.weather[0].description}\n`
        }


        const countryCode = cityData.country;
        const cityName = cityData.name;
        const embed = new Discord.MessageEmbed()
        .setColor('#5865f2')
        .setTitle(`${getPhrase(message.guild, "EMBED_FORECASTFRONT_OVERALL_1")} | ${cityName}, ${countryCode}`)
        .addField(`${getPhrase(message.guild, "EMBED_FORECASTFRONT_DAY")}`, dayDescription, true)
        .addField(`${getPhrase(message.guild, "EMBED_FORECASTFRONT_TEMP")}`, tempDescription, true)
        .addField(`${getPhrase(message.guild, "EMBED_FORECASTFRONT_OVERALL_2")}`, overallDescription, true)
        .setDescription('')
        return embed;
    },
    forecastPageEmbed: async (message, dayInfo, cityData) => {
        const dayNames = ['DAY_SUNDAY', 'DAY_MONDAY', 'DAY_TUESDAY', 'DAY_WEDNESDAY', 'DAY_THURSDAY', 'DAY_FRIDAY', 'DAY_SATURDAY'];
        const tempChart = await dataUtil.fetchForecastChart(message, dayInfo);
        const tempArr = dayInfo.map(e => e.main.temp);
        const humidityArr = dayInfo.map(e => e.main.humidity);

        const avgTemp = calcAverage(tempArr);
        const avgHumidity = calcAverage(humidityArr);

        const countryCode = cityData.country;
        const cityName = cityData.name;

        const date = new Date(dayInfo[0].dt * 1000);
        let dayName = capitalize(getPhrase(message.guild, dayNames[date.getDay()]));

        const embed = new Discord.MessageEmbed()
        .setColor('#5865f2')
        .setTitle(getPhrase(message.guild, "EMBED_FORECASTPAGE_FORECAST") + (countryCode?(` | ${cityName}, ${countries.getName(countryCode, getCode(message.guild), {select: "official"})}, ${countryCode}`):''))
        .setThumbnail(`http://openweathermap.org/img/wn/${dayInfo[0].weather[0].icon}.png`)
        .addField(`${getPhrase(message.guild, "EMBED_FORECASTPAGE_AVG_TEMP")}:`, `${Math.round(avgTemp, 2)}\u00B0 C`, true)
        .addField(`${getPhrase(message.guild, "EMBED_FORECASTPAGE_AVG_HUM")}:`, `${Math.round(avgHumidity, 2)} %`, true)
        .addField(`${getPhrase(message.guild, "EMBED_FORECASTPAGE_PRESSURE")}:`, `${dayInfo[0].main.pressure} hPa`, true)
        .setDescription(`**${getPhrase(message.guild, "EMBED_FORECASTPAGE_DATE")}:** \`\`${dayName} ${date.getFullYear()}-${date.getMonth()}-${date.getDate()} + 24h\`\``)
        .setImage(tempChart)
        return embed;
    }
}