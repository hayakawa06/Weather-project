let form = document.querySelector('.form__header');
let input = document.querySelector('.header__search-inp');
let searchError = document.querySelector('.header__search-error');



form.addEventListener('submit', (e)=>{
	e.preventDefault();
	getLatLon(input.value);
})

const API_Key ='aa30f672baebc35488b12a677ce43ed0';
 
let prewCity;
let prewCountry;
let prewImg;
let prewTemp;


async function getLatLon(city){
	let resolveFetch = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${city}&appid=${API_Key}`);
	resolveFetch = await resolveFetch.json();
	resolveFetch = resolveFetch[0];

	searchError.style.display = 'none';
	if (!resolveFetch) {
		searchError.style.display = 'block';
	}
	document.querySelector('.header__location-txt').textContent = resolveFetch.name;	
	
	console.log(resolveFetch);


	weatherTodayTomorrow(resolveFetch.lat, resolveFetch.lon , city);
	weatherOutSixDays(resolveFetch.lat, resolveFetch.lon, resolveFetch.name, resolveFetch.country);
	newMap(resolveFetch.lat, resolveFetch.lon);

	prewCity = resolveFetch.name;
	prewCountry = resolveFetch.country; 


}
weatherTodayTomorrow();
weatherOutSixDays();


async function weatherTodayTomorrow( lat=40.6700, lon=-73.9400,){
	let apiTodayTomorrow = await fetch(`https://api.open-meteo.com/v1/forecast?timezone=auto&latitude=${lat}&longitude=${lon}&hourly=temperature_2m,winddirection_10m,relativehumidity_2m,pressure_msl,uv_index,apparent_temperature,precipitation_probability,rain,snowfall,weathercode,surface_pressure,cloudcover,windspeed_10m&current_weather=true&forecast_days=2`);
		
	apiTodayTomorrow = await apiTodayTomorrow.json();
	console.log(apiTodayTomorrow);

	///вывести время
	let nodeTime = document.querySelector('.today__time');
	let time = new Date();
	let fullTime = `${time.getHours()}:${time.getMinutes()}`;
	nodeTime.textContent = fullTime;
	/// иконка сегодня Параметры
	function getMostBigShow(arr, out,typeCont){
		let counter = 0;

		for (let i = 0; i < arr.length; i++) {
			if(counter < arr[i]){
				counter = arr[i];
			}
		}	
		out.textContent = Math.round(counter)  + typeCont;
	}

	let nodeTodayHumidity = document.querySelector('.today__humidity-out');
	let todayHumidity = apiTodayTomorrow.hourly.relativehumidity_2m.slice(0,24);

	getMostBigShow(todayHumidity,nodeTodayHumidity,' %');
	
	let nodePressure = document.querySelector('.today__pressure-out');
	let todayPressure = apiTodayTomorrow.hourly.pressure_msl.slice(0,24);

	getMostBigShow(todayPressure,nodePressure,' hPa');
	
	let nodeWind = document.querySelector('.today__wind-out');
	let todayWind = apiTodayTomorrow.hourly.windspeed_10m.slice(0,24);

	getMostBigShow(todayWind,nodeWind,' km/h');
	getAirQuality(lat, lon);

	chanceRain(apiTodayTomorrow.hourly.precipitation_probability.slice(0,30));
	chanceRainMobile(apiTodayTomorrow.hourly.precipitation_probability.slice(0,30));


	let sunriseSunset = await setSunriceSunset(apiTodayTomorrow.timezone);
	fillTodayAndTomorrowBasic(sunriseSunset.daily.sunset, sunriseSunset.daily.sunrise, apiTodayTomorrow.hourly.apparent_temperature, apiTodayTomorrow.hourly.temperature_2m, apiTodayTomorrow.hourly.weathercode);

	fillForecastHourly(apiTodayTomorrow.hourly.weathercode, apiTodayTomorrow.hourly.temperature_2m);
	todayHumidityAndCloud(apiTodayTomorrow.hourly.relativehumidity_2m, apiTodayTomorrow.hourly.cloudcover);
	
	todayWindAndUvInd(apiTodayTomorrow.hourly.winddirection_10m, apiTodayTomorrow.hourly.windspeed_10m, apiTodayTomorrow.hourly.uv_index);

	fillForecastHourlyTomorrow(apiTodayTomorrow.hourly.weathercode, apiTodayTomorrow.hourly.temperature_2m);


}

