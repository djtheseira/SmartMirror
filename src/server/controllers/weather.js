const rp = require('request-promise');
const moment = require('moment');
const util = require('util');
require('dotenv').config();
const currentWeatherAPI = "https://api.openweathermap.org/data/2.5/weather";
const forecastWeatherAPI = "https://api.openweathermap.org/data/2.5/forecast";
const cities = require('../constants/cities').cities;

let darksky = "https://api.darksky.net/forecast/";
let gmaps = "https://maps.googleapis.com/maps/api/geocode/json";
let city = "Azusa";
let country = "US";
// let lat = 34.1339;
// let lng = -117.9057;
let lang = "en";
let units = "us";
let exclude = "minutely,flags,hourly";

// Get City Data
exports.getCityData = async(req, res) => {
  try {
    let input = req.query.input ? req.query.input : 'Azusa, CA';
    let gmapsOptions = {
      uri: gmaps,
      qs: {
        'key': process.env.GMAPS_KEY,
        'address': input
      }
    }
    rp(gmapsOptions)
    .then((results) => {
      let data = JSON.parse(results);
      let gResults = data.results[0];
      let status = 0;
      let result = {};
      
      switch (data.status) {
        case 'OK': 
          status = 200;
          result = {
            message: 'Location found',
            address: gResults.formatted_address,
            lat: gResults.geometry.location.lat,
            lng: gResults.geometry.location.lng,
          }
          break;
        case 'ZERO_RESULTS':
          status = 404;
          result = {
            message: 'No locations found',
          }
          break;
      }
      res.status(status).send({ result });
    })
    .catch((err) => {
      console.log('error: ', err);
      res.status(400).send({ result: err.message });
    })
  } catch (err) {
    console.log('error: ', err);
    res.status(400).send({ result: err.message });
  }
}

exports.getWeather = async (req, res) => {
  let cityId = req.params.cityId ? req.params.cityId : 0;
  let weather = {};
  let data = {};

  let gmapsOptions = {
    uri: gmaps,
    qs: {
      'key': process.env.GMAPS_KEY,
      'address': cities[cityId]
    }
  }

  if (cityId < 0) {
    res.status(400).send({ results: "That's not a valid city option, please select a different city." });
    return;
  }

  try {
    let gResponse = await rp(gmapsOptions);
    let gData = JSON.parse(gResponse);
    let gStatus = gData.status;
    if (gStatus === 'ZERO_RESULTS') {
      res.status(404).send({ results: 'No locations found' });
      return;
    } else if (gStatus !== 'OK') {
      console.log(gStatus, gData);
      res.status(400).send({ results: 'Something went wrong, please try again.' });
      return;
    }
    let gResults = gData.results[0];

    data.location = gResults.formatted_address;
    let lat = gResults.geometry.location.lat,
      lng = gResults.geometry.location.lng;
    let tempDarksky = darksky + process.env.DARKSKY_KEY + "/" + lat + "," + lng;
    
    let dsOptions = {
      uri: tempDarksky,
      qs: {
        "lang": lang,
        "units": units,
        "exclude": exclude
      }
    }
    
    let dsResults = await rp(dsOptions);
    let dsData = JSON.parse(dsResults);
    if (dsData.code) {
      res.status(400).send({ err: 'Unable to get the weather' });
    }
    let curData = dsData.currently;
    let forecastData = dsData.daily.data;
    let currentForecast = forecastData[0];

    data.current = {
      temp: createTempString(curData.temperature),
      humidty: curData.humidity,
      summary: curData.summary,
      icon: getWeatherIcon(curData.icon),
      high: createTempString(currentForecast.temperatureHigh),
      low: createTempString(currentForecast.temperatureLow),
      feelsLike: createTempString(curData.apparentTemperature),
    };
    let forecastWeather = {};

    forecastData.slice(1).forEach((day, idx) => {
      let dayDate = moment(day.time * 1000).format('ddd');

      let weatherObject = {
        date: dayDate,
        maxTemp: createTempString(day.temperatureHigh),
        maxTempTime: moment(day.temperatureHighTime * 1000).format('hh:mm'),
        minTemp: createTempString(day.temperatureLow),
        minTempTime: moment(day.temperatureLowTime * 1000).format('hh:mm'),
        humidity: day.humidity,
        summary: day.summary,
        icon: getWeatherIcon(day.icon),
        sunrise: moment(day.sunriseTime * 1000).format('hh:mm'),
        sunset: moment(day.sunsetTime * 1000).format('hh:mm'),
      }
      forecastWeather[idx] = weatherObject;
    });

    data.forecast = forecastWeather;

    res.status(200).send({ data });
  } catch (err) {
    console.log('error: ', err);
    res.status(400).send({ results: err.message });
  }
}

