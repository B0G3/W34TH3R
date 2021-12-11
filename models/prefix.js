const mongoose = require('mongoose');

const requiredString = {
	type: String,
	required: true,
};

const Schema = new mongoose.Schema({
	_id: requiredString,
	prefix: requiredString,
});

module.exports = mongoose.model('prefix', Schema);