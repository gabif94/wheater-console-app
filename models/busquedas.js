const fs = require('fs');
const axios = require('axios');


class Busquedas {

	historial = []
	dbPath = './db/database.json'
	constructor() {}

	get paramsMapbox() {
		return {
			access_token: process.env.MAPBOX_KEY,
			limit: 5,
			language: 'es',
		};
	}

	get paramsWeatherApp() {
		return {
			appid: process.env.OPENWEATHER_KEY,
			units: 'metric',
			lang: 'es'
		}
	}

	async ciudad(lugar = '') {
		try {
			const instance = axios.create({
				baseURL: `http://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
				params: this.paramsMapbox,
			});
			const resp = await instance.get();
			return resp.data.features.map(lugar => ({
				id: lugar.id,
				nombre: lugar.place_name,
				lng: lugar.center[0],
				lat: lugar.center[1],
			}));
		} catch (error) {
			return [];
		}
	}

	async climaLugar(lat, lon) {
		try {
			const instance = axios.create({
				baseURL: `https://api.openweathermap.org/data/2.5/weather`,
				params: {...this.paramsWeatherApp, lat, lon}
			})
			const resp = await instance.get()
			const { weather, main } = resp.data
			
			return {
				descripcion: weather[0].description,
				min: main.temp_min,
				max: main.temp_max,
				temp: main.temp
			}
			
		} catch (error) {
			console.log(error)
		}
	}

	agregarHistorial(lugar = '') {
		if(this.historial.includes(lugar.toLowerCase())) return

		this.historial.unshift(lugar.toLowerCase())

		this.guardarEnDB()
	}

	guardarEnDB() {
		const payload = {
			historial: this.historial
		}
		fs.writeFileSync(this.dbPath, JSON.stringify(payload))

	}
}

module.exports = Busquedas;
