const mongoose = require('mongoose');

const requiredString = {
	type: String,
	required: true,
};

const Schema = new mongoose.Schema({
	_id: requiredString,
	name: requiredString,
	lon: requiredString,
	lat: requiredString,
});

module.exports = mongoose.model('location', Schema);