async function weatherOutSixDays( lat=40.6700, lon=-73.9400){
	let apiNextSevenDays = await fetch(`https://api.open-meteo.com/v1/forecast?timezone=auto&forecast_days=7&latitude=${lat}&longitude=${lon}&daily=weathercode,winddirection_10m_dominant,temperature_2m_max,apparent_temperature_max,sunrise,sunset,uv_index_max,precipitation_sum,rain_sum,showers_sum,snowfall_sum,precipitation_probability_mean,windspeed_10m_max&current_weather=true`);
		
	apiNextSevenDays = await apiNextSevenDays.json();
	console.log(apiNextSevenDays);
		
	let apiPressure = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_Key}`)
	apiPressure = await apiPressure.json();

	
	///Мини иконка сегодняшнего дня
	
	let nodeTodayTempReal = document.querySelector('.today__real-temp-out');
	nodeTodayTempReal.textContent = Math.ceil(apiNextSevenDays.daily.temperature_2m_max.slice(0,1)[0]) + "°";

	let allWeatherCode = document.querySelectorAll('.day__img');
	let allApparentTemp = document.querySelectorAll('.day__temp-node')

	for(let i =0; i < apiNextSevenDays.daily.weathercode.length; i++){

		allWeatherCode[i].setAttribute('src',`./weather-ico/1/${apiNextSevenDays.daily.weathercode[i]}.svg`);
		allApparentTemp[i].textContent =  Math.ceil(apiNextSevenDays.daily.apparent_temperature_max[i]) + '°';
	};

	prewImg = `./weather-ico/1/${apiNextSevenDays.daily.weathercode[0]}.svg`;
	prewTemp = Math.ceil(apiNextSevenDays.daily.apparent_temperature_max[0]) + '°';

	tomorrowWindAndUvInd(apiNextSevenDays.daily.winddirection_10m_dominant, apiNextSevenDays.daily.windspeed_10m_max, apiNextSevenDays.daily.uv_index_max);
	
	setTempWeatherCodeTommorow(apiNextSevenDays.daily.apparent_temperature_max, apiNextSevenDays.daily.temperature_2m_max, apiNextSevenDays.daily.weathercode, lat,lon);

	madeHistoryItem(prewCity, prewCountry, prewTemp, prewImg);
}

function madeHistoryItem(city='New York', country='US', temp , img ){
	let out = document.querySelector('.history__items');
	let empty = document.querySelector('.history__empty');

	empty.style.display = 'none';



	let block = document.createElement('div');
	block.className = 'history__item activity__element';
	block.innerHTML = 
	`
		<div class="history__item-location">
			<div class="item__location-contry">${country}</div>
			<div class="item__location-citi">${city}</div>
		</div>
		<div class="history__item-weather">
			<div class="item-weather-block"><img class="item-weather-img" src="${img}" alt="" srcset=""></div>
			<div class="item-weather-temp cubic-txt">${temp}</div>
		</div>
	`;
	out.append(block);
	let nodeAllCitys = document.querySelectorAll('.item__location-citi');
	let nodeLastCity = nodeAllCitys[nodeAllCitys.length - 1];
	let nodePrewLastCity = nodeAllCitys[nodeAllCitys.length - 2];
	
	nodePrewLastCity = nodePrewLastCity.textContent;
	nodeLastCity = nodeLastCity.textContent;

	if(nodePrewLastCity == nodeLastCity){
		out.removeChild(block);
	}
	
}
function chanceRain(arr){

	let realTime = new Date();
	realTime = realTime.getHours() ;
	
	let times = document.querySelectorAll('.value__time');
	let lines = document.querySelectorAll('.value__line');


	let counter = 0; 
	for( let i =0; i < 6; i++ ){
		if(realTime + i < 25){
			times[i].textContent = realTime + i;
			lines[i].style.height =  50 + arr[realTime + i]  + 'px';
		}
		else{
			counter++
			times[i].textContent = counter;
			lines[i].style.height =  50 + arr[realTime + i]  + 'px';
		}
	}
}
function chanceRainMobile(arr){

	let realTime = new Date();
	realTime = realTime.getHours() ;
	
	let times = document.querySelectorAll('.value__time-mobile');
	let lines = document.querySelectorAll('.value__line-mobile');

	let counter = 0; 
	for( let i =0; i < 6; i++ ){
		if(realTime + i < 25){
			times[i].textContent = realTime + i;
			lines[i].style.height =  15 + arr[realTime + i]  + 'px';
		}
		else{
			counter++
			times[i].textContent = counter;
			lines[i].style.height =  15 + arr[realTime + i]  + 'px';
		}
	}
}


function fillForecastHourly(weatherCode, temp){
	const nodeHourlyForecast = document.querySelector('.tg__hourly-today'); 
	const nodeTime = document.querySelectorAll('.today__hour-time'); 
	const nodeImg = document.querySelectorAll('.today__hour-wether'); 
	const nodeTemp = document.querySelectorAll('.today__hour-temp'); 

	for(let i=0; i < nodeHourlyForecast.children.length; i++ ){

		// Время
		nodeTime[i].textContent = i + ':00';

		// Картинка погоды
		nodeImg[i].innerHTML = `
		<img src="./weather-ico/1/${weatherCode[i]}.svg" alt="">
		`;

		// Температура
		nodeTemp[i].textContent = Math.round(temp[i]) +'°';
	}
}

function fillForecastHourlyTomorrow(weatherCode, temp){
	const nodeTime = document.querySelectorAll('.tomorrow__hour-time'); 
	const nodeImg = document.querySelectorAll('.tomorrow__hour-wether'); 
	const nodeTemp = document.querySelectorAll('.tomorrow__hour-temp'); 


	let counter = 0;
	for(let i = 23; i < 48; i++){
		
 		// Время
		nodeTime[counter].textContent = counter + ':00';

		// Картинка погоды
		nodeImg[counter].innerHTML = `
		<img src="./weather-ico/1/${weatherCode[i]}.svg" alt="">
		`;

		// Температура
		nodeTemp[counter].textContent = Math.round(temp[i]) +'°';
		counter++;
	}
	

}

function todayWindAndUvInd(arrWindDirec, arrWind, arrUvIndex){

	const nodeWindSpeed = document.querySelector('.td__wind-speed');
	const nodeWindDirection = document.querySelector('.td__wind-direction');
	const nodeWindDirectionImg = document.querySelector('.td__wind-arrow');


	let time = new Date();
	time = time.getHours();

	
	nodeWindSpeed.textContent ='Speed: ' + Math.round(arrWind[time]) + 'km/h';
	nodeWindDirectionImg.style.transform = `rotate(${arrWindDirec[time]}deg)`;

	let outWindDirec;
	let direcWind = arrWindDirec[time];

	if(direcWind <= 22) outWindDirec = 'Direction: N';
	if(22 < direcWind && direcWind <= 67) outWindDirec = 'Direction: N/W';
	if(67 < direcWind && direcWind <= 112) outWindDirec = 'Direction: W';
	if(113 < direcWind && direcWind <= 157) outWindDirec = 'Direction: W/E';
	if(157 < direcWind && direcWind <= 202) outWindDirec = 'Direction: E';
	if(202 < direcWind && direcWind <= 247) outWindDirec = 'Direction: E/S';
	if(247 < direcWind && direcWind <= 292) outWindDirec = 'Direction: S';
	if(292 < direcWind && direcWind <= 337) outWindDirec = 'Direction: S/N';
	if(337 < direcWind && direcWind <= 359) outWindDirec = 'Direction: N';
	nodeWindDirection.textContent = outWindDirec;


	const nodeUvInd = document.querySelector('.uv__index-box-circle');
	document.querySelector('.uv__index-out').textContent = Math.round(arrUvIndex[time]);

	
	setCircle('.uv__index-box-circle', arrUvIndex[time], 12);

	if(arrUvIndex[time] < 3) nodeUvInd.style.stroke = '#4ee512';
	if(arrUvIndex[time] > 2) nodeUvInd.style.stroke = '#e5da12';
	if(arrUvIndex[time] > 5) nodeUvInd.style.stroke = '#fcb613';
	if(arrUvIndex[time] > 7) nodeUvInd.style.stroke = '#e51212';
	if(arrUvIndex[time] > 11) nodeUvInd.style.stroke = '#ff00e6';

}

function todayHumidityAndCloud(humidity, cloud){
	let time = new Date();
	time = time.getHours();

	const nodeCloudCover = document.querySelector('.cloud__out');
	const nodeHumidity = document.querySelector('.humidity-out');

	const nodeCloudCoverTomorrow = document.querySelector('.cloud__out-tomorrow');
	const nodeHumidityTomorrow = document.querySelector('.humidity-out-tomorrow');

	nodeCloudCover.textContent = cloud[time] + '%';
	nodeHumidity.textContent = humidity[time] + '%';

	
	nodeCloudCoverTomorrow.textContent = cloud[time+24] + '%';
	nodeHumidityTomorrow.textContent = humidity[time+24] + '%';

	setCircle('.humidity-box-circle', humidity[time], 100);
	setCircle('.cloud__box-circle', cloud[time], 100);

	setCircle('.humidity-box-circle-tomorrow', humidity[time+24], 100);
	setCircle('.cloud__box-circle-tomorrow', cloud[time+24], 100);
}

function tomorrowWindAndUvInd(arrWindDirec, arrWind, arrUvIndex){
	const nodeWindSpeedTomorrow = document.querySelector('.tm__wind-speed');
	const nodeWindDirectionTomorrow = document.querySelector('.tm__wind-direction');
	const nodeWindDirectionImgTomorrow = document.querySelector('.tm__wind-arrow');

	let time = new Date();
	time = time.getHours();

	nodeWindSpeedTomorrow.textContent ='Speed: ' + Math.round(arrWind[1]) + 'km/h';
	nodeWindDirectionImgTomorrow.style.transform = `rotate(${arrWindDirec[1]}deg)`;


	let outWindDirec;
	let direcWind = arrWindDirec[1];

	if(direcWind <= 22) outWindDirec = 'Direction: N';
	if(22 < direcWind && direcWind <= 67) outWindDirec = 'Direction: N/W';
	if(67 < direcWind && direcWind <= 112) outWindDirec = 'Direction: W';
	if(113 < direcWind && direcWind <= 157) outWindDirec = 'Direction: W/E';
	if(157 < direcWind && direcWind <= 202) outWindDirec = 'Direction: E';
	if(202 < direcWind && direcWind <= 247) outWindDirec = 'Direction: E/S';
	if(247 < direcWind && direcWind <= 292) outWindDirec = 'Direction: S';
	if(292 < direcWind && direcWind <= 337) outWindDirec = 'Direction: S/N';
	if(337 < direcWind && direcWind <= 359) outWindDirec = 'Direction: N';
	nodeWindDirectionTomorrow.textContent = outWindDirec;

	const nodeUvIndTomorrow = document.querySelector('.uv__index-box-circle-tomorrow');
	document.querySelector('.uv__index-out-tomorrow').textContent = Math.round(arrUvIndex[1]);

	setCircle('.uv__index-box-circle-tomorrow', arrUvIndex[1], 12);

	if(arrUvIndex[1] < 3) nodeUvIndTomorrow.style.stroke = '#4ee512';
	if(arrUvIndex[1] > 2) nodeUvIndTomorrow.style.stroke = '#e5da12';
	if(arrUvIndex[1] > 5) nodeUvIndTomorrow.style.stroke = '#fcb613';
	if(arrUvIndex[1] > 7) nodeUvIndTomorrow.style.stroke = '#e51212';
	if(arrUvIndex[1] > 11) nodeUvIndTomorrow.style.stroke = '#ff00e6';

}

async function setSunriceSunset(timezone){
	let result = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&daily=sunrise,sunset&timezone=${timezone}`);
	result = await result.json();
 	console.log(result);
	return result;
}

