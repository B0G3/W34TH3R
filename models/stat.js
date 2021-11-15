const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
    guildId: String,
    cmdName: String,
    usages: Number,
})

module.exports = mongoose.model('guildStat', Schema);