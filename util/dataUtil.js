const axios = require('axios');
const botSettings = require("../botSettings.json");
const QuickChart = require('quickchart-js');

function parseDate(input) {
	var parts = input.match(/(\d+)/g);
	return {
		year: parts[0],
		month: parts[1],
		day: parts[2],
		hour: parts[3], 
		minute: parts[4]
	};
}

module.exports = {
	fetchByCity: async function(city){
		var result;
		await axios.get(
			`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${botSettings.owm_token}&lang=pl`
		).then(res => {
			result = {
				data: res.data
			}
		}).catch(err => {
			result =  {
				data: err.response.data
			}
		})
		return result;
	},
	fetchByCoords: async function(x, y){
		var result;
		await axios.get(
			`https://api.openweathermap.org/data/2.5/weather?lat=${x}&lon=${y}&units=metric&appid=${botSettings.owm_token}&lang=pl`
		).then(res => {
			result = {
				data: res.data
			}
		}).catch(err => {
			result =  {
				data: err.response.data
			}
		})
		return result;
	},
	fetchByZip: async function(zipCode, countryCode){
		var result;
		await axios.get(
			`https://api.openweathermap.org/data/2.5/weather?zip=${zipCode},${countryCode}&units=metric&appid=${botSettings.owm_token}&lang=pl`
		).then(res => {
			result = {
				data: res.data
			}
		}).catch(err => {
			result =  {
				data: err.response.data
			}
		})
		return result;
	},
	fetchForecastByCity: async function(city, days = 5){
		var result;
		await axios.get(
			`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${botSettings.owm_token}&lang=pl`
		).then(res => {
			res.data.list = res.data.list.slice(0, days*8);
			result = {
				data: res.data
			}
		}).catch(err => {
			result =  {
				data: err.response.data
			}
		})
		return result;
	},
	fetchForecastByCoords: async function(x, y, days = 5){
		var result;
		await axios.get(
			`https://api.openweathermap.org/data/2.5/forecast?lat=${x}&lon=${y}&units=metric&appid=${botSettings.owm_token}&lang=pl`
		).then(res => {
			res.data.list = res.data.list.slice(0, days*8);
			result = {
				data: res.data
			}
		}).catch(err => {
			result =  {
				data: err.response.data
			}
		})
		return result;
	},
	fetchForecastByZip: async function(zipCode, countryCode, days = 5){
		var result;
		await axios.get(
			`https://api.openweathermap.org/data/2.5/forecast?zip=${zipCode},${countryCode}&units=metric&appid=${botSettings.owm_token}&lang=pl`
		).then(res => {
			res.data.list = res.data.list.slice(0, days*8);
			result = {
				data: res.data
			}
		}).catch(err => {
			result =  {
				data: err.response.data
			}
		})
		return result;
	},
	fetchTemperatureChart: async function(dayInfo){
		temperatureArr = dayInfo.map(e => e.main.temp)
		const minTemp = Math.ceil(Math.min(...temperatureArr))
		const maxTemp = Math.ceil(Math.max(...temperatureArr))

		humidityArrR = dayInfo.map(e => e.main.humidity);
		humidityArr = dayInfo.map(e => {
			return (e.main.humidity/100)*(maxTemp-minTemp+4)+minTemp-2
		});

		hourArr = dayInfo.map(e => { 
			let parsedDate = parseDate(e.dt_txt);
			let hourDescription = `${parsedDate.hour}:${parsedDate.minute}`
			return hourDescription;
		});

		const myChart = new QuickChart();
		myChart
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
		.setHeight(300)
		.setBackgroundColor('transparent');

		//var result = `https://quickchart.io/chart?c={type:'line',borderColor:'ff6384',data:{labels:[${hourArr.join(',')}],datasets:[{label:'Temperatura',data:[${temperatureArr.join(',')}]}]}}`
		var result = myChart.getUrl();

		return result;
	}
}