function fillTodayAndTomorrowBasic(sunset, sunrise, tempApparent, temp, weatherCode){
	let time = new Date();
	let hour = time.getHours();
	let minutes = time.getMinutes();

	const nodeTempToday = document.querySelector('.td__basic-temp');
	const nodeTimeToday = document.querySelector('.tg__basic-time');
	const nodeImgToday = document.querySelector('.td__basic-img');
	const nodeRealTempToday = document.querySelector('.td__basic-realtemp');

	const nodeSunriseToday = document.querySelector('.td__basic-sunrise');
	const nodeSunriseTodayMobile = document.querySelector('.mobile__td-sunrise');

	const nodeSunriseTomorrow = document.querySelector('.tm__basic-sunrise');
	const nodeSunriseTomorrowMobile = document.querySelector('.mobile__tm-sunrise');

	const nodeSunsetToday = document.querySelector('.td__basic-sunset');
	const nodeSunsetTodayMobile = document.querySelector('.mobile__td-sunset');

	const nodeSunsetTomorrow = document.querySelector('.tm__basic-sunset');
	const nodeSunsetTomorrowMobile = document.querySelector('.mobile__tm-sunset');


	const nodeTempTodayMobile = document.querySelector('.mobile__td-temp');
	const nodeRealTempTodayMobile = document.querySelector('.mobile__td-realtemp');
	const nodeImgTodayMobile = document.querySelector('.basic-mobile-img');

	let strSunsetToday = sunset[3];	
	let strSunsetTomorrow = sunset[4];

	let strSunriseToday = sunrise[3];	
	let strSunriseTomorrow = sunrise[4];

	strSunsetToday= strSunsetToday.slice(-5);
	strSunsetTomorrow= strSunsetTomorrow.slice(-5);

	strSunriseToday= strSunriseToday.slice(-4);
	strSunriseTomorrow= strSunriseTomorrow.slice(-4);


	nodeSunriseToday.innerHTML = `Sunrise <span>${strSunriseToday}</span>`;
	nodeSunriseTomorrow.innerHTML = `Sunrise <span>${strSunriseTomorrow}</span>`;
	nodeSunriseTodayMobile.textContent = strSunriseToday;
	nodeSunriseTomorrowMobile.textContent = strSunriseTomorrow;

	nodeSunsetToday.innerHTML = `Sunset <span>${strSunsetToday}</span>`;
	nodeSunsetTomorrow.innerHTML = `Sunset <span>${strSunsetTomorrow}</span>`;
	nodeSunsetTodayMobile.textContent = strSunsetToday;
	nodeSunsetTomorrowMobile.textContent = strSunsetTomorrow;

	nodeRealTempToday.innerHTML = `Real Feel <span>${Math.round(tempApparent[hour])}°</span>`;
	nodeTempToday.textContent = Math.round(temp[hour]) + '°';

	nodeRealTempTodayMobile.textContent = Math.round(tempApparent[hour]) + '°';
	nodeTempTodayMobile.textContent = Math.round(temp[hour]) + '°';

	nodeImgTodayMobile.innerHTML = `<img src="./weather-ico/1/${weatherCode[hour]}.svg">`;
	nodeImgToday.innerHTML = `<img src="./weather-ico/1/${weatherCode[hour]}.svg">`;
	nodeTimeToday.textContent = hour +':'+ minutes; 

}

