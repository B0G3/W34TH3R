const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
    userId: String,
    name: String,
    lon: String,
    lat: String
})

module.exports = mongoose.model('location', Schema);