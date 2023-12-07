import { useEffect, useState } from 'react';

const WEATHER_ENDPOINT_URI = 'https://api.weather.gov/gridpoints/SGX/55,22/forecast/hourly?units=us';

const WeatherWidget = () => {
  const [weatherData, setWeatherData] = useState(null);

  useEffect(() => {
    fetch(WEATHER_ENDPOINT_URI)
      .then((res) => res.json())
      .then((body) => 
        setWeatherData(body.properties.periods[0])
      )
      .catch(() => null);
  }, []);

  if (weatherData == null) return null;

  const {
    temperature,
    temperatureUnit,
    isDaytime,
    shortForecast,
    windSpeed,
    windDirection,
    relativeHumidity,
    probabilityOfPrecipitation,
  } = weatherData;

  const colorTheme = shortForecast.toLowerCase().includes('sunny')
    ? 'sunny'
    : isDaytime
      ? 'cloudy'
      : 'dark';

  return (
    <section className='weather-widget' data-theme={ colorTheme }>
      <ul>
        <li>{ temperature }°{ temperatureUnit }</li>
        <li>{ shortForecast }</li>
        <li>Wind: { windSpeed } { windDirection }</li>
        <li>Humidity: { relativeHumidity.value }%</li>
        <li>Chance of rain (this hour): { probabilityOfPrecipitation.value }%</li>
      </ul>
    </section>
  );
};

export default WeatherWidget;