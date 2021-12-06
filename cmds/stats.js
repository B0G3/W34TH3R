const statSchema = require("../models/stat.js");
const {getPhrase} = require('../util/languageUtil.js')


const execFunction = async (bot, message, args) => {
	const weatherCheckCount = (await statSchema.aggregate([
		{$match: {
				$or: [
					{ cmdName: "weather" },
					{ cmdName: "forecast" }
				]
			} 
		},{ $group: { _id : null, sum : { $sum: "$usages" } } }
	]))[0]?.sum;
	const serverCount = bot.guilds.cache.size;
	const topCommand = (await statSchema.aggregate(
		[
		  {
			$group:
			  {
				_id: "$cmdName",
				usages: { $sum: "$usages" }
			  }
		  }
		]
	 ).sort({usages:-1}).limit(1))[0]?._id;
	const commandUseCount = (await statSchema.aggregate([
		{ $group: { _id : null, sum : { $sum: "$usages" } } },
		{
			$project: { _id: 0 }
		}
	]))[0]?.sum;
	const topUser = (await statSchema.aggregate(
		[
		  {
			$group:
			  {
				_id: "$userId",
				usages: { $sum: "$usages" }
			  }
		  }
		]
	 ).sort({usages:-1}).limit(1))[0]?._id;
	//pogode sprawdzono laczie x razy
	//bot znajduje sie na x serwerach
	//najczesciej uzywana globalnie komenda to
	//lacznie wywolano x komend

	// used commands, most used command, top user, guild amount

	console.log(weatherCheckCount);
	console.log(serverCount);
	console.log(topCommand);
	console.log(commandUseCount);
	console.log(topUser);
}

module.exports = {
	run: execFunction,
	name: "stats",
	aliases: ["s", "st"],
	description: "CMD_STATS_DESCRIPTION",
	categoryId: 2
}