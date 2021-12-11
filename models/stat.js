const mongoose = require('mongoose');

const requiredString = {
	type: String,
	required: true,
};

const Schema = new mongoose.Schema({
	cmdName: requiredString,
	guildId: requiredString,
	userId: requiredString,
	usages: {
		type: Number,
		default: 0,
	},
});

module.exports = mongoose.model('stat', Schema);