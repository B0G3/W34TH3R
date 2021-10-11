const axios = require('axios');
const botSettings = require("../botSettings.json");
module.exports = {
    fetchByCity: async function(city){
    	const result = await axios.get(
			`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${botSettings.owm_token}&lang=pl`
		)
       	return {
       		status: result.status,
       		data: result.data
       	};
    }

}