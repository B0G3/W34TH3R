const Discord = require('discord.js');
const countries = require("i18n-iso-countries");
const categories = require("../util/categoryUtil.js").categories;

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

module.exports = {
    createPages: async function(message, pages, timeout){
        var timeForStart = Date.now();
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

        var pageMovingButtons = new Discord.MessageActionRow()
        .addComponents(backwardButton)
        .addComponents(forwardButton)
        .addComponents(abandonButton)
        var currentPage = 0;
        var m = await message.channel.send({content: 'Proszę czekać...'});
        m.edit({content: 'Załadowano!', embeds: [pages[currentPage]], components: [pageMovingButtons]});

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
                await i.editReply({embeds: [pages[currentPage]], components: [pageMovingButtons]});
            }else{
                collector.stop();
            }
        });

        collector.on('end', collected => {
            m.edit({components: []});
        });

    },
    helpEmbed: function(cmd){
        let description = `**Kategoria**: ${categories[cmd.categoryId].name}\n`;
        description += cmd.syntax?(`**Syntax**: ${cmd.syntax}\n`):'';
        description += `**Aliasy**: ${cmd.aliases.join(', ')}\n`;
        description += cmd.longDescription?cmd.longDescription:cmd.description;

        const embed = new Discord.MessageEmbed()
        .setColor('#cb4b16')
        .setTitle(`${categories[cmd.categoryId].icon} Komenda \`${cmd.name}\``)
        .setDescription(description);
        return embed;
    },
    countryListEmbed: function(author, description, page, pages){
        const embed = new Discord.MessageEmbed()
        .setColor('#3ba55d')
        .setTitle(`Dostępne kraje [${page}/${pages}] ISO3166`)
        .setTimestamp()
        .setFooter(`Wywołane przez ${author.username}`)
        .setDescription(description);
        return embed;
    },
    weatherEmbed: function(data){
        var countryInfo = '';
        if(data.sys.country) countryInfo = ", " + countries.getName(data.sys.country, "pl", {select: "official"}) + `, ${data.sys.country} \:flag_${data.sys.country.toLowerCase()}:`

        const embed = new Discord.MessageEmbed()
        .setColor('#5865f2')
        .setAuthor(data.weather[0].description.capitalize(), `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`)
        .setDescription(data.name + countryInfo)
        .addField(`Temperatura:`, `${data.main.temp}\u00B0 C`, true)
        .addField(`Temp max:`, `${data.main.temp_max}\u00B0 C`, true)
        .addField(`Temp min:`, `${data.main.temp_min}\u00B0 C`, true)
        .addField(`Wilgotność:`, `${data.main.humidity} %`, true)
        .addField(`Wiatr:`, `${data.wind.speed} m/s`, true)
        .addField(`Ciśnienie:`, `${data.main.pressure} hpa`, true)
        return embed;
    }
}