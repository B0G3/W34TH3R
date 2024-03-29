const axios = require('axios');
const botSettings = require('../botSettings.json');
const locationSchema = require('../models/location.js');
const QuickChart = require('quickchart-js');
const { getPhrase } = require('../util/languageUtil.js');
const moment = require('moment');

const capitalize = (s) => (s && s[0].toUpperCase() + s.slice(1)) || '';

const parseTxtDate = (input) => {
	const parts = input.match(/(\d+)/g);
	return {
		year: parts[0],
		month: parts[1],
		day: parts[2],
		hour: parts[3],
		minute: parts[4],
	};
};

const getDayNameShort = (day) => {
	const dayNames = ['DAY_SHORT_SUNDAY', 'DAY_SHORT_MONDAY', 'DAY_SHORT_TUESDAY', 'DAY_SHORT_WEDNESDAY', 'DAY_SHORT_THURSDAY', 'DAY_SHORT_FRIDAY', 'DAY_SHORT_SATURDAY'];
	return dayNames[day];
};

const getDayName = (day) => {
	const dayNames = ['DAY_SUNDAY', 'DAY_MONDAY', 'DAY_TUESDAY', 'DAY_WEDNESDAY', 'DAY_THURSDAY', 'DAY_FRIDAY', 'DAY_SATURDAY'];
	return dayNames[day];
};