async function setTempWeatherCodeTommorow(tempApparent, temp, weatherCode, lat,lon){
	const nodeApparentTempTomorrow = document.querySelector('.tm__basic-temp');
	const nodeTempTomorrow = document.querySelector('.tm__basic-realtemp');
	const nodeImgTomorrow  = document.querySelector('.tm__basic-img');

	nodeApparentTempTomorrow.textContent = Math.round(tempApparent[1]) + '°';
	nodeTempTomorrow.innerHTML = `Real Feel <span>${Math.round(temp[1])}°</span>`;
	nodeImgTomorrow.innerHTML = `<img src="./weather-ico/1/${weatherCode[1]}.svg" alt="" srcset="">`;

	const nodeTempTomorrowMobile = document.querySelector('.mobile__tm-temp');
	const nodeRealTempTomorrowMobile = document.querySelector('.mobile__tm-realtemp');
	const nodeImgTomorrowMobile = document.querySelector('.basic-mobile-img-tm');
	
	nodeRealTempTomorrowMobile.textContent = Math.round(temp[1]) + '°';
	nodeTempTomorrowMobile.textContent = Math.round(tempApparent[1]) + '°';
	nodeImgTomorrowMobile.innerHTML = `<img src="./weather-ico/1/${weatherCode[1]}.svg" alt="" srcset="">`;
}


