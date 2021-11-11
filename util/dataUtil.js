const axios = require('axios');
const botSettings = require("../botSettings.json");
const locationSchema = require("../models/location.js");
const QuickChart = require('quickchart-js');

parseDate = (input) => {
	let parts = input.match(/(\d+)/g);
	return {
		year: parts[0],
		month: parts[1],
		day: parts[2],
		hour: parts[3], 
		minute: parts[4]
	};
}

module.exports = {
	fetchByCity: async (city) => {
		try{
			let res = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${botSettings.owm_token}&lang=pl`);
			return { data: res.data }
		}catch(err){
			console.log(err);
			if(err.response) return { data: err.response.data }
			else return { data: null }
		}
	},
	fetchByCoords: async (x, y) => {
		try{
			let res = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${x}&lon=${y}&units=metric&appid=${botSettings.owm_token}&lang=pl`);
			return { data: res.data }
		}catch(err){
			console.log(err);
			if(err.response) return { data: err.response.data }
			else return { data: null }
		}
	},
	fetchByZip: async (zipCode, countryCode) => {
		try{
			let res = await axios.get(`https://api.openweathermap.org/data/2.5/weather?zip=${zipCode},${countryCode}&units=metric&appid=${botSettings.owm_token}&lang=pl`);
			return { data: res.data }
		}catch(err){
			console.log(err);
			if(err.response) return { data: err.response.data }
			else return { data: null }
		}
	},
	fetchForecastByCity: async (city) => {
		try{
			let res = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${botSettings.owm_token}&lang=pl`);
			return { data: res.data }
		}catch(err){
			console.log(err);
			if(err.response) return { data: err.response.data }
			else return { data: null }
		}
	},
	fetchForecastByCoords: async (x, y, daily = false) => {
		let link;
		if(!daily) link = `https://api.openweathermap.org/data/2.5/forecast?lat=${x}&lon=${y}&units=metric&appid=${botSettings.owm_token}&lang=pl`
		else link = `https://api.openweathermap.org/data/2.5/onecall?lat=${x}&lon=${y}&exclude=current,minutely,hourly&appid=${botSettings.owm_token}&lang=pl&units=metric`
		try{
			let res = await axios.get(link);
			return { data: res.data }
		}catch(err){
			console.log(err);
			if(err.response) return { data: err.response.data }
			else return { data: null }
		}
	},
	fetchForecastByZip: async (zipCode, countryCode, days = 5) => {
		try{
			let res = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?zip=${zipCode},${countryCode}&units=metric&appid=${botSettings.owm_token}&lang=pl`);
			return { data: res.data }
		}catch(err){
			console.log(err);
			if(err.response) return { data: err.response.data }
			else return { data: null }
		}
	},
	getUserLocation: async (_userId) => {
		let location;

		const data = await locationSchema.findOne({userId: _userId}).catch(err => {
			console.log(err);
		})
	
		if(data) location = {name: data.name, lon: data.lon, lat: data.lat};
		else location = null;
	 
		return location;
	},
	fetchForecastChart: async (dayInfo) => {
		temperatureArr = dayInfo.map(e => e.main.temp)
		const minTemp = Math.ceil(Math.min(...temperatureArr));
		const maxTemp = Math.ceil(Math.max(...temperatureArr));

		humidityArr = dayInfo.map(e => {
			return (e.main.humidity/100)*(maxTemp-minTemp+4)+minTemp-2;
		});

		hourArr = dayInfo.map(e => { 
			let parsedDate = parseDate(e.dt_txt);
			let hourDescription = `${parsedDate.hour}:${parsedDate.minute}`;
			return hourDescription;
		});

		const forecastChart = new QuickChart();
		forecastChart
		.setConfig({
			data: { labels: hourArr, datasets: [
				{ label: 'Temperatura', type: 'line', yAxisId: 'y1', data: temperatureArr, borderColor: '#f7d257', backgroundColor: '#f7d25750' },
				{ label: 'Wilgotność', type: 'bar', yAxisId: 'y2', data: humidityArr, borderColor: '#5865f2', categoryPercentage: 1, barPercentage: 1, borderWidth: { top:4, right:0, bottom:0, left:0 }, backgroundColor: '#5865f250' }
				] },
			options: {
				legend: {
					display: true,
					position: 'bottom',
					labels: {
						fontSize: 20,
						fontStyle: 'bold',
						fontColor: "white"
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
							callback: function (value) {
								return value + '°C';
							}
						},
					},
					{
						id: 'y2',
						display: true,
						position: 'right',
						gridLines: {
							drawOnChartArea: false
						},
						ticks: {
							suggestedMin: 0,
							suggestedMax: 100,
							beginAtZero: false,
							fontColor: 'white',
							callback: function (value) {
								return value + '%';
							}
						},
					}
					],
					xAxes: [
					{
						ticks: {
							fontColor: 'white'
						},
					},
					]
				}
			}
		})
		.setWidth(500)
		.setHeight(250)
		.setBackgroundColor('transparent');

		return forecastChart.getUrl();
	}
}