exports.getWeatherDead = async (req, res) => {
  let tempDarksky = darksky + "/" + lat + "," + lng;
  let weather = {};
  let options = {
    uri: tempDarksky,
    qs: {
      "lang": lang,
      "units": units,
      "exclude": exclude
    }
  }
  let cityId = req.params.cityId ? req.params.cityId : 0;
  let gmapsOptions = {
    uri: gmaps,
    qs: {
      'key': process.env.GMAPS_KEY,
      'address': input
    }
  }

  rp(options)
  .then((weatherData) => {
    let weatherJson = JSON.parse(weatherData);
    let currentWeather = {};
    let forecastWeather = {};
    let curWeather = weatherJson.currently;
    let fcastWeather = weatherJson.daily.data;

    currentWeather.curTemp = curWeather.temperature;
    currentWeather.curHumidity = curWeather.humidity;
    currentWeather.summary = curWeather.summary;
    currentWeather.sumIcon = curWeather.icon;

    fcastWeather.forEach((day) => {
      let dayKey = moment(day.time * 1000).format('MM-DD-YYYY');
      let dayObject = {};
      dayObject.maxT = day.temperatureHigh;
      dayObject.maxTTime = moment(day.temperatureHighTime * 1000).format('hh:mm');
      dayObject.minT = day.temperatureLow;
      dayObject.minTTime = moment(day.temperatureLowTime * 1000).format('hh:mm');
      dayObject.humidity = day.humidity;
      dayObject.summary = day.summary;
      dayObject.sumIcon = day.icon;
      dayObject.sunrise = moment(day.sunriseTime * 1000).format('hh:mm');
      dayObject.sunset = moment(day.sunsetTime * 1000).format('hh:mm');
      forecastWeather[dayKey] = dayObject;
    });

    weather.curWeather = currentWeather;
    weather.forecastWeather = forecastWeather;

    res.status(200).send({result: weatherJson, weather });
  })
  .catch((err) => {
    console.log('err: ', err);
    res.status(400).send({ result: err.message });
  });

}

exports.getCurrentWeather = async(req, res) => {
  let currentWeather = {};
  let forecastWeather = {};
  let curOptions = {
    uri: currentWeatherAPI,
    qs: {
      'APPID': process.env.OPENWEATHER_KEY,
      'q': (city + "," + country),
      'units': 'Imperial'
    },
    json: true
  }
  let forecastOptions = {
    uri: forecastWeatherAPI,
    qs: {
      'APPID': process.env.OPENWEATHER_KEY,
      'q': (city + "," + country),
      'units': 'Imperial',
    },
    json: true
  }

  rp(curOptions)
    .then((curWeatherData) => {
      let curWeatherWeather = curWeatherData.weather[0];
      let curTemp = curWeatherData.main.temp;
      let curHumidity = curWeatherData.main.humidity;
      let sunrise = curWeatherData.sys.sunrise;
      let sunset = curWeatherData.sys.sunset;

      currentWeather.curConditions = curWeatherWeather;
      currentWeather.curTemp = curTemp;
      currentWeather.curHumidity = curHumidity;
      currentWeather.sunrise = moment(sunrise * 1000).format('MM/DD/YYYY hh:mm:ss a');
      currentWeather.sunset = moment(sunset * 1000).format('MM/DD/YYYY hh:mm:ss a');

      // console.log('curWeatherWeather: ', curWeatherWeather);
      // console.log('curTemp: ', curTemp);
      // console.log('curHumidity: ', curHumidity);
      // console.log('sunrise: ', moment(sunrise * 1000).format('MM/DD/YYYY hh:mm:ss a'));
      // console.log('sunset: ', moment(sunset * 1000).format('MM/DD/YYYY hh:mm:ss a'));
    })
    .then(() => {
      return rp(forecastOptions);
    })
    .then((forecastWeatherData) => {
      // console.log(forecastWeatherData);
      let forecastList = forecastWeatherData.list;
      let forecastArray = [];

      forecastList.forEach((forecast) => {
        let fTime = moment(forecast.dt * 1000).format("MM-DD-YYYY");
        let fMain = forecast.main;

        let forecastDayObject = forecastArray[fTime];
        if (forecastDayObject) {
          forecastDayObject.maxT = fMain.temp > forecastDayObject.maxT ? fMain.temp : forecastDayObject.maxT;
          forecastDayObject.minT = fMain.temp < forecastDayObject.minT ? fMain.temp : forecastDayObject.minT;
        } else {
          forecastArray[fTime] = {
            maxT: fMain.temp,
            minT: fMain.temp
          }
        }
      });
      console.log('forecast: ', forecastArray);
    })
    .then(() => {
      let weatherData = {
        currentWeather
      };
      res.status(200).send({results: weatherData });
    })
    .catch((err) => {
      console.log('error: ', err.message);
      res.status(400).send({results: 'WEATHER ERROR'});
    });
}

let createTempString = function (temp ) {
  let split = temp.toString().split(".");
  let newTemp = split[1] && split[1] > 50 ? Math.ceil(temp) : Math.floor(temp);
  newTemp += String.fromCharCode(176) + (units === "us" ? "F" : "C");
  return newTemp;
}

let getWeatherIcon = function (icon) {
  const weatherTypes = {
    "clear-day": "clear-day",
    "clear-night": "clear-night",
    "rain": "rain",
    "snow": "snow",
    "sleet": "snow",
    "wind": "wind",
    "fog": "fog",
    "cloudy": "cloudy",
    "partly-cloudy-day": "cloudy-day",
    "partly-cloudy-night": "cloudy-night"
  };
  return icon ? weatherTypes[icon] : null;
}


// weather_req_url = "https://api.darksky.net/forecast/%s/%s,%s?lang=%s&units=%s&exclude=%s" % (darksky_key, latitude, longitude, weather_lang, weather_unit, exclude)