async function getAirQuality(lat, lon){
	let responce = await fetch(`https://api.api-ninjas.com/v1/airquality?lat=${lat}&lon=${lon}`, {
    	method: 'GET',
    	headers: { 'X-Api-Key': 'a4zEhag4kJ/Ms5ZcTgC5ow==nX0LZBkNqxlDK6Qk'},
    	contentType: 'application/json',
	});
	responce = await responce.json();

	fillAirOverall(responce.overall_aqi);
	fillParametrsAirQuality(responce);
	console.log(responce);
}
function fillAirOverall(data){
	const overallQality = document.querySelector('.air__aqi-index');
	const overallCircle = document.querySelector('.air__svg-ind');
	overallQality.textContent = data;	
	setCircle('.air__svg-ind', data, 500);

	if(data < 50){
		document.querySelector('.air__aqi-value').textContent ='Good';
		overallCircle.style.stroke = '#00FF38';
	}  
	if(50 < data && data <= 100){
		document.querySelector('.air__aqi-value').textContent = 'Fair';
		overallCircle.style.stroke = '#00FF38';
	}  
	if(100 < data && data <= 150){
		document.querySelector('.air__aqi-value').textContent = 'Moderate';
		overallCircle.style.stroke = '#b3ff00';
	}  
	if(150 < data && data <= 200){
		document.querySelector('.air__aqi-value').textContent = 'Poor'; 
		overallCircle.style.stroke = '#ff7700';
	} 
	if(200 < data && data <= 300){
		document.querySelector('.air__aqi-value').textContent = 'Very Poor'; 
		overallCircle.style.stroke = '#ff0000';
	} 
	if(data > 300){
		document.querySelector('.air__aqi-value').textContent = 'Hazardous'; 
		overallCircle.style.stroke = '#8c00ff';
	} 

}
async function fillParametrsAirQuality(data){
	const allNodesConcentrat = document.querySelectorAll('.quality__element-volume');
	const allNodesAQI = document.querySelectorAll('.quality__title');
	const allNodesOptions = document.querySelectorAll('.quality__element-value');
	console.log(allNodesConcentrat);
	
	let arrData = [data['PM2.5'], data['O3'], data['PM10'], data['NO2'], data['SO2'], data['CO']];
	for (let i = 0; i < allNodesConcentrat.length; i++) {
		allNodesConcentrat[i].innerHTML = arrData[i].concentration + ' μg/m<span>3</span>';
	}
	let arrAirOptions = [];
	for (let i = 0; i < allNodesAQI.length; i++) {
		if(i==0){
			allNodesAQI[i].textContent = arrData[i].aqi;
			setCircle('.quality__svg-ind-pm1', arrData[i].aqi, 75);
			let color;
			if(arrData[i].aqi <= 25){
				color = '#00FF38'; 
				arrAirOptions.push('Good');
			} 
			if(arrData[i].aqi > 25 && arrData[i].aqi <= 50){
				color = '#b3ff00'; 
				arrAirOptions.push('Moderate');
			} 
			if(arrData[i].aqi > 50){
				color = '#ff0000'; 
				arrAirOptions.push('Poor');
			} 
			document.querySelector('.quality__svg-ind-pm1').style.stroke = color;
			allNodesOptions[i].style.color = color;
		}
		if(i==1){
			allNodesAQI[i].textContent = arrData[i].aqi;
			setCircle('.quality__svg-ind-o', arrData[i].aqi, 180);
			let color;
			if(arrData[i].aqi <= 100){
				color = '#00FF38'; 
				arrAirOptions.push('Good');
			} 
			if(arrData[i].aqi > 100 && arrData[i].aqi <= 140){
				color = '#b3ff00'; 
				arrAirOptions.push('Moderate');
			}  
			if(arrData[i].aqi > 140){
				color = '#ff0000'; 
				arrAirOptions.push('Poor');
			}  
			document.querySelector('.quality__svg-ind-o').style.stroke = color;
			allNodesOptions[i].style.color = color;
		}
		if(i==2){
			allNodesAQI[i].textContent = arrData[i].aqi;
			setCircle('.quality__svg-ind-pm2', arrData[i].aqi, 200);
			let color;
			if(arrData[i].aqi <= 50){
				color = '#00FF38'; 
				arrAirOptions.push('Good');
			}  
			if(arrData[i].aqi > 50 && arrData[i].aqi <= 100){
				color = '#b3ff00'; 
				arrAirOptions.push('Moderate');
			} 
			if(arrData[i].aqi > 100){
				color = '#ff0000'; 
				arrAirOptions.push('Poor');
			}  
			document.querySelector('.quality__svg-ind-pm2').style.stroke = color;
			allNodesOptions[i].style.color = color;
		}
		if(i==3){
			allNodesAQI[i].textContent = arrData[i].aqi;
			setCircle('.quality__svg-ind-no', arrData[i].aqi, 200);
			let color;
			if(arrData[i].aqi <= 70){
				color = '#00FF38'; 
				arrAirOptions.push('Good');
			} 
			if(arrData[i].aqi > 70 && arrData[i].aqi <= 150){
				color = '#b3ff00'; 
				arrAirOptions.push('Moderate');
			} 
			if(arrData[i].aqi > 150){
				color = '#ff0000'; 
				arrAirOptions.push('Poor');
			}  
			document.querySelector('.quality__svg-ind-no').style.stroke = color;
			allNodesOptions[i].style.color = color;
		}
		if(i==4){
			allNodesAQI[i].textContent = arrData[i].aqi;
			setCircle('.quality__svg-ind-so', arrData[i].aqi, 350);
			let color;
			if(arrData[i].aqi <= 80){
				color = '#00FF38'; 
				arrAirOptions.push('Good');
			} 
			if(arrData[i].aqi > 80 && arrData[i].aqi <= 250){
				color = '#b3ff00'; 
				arrAirOptions.push('Moderate');
			} 
			if(arrData[i].aqi > 250){
				color = '#ff0000'; 
				arrAirOptions.push('Poor');
			}  
			document.querySelector('.quality__svg-ind-so').style.stroke = color;
			allNodesOptions[i].style.color = color;
		}
		if(i==5){
			allNodesAQI[i].textContent = arrData[i].aqi;
			setCircle('.quality__svg-ind-co', arrData[i].aqi, 15400);
			let color;
			if(arrData[i].aqi <= 9400){
				color = '#00FF38'; 
				arrAirOptions.push('Good');
			} 
			if(arrData[i].aqi > 9400 && arrData[i].aqi <= 12400){
				color = '#b3ff00'; 
				arrAirOptions.push('Moderate');
			} 
			if(arrData[i].aqi > 12400){
				color = '#ff0000'; 
				arrAirOptions.push('Poor');
			} 
			document.querySelector('.quality__svg-ind-co').style.stroke = color;
			allNodesOptions[i].style.color = color;
		}
		allNodesOptions[i].textContent = arrAirOptions[i];
	}
	console.log(arrAirOptions);
	console.log(arrData);
	
}

