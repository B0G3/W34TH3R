const Discord = require('discord.js');

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

module.exports = {
    createPages: async function(bot, message, pages, timeout){
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
        const embed = new Discord.MessageEmbed()
        .setColor('#cb4b16')
        .setAuthor(`${data.name}, ${data.sys.country}, ${data.weather[0].description}`, `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`)
        .addField(`Temperatura:`, `${data.main.temp}\u00B0 C`, true)
        .addField(`Temp max:`, `${data.main.temp_max}\u00B0 C`, true)
        .addField(`Temp min:`, `${data.main.temp_min}\u00B0 C`, true)
        .addField(`Wilgotność:`, `${data.main.humidity} %`, true)
        .addField(`Wiatr:`, `${data.wind.speed} m/s`, true)
        .addField(`Ciśnienie:`, `${data.main.pressure} hpa`, true)
        .setDescription("``"+data.weather[0].description.capitalize()+"``")
        return embed;
    }
}