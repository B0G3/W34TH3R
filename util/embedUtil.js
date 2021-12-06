const Discord = require("discord.js");
const countries = require("i18n-iso-countries");
const dataUtil = require("../util/dataUtil.js");
const categories = require("../categories.json");
const {getPhrase, getCode} = require("../util/languageUtil.js");
const lang = require('../lang.json')

const capitalize = (s) => (s && s[0].toUpperCase() + s.slice(1)) || ""

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
        const embed = new Discord.MessageEmbed()
        .setColor('#cb4b16')
        .setTitle(`\:information_source: | ${cmd.name.toUpperCase()}`)
        .addField(`${getPhrase(message.guild, "EMBED_HELP_CATEGORY")}:`, `\`\`\`${getPhrase(message.guild, categories[cmd.categoryId].name)}\`\`\``, false)
        .addField(`${getPhrase(message.guild, "EMBED_HELP_ALIASES")}:`, `\`\`\`${cmd.aliases.join(', ')}\`\`\``, false)

        if(cmd.syntax) embed.addField(`${getPhrase(message.guild, "EMBED_HELP_SYNTAX")}:`, `\`\`\`${getPhrase(message.guild, cmd.syntax)}\`\`\``, false)
        
        .setDescription(getPhrase(message.guild, cmd.longDescription?cmd.longDescription:cmd.description));
        return embed;
    },
    countryListEmbed: (message, _countries) => {
        const totalLength = _countries.length;

        const embed = new Discord.MessageEmbed()
        .setColor('#3ba55d')
        .setTitle(`${getPhrase(message.guild, "EMBED_COUNTRYLIST_COUNTRIES")} | ISO3166`)
        .setTimestamp()
        .setFooter(`${getPhrase(message.guild, "EMBED_COUNTRYLIST_CALLER")} ${message.author.username}`)
        
        let columnText = '';

        while(_countries.length>0){
            const chunk = _countries.splice(0, Math.ceil(totalLength/3));
    
            for(c of chunk){
                let countryName = countries.getName(c, getCode(message.guild));
                columnText += `\:flag_${c.toLowerCase()}: ${countryName.slice(0,12)} (${c})\n`;
            }
            embed.addField(`${chunk[0]}-${chunk[chunk.length-1]}`, columnText, true);
            columnText = '';
        }

        return embed;
    },
    languageListEmbed: (message) => {
        const embed = new Discord.MessageEmbed()
        .setColor('#3ba55d')
        .setTitle(getPhrase(message.guild, "CMD_LANG_RESPONSE"))
        
        let description = '';

        lang.languages.forEach(e => {
            description += `${lang.details[e].icon} ${capitalize(e)}\n`
        })
        
        embed.setDescription(description);

        return embed;
    },
    weatherEmbed: async (message, data, _countryData = null) => {
        let countryInfo = '';
        let countryCode = (_countryData!=null)?_countryData.country:data.sys.country;
        if(countryCode) countryInfo = ", " + countries.getName(countryCode, getCode(message.guild), {select: "official"}) + `, ${countryCode} \:flag_${countryCode.toLowerCase()}:`;

        const sunrise = new Date(data.sys.sunrise * 1000);
        const sunset = new Date(data.sys.sunset * 1000);

        function formatDate(date){
            return date.getHours() + ':' + ("0" + date.getMinutes()).substr(-2);
        }

        const sunriseUTC = new Date(sunrise.getTime() + sunrise.getTimezoneOffset() * 60000);
        const sunsetUTC = new Date(sunset.getTime() + sunset.getTimezoneOffset() * 60000);

        const sunriseLocal = new Date(sunriseUTC.getTime() + (1000 * data.timezone));
        const sunsetLocal = new Date(sunsetUTC.getTime() + (1000 * data.timezone));

        console.log(data);

        const embed = new Discord.MessageEmbed()
        .setColor('#5865f2')
        .setAuthor(capitalize(data.weather[0].description))
        .setThumbnail(`http://openweathermap.org/img/wn/${data.weather[0].icon}.png`)
        .setDescription((_countryData!=null)?_countryData.name:data.name + countryInfo)
        .addField(`${getPhrase(message.guild, "EMBED_WEATHER_TEMPERATURE")}:`, `${data.main.temp}\u00B0 C`, true)
        .addField(`${getPhrase(message.guild, "EMBED_WEATHER_TEMP_MAX")}:`, `${data.main.temp_max}\u00B0 C`, true)
        .addField(`${getPhrase(message.guild, "EMBED_WEATHER_TEMP_MIN")}:`, `${data.main.temp_min}\u00B0 C`, true)
        .addField(`${getPhrase(message.guild, "EMBED_WEATHER_HUMIDITY")}:`, `${data.main.humidity} %`, true)
        .addField(`${getPhrase(message.guild, "EMBED_WEATHER_WIND")}:`, `${data.wind.speed} m/s`, true)
        .addField(`${getPhrase(message.guild, "EMBED_WEATHER_PRESSURE")}:`, `${data.main.pressure} hpa`, true)
        .addField(`${getPhrase(message.guild, "EMBED_WEATHER_SUNRISE")}:`, `${formatDate(sunriseUTC)} UTC\n${formatDate(sunriseLocal)} GMT ${data.timezone/3600}:00`, true)
        .addField(`${getPhrase(message.guild, "EMBED_WEATHER_SUNSET")}:`, `${formatDate(sunsetUTC)} UTC\n${formatDate(sunsetLocal)} GMT ${data.timezone/3600}:00`, true)
        return embed;
    },
    forecastFrontEmbed: async (message, daysInfo, cityData) => {
        let dayDescription = '';
        let tempDescription = '';
        let overallDescription = '';
        for(i in daysInfo){
            let day = daysInfo[i];
            let date = new Date(day.dt * 1000);
            let dayName = getPhrase(message.guild, dataUtil.getDayNameShort(date.getDay())) + ".";
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
        const tempChart = await dataUtil.fetchForecastChart(message, dayInfo);
        const tempArr = dayInfo.map(e => e.main.temp);
        const humidityArr = dayInfo.map(e => e.main.humidity);

        const avgTemp = calcAverage(tempArr);
        const avgHumidity = calcAverage(humidityArr);

        const countryCode = cityData.country;
        const cityName = cityData.name;

        const sunrise = new Date(cityData.sunrise * 1000);
        const sunset = new Date(cityData.sunset * 1000);

        function formatDate(date){
            return date.getHours() + ':' + ("0" + date.getMinutes()).substr(-2);
        }

        const sunriseUTC = new Date(sunrise.getTime() + sunrise.getTimezoneOffset() * 60000);
        const sunsetUTC = new Date(sunset.getTime() + sunset.getTimezoneOffset() * 60000);

        const sunriseLocal = new Date(sunriseUTC.getTime() + (1000 * cityData.timezone));
        const sunsetLocal = new Date(sunsetUTC.getTime() + (1000 * cityData.timezone));

        const date = new Date(dayInfo[0].dt * 1000);
        let dayName = capitalize(getPhrase(message.guild, dataUtil.getDayName(date.getDay())));

        const embed = new Discord.MessageEmbed()
        .setColor('#5865f2')
        .setTitle(getPhrase(message.guild, "EMBED_FORECASTPAGE_FORECAST") + (countryCode?(` | ${cityName}, ${countries.getName(countryCode, getCode(message.guild), {select: "official"})}, ${countryCode}`):''))
        .setThumbnail(`http://openweathermap.org/img/wn/${dayInfo[0].weather[0].icon}.png`)
        .addField(`${getPhrase(message.guild, "EMBED_FORECASTPAGE_AVG_TEMP")}:`, `\`\`\`${Math.round(avgTemp, 2)}\u00B0 C\`\`\``, true)
        .addField(`${getPhrase(message.guild, "EMBED_FORECASTPAGE_AVG_HUM")}:`, `\`\`\`${Math.round(avgHumidity, 2)} %\`\`\``, true)
        .addField(`${getPhrase(message.guild, "EMBED_FORECASTPAGE_PRESSURE")}:`, `\`\`\`${dayInfo[0].main.pressure} hPa\`\`\``, true)
        .addField(`${getPhrase(message.guild, "EMBED_FORECASTPAGE_SUNRISE")}:`, `\`\`\`${formatDate(sunriseUTC)} UTC\n${formatDate(sunriseLocal)} GMT ${cityData.timezone/3600}:00\`\`\``, true)
        .addField(`${getPhrase(message.guild, "EMBED_FORECASTPAGE_SUNSET")}:`, `\`\`\`${formatDate(sunsetUTC)} UTC\n${formatDate(sunsetLocal)} GMT ${cityData.timezone/3600}:00\`\`\``, true)
        .setDescription(`**${getPhrase(message.guild, "EMBED_FORECASTPAGE_DATE")}:** \`\`${dayName} ${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${date.getHours()}:00 + 24h\`\``)
        .setImage(tempChart)
        return embed;
    }
}