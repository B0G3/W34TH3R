const statSchema = require('../models/stat.js');
const embedUtil = require('../util/embedUtil.js');

const execFunction = async (bot, message) => {
	const weatherCheckCount = (await statSchema.aggregate([
		{ $match: {
			$or: [
				{ cmdName: 'weather' },
				{ cmdName: 'forecast' },
			],
		},
		}, { $group: { _id : null, sum : { $sum: '$usages' } } },
	]))[0]?.sum;
	const serverCount = bot.guilds.cache.size;
	const topCommand = (await statSchema.aggregate(
		[
			{
				$group:
				{
					_id: '$cmdName',
					usages: { $sum: '$usages' },
				},
			},
		],
	).sort({ usages:-1 }).limit(1))[0]?._id;
	const commandUseCount = (await statSchema.aggregate([
		{ $group: { _id : null, sum : { $sum: '$usages' } } },
		{
			$project: { _id: 0 },
		},
	]))[0]?.sum;
	const topUserId = (await statSchema.aggregate(
		[
			{
				$group:
				{
					_id: '$userId',
					usages: { $sum: '$usages' },
				},
			},
		],
	).sort({ usages:-1 }).limit(1))[0]?._id;

	const topGuildId = (await statSchema.aggregate(
		[
			{
				$group:
				{
					_id: '$guildId',
					usages: { $sum: '$usages' },
				},
			},
		],
	).sort({ usages:-1 }).limit(1))[0]?._id;

	const topUser = await bot.users.fetch(topUserId);
	const topGuild = await bot.guilds.fetch(topGuildId);

	const joinDate = await (bot.guilds.cache.find(g => g.id == message.guild.id))?.members.cache.find(m => m.id == bot.user.id)?.joinedAt;

	const stats = {
		weatherCheckCount: weatherCheckCount,
		serverCount: serverCount,
		topCommand: topCommand,
		commandUseCount: commandUseCount,
		topUser: topUser,
		topGuild: topGuild,
		joinDate: joinDate,
	};

	const embed = await embedUtil.botStatsEmbed(message, stats);
	message.channel.send({ embeds: [embed] });
};

module.exports = {
	run: execFunction,
	name: 'stats',
	aliases: ['s', 'st'],
	description: 'CMD_STATS_DESCRIPTION',
	categoryId: 2,
};