const languageSchema = require('../models/language.js');
const lang = require('../lang.json')

const guildLanguages = {}

module.exports = {
    getPhrase: (guild, textId) => {
        if(!lang.translations[textId]){
            //throw new Error(`Unknown text ID ${textId}`)
            console.log(`Unknown text ID ${textId}`);
            return `ERROR_ID_${textId}`
        }

        const selectedLanguage = guildLanguages[guild.id].toLowerCase();

        return lang.translations[textId][selectedLanguage];

    },
    getEnglishPhrase: (textId) => {
        return lang.translations[textId]['english'];
    },
    getCode: (guild) => {
        const selectedLanguage = guildLanguages[guild.id].toLowerCase();

        return lang.codes[selectedLanguage];

    },
    loadLanguages: async (bot) => {
        for(const guild of bot.guilds.cache){
            const guildId = guild[0];

            const result = await languageSchema.findOne({
                _id: guildId,
            })

            guildLanguages[guildId] = result ? result.language : 'english';
        }
    },
    setLanguage: async (guild, language) => {
        guildLanguages[guild.id] = language.toLowerCase();
    }
}