function outWeekEn(){
	let arrWeek = [ 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday','Sunday'];

	let today = new Date().getDay();
	
	let outWeek = arrWeek.slice(today-1,);
	let temporaryArr = arrWeek.slice(0,today-1);

	for (let i = 0; i < temporaryArr.length; i++) {
		outWeek.push(temporaryArr[i]);
	}
	let daysWeek = document.querySelectorAll('.day__week');
	
	for (let i = 0; i < daysWeek.length; i++) {
		if(i != 0){
			outWeek[i] = outWeek[i].slice(0,3);

			daysWeek[i].innerHTML = outWeek[i];
		}
		daysWeek[i].innerHTML = outWeek[i];
	}
}

outWeekEn();

google.maps.event.addDomListener(window, 'load', init);
function init() {

	var mapOptions = {

			zoom: 11,

			center: new google.maps.LatLng(40.6700, -73.9400), 

			// styles: [{"featureType":"all","elementType":"geometry.fill","stylers":[{"color":"#323232"}]},{"featureType":"all","elementType":"labels","stylers":[{"visibility":"on"}]},{"featureType":"all","elementType":"labels.text.fill","stylers":[{"saturation":36},{"color":"#ffffff"},{"lightness":40}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"visibility":"on"},{"color":"#000000"},{"lightness":16}]},{"featureType":"all","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#000000"},{"lightness":20}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#000000"},{"lightness":17},{"weight":1.2}]},{"featureType":"administrative.locality","elementType":"labels.text.fill","stylers":[{"color":"#c4c4c4"}]},{"featureType":"administrative.neighborhood","elementType":"labels.text.fill","stylers":[{"color":"#707070"}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":20}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":21},{"visibility":"on"}]},{"featureType":"poi.business","elementType":"geometry","stylers":[{"visibility":"on"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#be2026"},{"lightness":"0"},{"visibility":"on"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"visibility":"off"}]},{"featureType":"road.highway","elementType":"labels.text.fill","stylers":[{"visibility":"off"}]},{"featureType":"road.highway","elementType":"labels.text.stroke","stylers":[{"visibility":"off"},{"hue":"#ff000a"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":18}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#575757"}]},{"featureType":"road.arterial","elementType":"labels.text.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"road.arterial","elementType":"labels.text.stroke","stylers":[{"color":"#2c2c2c"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":16}]},{"featureType":"road.local","elementType":"labels.text.fill","stylers":[{"color":"#999999"}]},{"featureType":"road.local","elementType":"labels.text.stroke","stylers":[{"saturation":"-52"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":19}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":17}]},{"featureType":"water","elementType":"geometry.fill","stylers":[{"color":"#1b1b1d"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"color":"#ffffff"}]}]
	};

	var mapElement = document.querySelector('.map__window');

	var map = new google.maps.Map(mapElement, mapOptions);

	var marker = new google.maps.Marker({
		position: new google.maps.LatLng(40.6700, -73.9400),
		map: map,
		title: 'Snazzy!'
	});
	mapElement.childNodes[0].style.zIndex = 100;
}     
init();
function newMap(lat, lon) {

	var mapOptions = {

			zoom: 11,

			center: new google.maps.LatLng(lat, lon), 

			// styles: [{"featureType":"all","elementType":"geometry.fill","stylers":[{"color":"#323232"}]},{"featureType":"all","elementType":"labels","stylers":[{"visibility":"on"}]},{"featureType":"all","elementType":"labels.text.fill","stylers":[{"saturation":36},{"color":"#ffffff"},{"lightness":40}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"visibility":"on"},{"color":"#000000"},{"lightness":16}]},{"featureType":"all","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#000000"},{"lightness":20}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#000000"},{"lightness":17},{"weight":1.2}]},{"featureType":"administrative.locality","elementType":"labels.text.fill","stylers":[{"color":"#c4c4c4"}]},{"featureType":"administrative.neighborhood","elementType":"labels.text.fill","stylers":[{"color":"#707070"}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":20}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":21},{"visibility":"on"}]},{"featureType":"poi.business","elementType":"geometry","stylers":[{"visibility":"on"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#be2026"},{"lightness":"0"},{"visibility":"on"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"visibility":"off"}]},{"featureType":"road.highway","elementType":"labels.text.fill","stylers":[{"visibility":"off"}]},{"featureType":"road.highway","elementType":"labels.text.stroke","stylers":[{"visibility":"off"},{"hue":"#ff000a"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":18}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#575757"}]},{"featureType":"road.arterial","elementType":"labels.text.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"road.arterial","elementType":"labels.text.stroke","stylers":[{"color":"#2c2c2c"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":16}]},{"featureType":"road.local","elementType":"labels.text.fill","stylers":[{"color":"#999999"}]},{"featureType":"road.local","elementType":"labels.text.stroke","stylers":[{"saturation":"-52"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":19}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":17}]},{"featureType":"water","elementType":"geometry.fill","stylers":[{"color":"#1b1b1d"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"color":"#ffffff"}]}]
	};

	var mapElement = document.querySelector('.map__window');

	var map = new google.maps.Map(mapElement, mapOptions);

	var marker = new google.maps.Marker({
		position: new google.maps.LatLng(lat, lon),
		map: map,
		title: 'Snazzy!'
	});
	mapElement.childNodes[0].style.zIndex = 100;
}  

(function() {
    function scrollHorizontally(e) {
        e = window.event || e;
        var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
        document.querySelector('.days').scrollLeft -= (delta*10); 
        e.preventDefault();
    }
    if (document.querySelector('.days').addEventListener) {
        // IE9, Chrome, Safari, Opera
        document.querySelector('.days').addEventListener("mousewheel", scrollHorizontally, false);
        // Firefox
        document.querySelector('.days').addEventListener("DOMMouseScroll", scrollHorizontally, false);
    } else {
        // IE 6/7/8
        document.querySelector('.days').attachEvent("onmousewheel", scrollHorizontally);
    }

})();

(function() {

    function scrollHorizontally(e) {
        e = window.event || e;
        var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
        document.querySelector('.tg__hourly-today').scrollLeft -= (delta*10); 
        e.preventDefault();
    }
    if (document.querySelector('.tg__hourly-today').addEventListener) {
        // IE9, Chrome, Safari, Opera
        document.querySelector('.tg__hourly-today').addEventListener("mousewheel", scrollHorizontally, false);
        // Firefox
        document.querySelector('.tg__hourly-today').addEventListener("DOMMouseScroll", scrollHorizontally, false);
    } else {
        // IE 6/7/8
        document.querySelector('.tg__hourly-today').attachEvent("onmousewheel", scrollHorizontally);
    }

})();

function setCircle(circle, procent, max){
	const circleUvInd = document.querySelector(circle);
	const circleUvRadius = circleUvInd.r.baseVal.value;
	const circleLenth = 2 * Math.PI * circleUvRadius;

	circleUvInd.style.strokeDasharray = `${circleLenth} ${circleLenth}`;
	circleUvInd.style.strokeDashoffset = circleLenth;

	function setProcCircle(proc){

		const offset = circleLenth - proc / max * circleLenth;
		circleUvInd.style.strokeDashoffset = offset;
	}
	setProcCircle(procent);
}


(function(){
	const switchTodayBtn = document.querySelector('.weather__top-today');
	const switchTomorrowBtn = document.querySelector('.weather__top-tomorrow');
	const switchNext7Btn = document.querySelector('.weather__top-next');

	const switchTodayBtnMobile = document.querySelector('.weather__top-today-mobile');
	const switchTomorrowBtnMobile = document.querySelector('.weather__top-tomorrow-mobile');
	const switchNext7BtnMobile = document.querySelector('.weather__top-next-mobile');

	const contantDays = document.querySelector('.weather__days');
	const contantToday = document.querySelector('.weather__today');
	const contantTomorrow = document.querySelector('.weather__tomorrow');

	const history = document.querySelector('.history__items');
	
	switchTodayBtn.addEventListener('click', ()=>{
		contantToday.style.display = 'flex';
		contantDays.style.display = 'none';	
		contantTomorrow.style.display = 'none';	
		history.style.maxHeight = '485px';

		switchTodayBtn.style.color = '#fff';
		switchNext7Btn.style.color = '#818085';
		switchTomorrowBtn.style.color = '#818085';
	});
	switchTodayBtnMobile.addEventListener('click', ()=>{
		contantToday.style.display = 'flex';
		contantDays.style.display = 'none';	
		contantTomorrow.style.display = 'none';	

		

		switchTodayBtnMobile.style.color = '#fff';
		switchNext7BtnMobile.style.color = '#818085';
		switchTomorrowBtnMobile.style.color = '#818085';
	});

	switchNext7Btn.addEventListener('click', ()=>{
		contantToday.style.display = 'none';
		contantTomorrow.style.display = 'none';
		contantDays.style.display = 'block';
		history.style.maxHeight = '275px';		


		switchTodayBtn.style.color = '#818085';
		switchTomorrowBtn.style.color = '#818085';
		switchNext7Btn.style.color = '#fff';
	});
	switchNext7BtnMobile.addEventListener('click', ()=>{
		contantToday.style.display = 'none';
		contantTomorrow.style.display = 'none';
		contantDays.style.display = 'block';


		switchTodayBtnMobile.style.color = '#818085';
		switchTomorrowBtnMobile.style.color = '#818085';
		switchNext7BtnMobile.style.color = '#fff';
	});

	switchTomorrowBtn.addEventListener('click', ()=>{
		contantToday.style.display = 'none';
		contantTomorrow.style.display = 'flex';
		contantDays.style.display = 'none';
		history.style.maxHeight = '485px';

		switchTodayBtn.style.color = '#818085';
		switchTomorrowBtn.style.color = '#fff';
		switchNext7Btn.style.color = '#818085';
	});
	switchTomorrowBtnMobile.addEventListener('click', ()=>{
		contantToday.style.display = 'none';
		contantTomorrow.style.display = 'flex';
		contantDays.style.display = 'none';

		switchTodayBtnMobile.style.color = '#818085';
		switchTomorrowBtnMobile.style.color = '#fff';
		switchNext7BtnMobile.style.color = '#818085';
	});

	const nodeWeatherBlock = document.querySelector('.weather__blocks');
	const nodeAirBlock = document.querySelector('.air');
	const buttonShowForecast = document.querySelector('.weather__top-forecast');
	const buttonShowAir = document.querySelector('.weather__top-air');
	const blockIndicatorBlue = document.querySelector('.weather__top-dominated');

	buttonShowAir.addEventListener('click', ()=>{

		nodeAirBlock.style.display = 'block';
		nodeWeatherBlock.style.display = 'none';
		blockIndicatorBlue.style.right = '0px';
		history.style.maxHeight = '275px';	

		buttonShowAir.style.color = '#111015';
		buttonShowForecast.style.color = '#fff';

		if(window.innerWidth >= 500){
			nodeAirBlock.style.display = 'flex';
		}
	});
	buttonShowForecast.addEventListener('click', ()=>{
		nodeAirBlock.style.display = 'none';
		nodeWeatherBlock.style.display = 'block';
		blockIndicatorBlue.style.right = '90px';

		buttonShowAir.style.color = '#fff';
		buttonShowForecast.style.color = '#111015';
	});

	const btnBurger = document.querySelector('.weather__top-img-btn');
	const burger = document.querySelector('.weather__top-left-mobile');
	const body = document.querySelector('body');
	
	btnBurger.addEventListener('click', ()=>{
		burger.classList.toggle('open');
	});

	body.addEventListener('click', (event)=>{
		if(event.target.className != 'weather__top-img-btn'){
			burger.classList.remove('open');
		}
	});

})()


