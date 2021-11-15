const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
    guildId: String,
    prefix: String
})

module.exports = mongoose.model('prefix', Schema);