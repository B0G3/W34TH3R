const mongoose = require("mongoose");

let Schema = new mongoose.Schema({
    userId: String,
    name: String,
    lon: String,
    lat: String
})

module.exports = mongoose.model('location', Schema);