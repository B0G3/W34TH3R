const axios = require('axios');
const botSettings = require("../botSettings.json");
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
	}
}