module.exports = {
	fetchByCity: async (city, lang = 'en') => {
		try {
			const res = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${botSettings.owm_token}&lang=${lang}`);
			return { data: res.data };
		}
		catch (err) {
			console.log(err);
			if (err.response) return { data: err.response.data };
			else return { data: null };
		}
	},
	fetchByCoords: async (x, y, lang = 'en') => {
		try {
			const res = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${x}&lon=${y}&units=metric&appid=${botSettings.owm_token}&lang=${lang}`);
			return { data: res.data };
		}
		catch (err) {
			console.log(err);
			if (err.response) return { data: err.response.data };
			else return { data: null };
		}
	},
	fetchByZip: async (zipCode, countryCode, lang = 'en') => {
		try {
			const res = await axios.get(`https://api.openweathermap.org/data/2.5/weather?zip=${zipCode},${countryCode}&units=metric&appid=${botSettings.owm_token}&lang=${lang}`);
			return { data: res.data };
		}
		catch (err) {
			console.log(err);
			if (err.response) return { data: err.response.data };
			else return { data: null };
		}
	},
	fetchForecastByCity: async (city, lang = 'en') => {
		try {
			const res = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${botSettings.owm_token}&lang=${lang}`);
			return { data: res.data };
		}
		catch (err) {
			console.log(err);
			if (err.response) return { data: err.response.data };
			else return { data: null };
		}
	},
	fetchForecastByCoords: async (x, y, daily = false, lang = 'en') => {
		let link;
		if (!daily) link = `https://api.openweathermap.org/data/2.5/forecast?lat=${x}&lon=${y}&units=metric&appid=${botSettings.owm_token}&lang=${lang}`;
		else link = `https://api.openweathermap.org/data/2.5/onecall?lat=${x}&lon=${y}&exclude=current,minutely,hourly&appid=${botSettings.owm_token}&lang=${lang}&units=metric`;
		try {
			const res = await axios.get(link);
			return { data: res.data };
		}
		catch (err) {
			console.log(err);
			if (err.response) return { data: err.response.data };
			else return { data: null };
		}
	},
	fetchForecastByZip: async (zipCode, countryCode, lang = 'en') => {
		try {
			const res = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?zip=${zipCode},${countryCode}&units=metric&appid=${botSettings.owm_token}&lang=${lang}`);
			return { data: res.data };
		}
		catch (err) {
			console.log(err);
			if (err.response) return { data: err.response.data };
			else return { data: null };
		}
	},
	getUserLocation: async (_userId) => {
		let location;

		const data = await locationSchema.findOne({ userId: _userId }).catch(err => {
			console.log(err);
		});

		if (data) location = { name: data.name, lon: data.lon, lat: data.lat };
		else location = null;

		return location;
	},
	getDayName: getDayName,
	getDayNameShort: getDayNameShort,
	fetchForecastChart: async (message, dayInfo) => {
		const temperatureArr = dayInfo.map(e => e.main.temp);
		const minTemp = Math.ceil(Math.min(...temperatureArr));
		const maxTemp = Math.ceil(Math.max(...temperatureArr));

		const humidityArr = dayInfo.map(e => {
			return (e.main.humidity / 100) * (maxTemp - minTemp + 4) + minTemp - 2;
		});

		const precipitationArr = dayInfo.map(e => {
			return e.pop * (maxTemp - minTemp + 4) + minTemp - 2;
		});

		const hourArr = dayInfo.map(e => {
			const parsedDate = parseTxtDate(e.dt_txt);
			const hourDescription = `${parsedDate.hour}:${parsedDate.minute}`;
			return hourDescription;
		});

		let _annotation;
		if (!(hourArr[0] == '00:00' || hourArr[hourArr.length - 1] == '00:00')) {
			const id = hourArr.findIndex(el => {
				return el === '00:00';
			});
			if (id >= 0 && id < dayInfo.length) {
				const date = new Date(dayInfo[id].dt * 1000);
				const formattedDate = `${capitalize(getPhrase(message.guild, getDayNameShort(date.getDay())))}. ${moment(date).format('MM-DD')}`;
				_annotation = {
					annotations: [
						{
							type: 'line',
							mode: 'vertical',
							scaleID: 'x-axis-0',
							value: '00:00',
							borderColor: 'white',
							borderWidth: 2,
							label: {
								enabled: true,
								fontColor: '#2f3136',
								backgroundColor: '#ffffff',
								content: formattedDate,
							},
						},
					],
				};
			}
		}

		const forecastChart = new QuickChart();
		forecastChart
			.setConfig({
				data: { labels: hourArr, datasets: [
					{ label: getPhrase(message.guild, 'EMBED_FORECASTPAGE_TEMPERATURE'), type: 'line', yAxisId: 'y1', data: temperatureArr, borderColor: '#f7d257', backgroundColor: '#f7d25750', fill: 'start' },
					{ label: getPhrase(message.guild, 'EMBED_FORECASTPAGE_HUMIDITY'), type: 'line', steppedLine: 'middle', yAxisId: 'y2', data: humidityArr, borderColor: '#5865f250', backgroundColor: '#5865f220', fill: 'start' },
					{ label: getPhrase(message.guild, 'EMBED_FORECASTPAGE_PRECIPITATION'), type: 'line', yAxisId: 'y2', data: precipitationArr, borderColor: '#abbef0', backgroundColor: '#abbef050', fill: 'start' },
				] },
				options: {
					annotation: _annotation,
					elements: {
						point:{
							radius: 0,
						},
					},
					legend: {
						display: true,
						position: 'bottom',
						labels: {
							fontSize: 20,
							fontStyle: 'bold',
							fontColor: 'white',
						},
					},
					scales: {
						yAxes: [
							{
								id: 'y1',
								display: true,
								position: 'left',
								ticks: {
									suggestedMin: minTemp - 2,
									suggestedMax: maxTemp + 2,
									beginAtZero: false,
									fontColor: 'white',
									callback: function(value) {
										return value + '°C';
									},
								},
							},
							{
								id: 'y2',
								display: true,
								position: 'right',
								gridLines: {
									drawOnChartArea: false,
								},
								ticks: {
									suggestedMin: 0,
									suggestedMax: 100,
									beginAtZero: false,
									fontColor: 'white',
									callback: function(value) {
										return value + '%';
									},
								},
							},
						],
						xAxes: [
							{
								ticks: {
									fontColor: 'white',
								},
							},
						],
					},
				},
			})
			.setWidth(500)
			.setHeight(250)
			.setBackgroundColor('transparent');

		return forecastChart.getShortUrl();
	},
};