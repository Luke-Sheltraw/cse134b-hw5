const WEATHER_ENDPOINT_URI = 'https://api.weather.gov/gridpoints/SGX/55,22/forecast/hourly?units=us';

class WeatherWidget extends HTMLElement {
  _latestWeatherData;
  _contentWrapperEl;

  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
  }

  async connectedCallback() {
    /* Attach encapsulated styles */
    const weatherWidgetStyleSheet = new CSSStyleSheet();
    weatherWidgetStyleSheet.replaceSync(`
      section {
        border-radius: 2rem;
        box-shadow: 0 0 0.25rem 0.25rem #0000000f;
        display: flex;
        width: 20rem;
        height: 10rem;
        padding: 1rem;
        background: var(--background-gradient);
        background-size: 180% 180%;
        animation: gradient-animation 20s ease infinite;
        font-family: sans-serif;
        position: relative;
        overflow: hidden;
        
        --background-gradient: #ebebeb;
        --sphere-color: transparent;
        --sphere-shadow-color: transparent;
        justify-content: center;
        align-items: center;
      
        &[data-theme] {
          justify-content: flex-start;
          align-items: stretch;
        }
      
        &[data-theme="sunny"] {
          --background-gradient: linear-gradient(300deg,#ffffff,#89cff0,#b3dded); 
          --sphere-color: #ffed29;
          --sphere-shadow-color: #ffff0050;
        }
      
        &[data-theme="dark"] {
          --background-gradient: linear-gradient(300deg,#5b5b5b,#19262c,#3c4c53); 
          --sphere-color: #d1d0c2;
          --sphere-shadow-color: #d1d0c250;
        }
      
        &[data-theme="cloudy"] {
          --background-gradient: linear-gradient(300deg,#ffffff,#c1d4dd,#b3dded); 
          --sphere-color: #fff262;
          --sphere-shadow-color: #ffff0050;
      
          &::before {
            content: "";
            position: absolute;
            display: block;
            right: -1rem;
            top: 2rem;
            background-color: white;
            mask: url(../assets/images/clouds.svg);
            mask-size: contain;
            mask-repeat: no-repeat;
            mask-position: center;
            -webkit-mask: url(../assets/images/clouds.svg);
            -webkit-mask-size: contain;
            -webkit-mask-repeat: no-repeat;
            -webkit-mask-position: top right;
            width: 12rem;
            height: auto;
            aspect-ratio: 2 / 1;
            z-index: 5;
          }
        }
      
        &::after {
          content: "";
          display: block;
          position: absolute;
          top: 0;
          right: 0;
          transform: translate(30%, -40%);
          width: 12rem;
          border-radius: 50%;
          aspect-ratio: 1 / 1;
          background-color: var(--sphere-color);
          box-shadow: 0 0 0.5rem 0.5rem var(--sphere-shadow-color);
        }
      
        & ul {
          list-style-type: none;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border-radius: 1rem;
          padding: 1rem;
          margin: 0;
          color: white;
          background-color: #00000020;
          box-shadow: 0 0 0.5rem 0.25rem #00000010;
      
          & li:first-child {
            font-weight: bold;
            margin-bottom: 0.5rem;
            font-size: 1.5rem;
          }
        
          & li:nth-child(2) {
            font-weight: bold;
            margin-bottom: 0.5rem;
          }
        }
      } 
      
      @keyframes gradient-animation {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      `);
    this.shadowRoot.adoptedStyleSheets = [weatherWidgetStyleSheet];

    /* Set up wrapper and loading message */
    const loadingMsgEl = document.createElement('p');
    loadingMsgEl.innerText = 'Loading weather data';
    this._contentWrapperEl = document.createElement('section');
    this._contentWrapperEl.append(loadingMsgEl);
    this.shadowRoot.replaceChildren(this._contentWrapperEl);

    /* Fetch current weather information from API */
    this._latestWeatherData = await fetch(WEATHER_ENDPOINT_URI)
      .then((res) => res.json())
      .then((body) => 
        body.properties.periods[0]
      )
      .catch(() => null);
    if (!this._latestWeatherData) {
      loadingMsgEl.innerText = 'Weather data failed to load';
      return;
    };

    /* Destructure relevant stats */
    const {
      temperature,
      temperatureUnit,
      shortForecast,
      windSpeed,
      windDirection,
      relativeHumidity,
      probabilityOfPrecipitation,
    } = this._latestWeatherData;

    /* Build necessary elements */
    const dataListWrapperEl = document.createElement('ul');
    const temperatureItemEl = document.createElement('li');
    const summaryItemEl = document.createElement('li');
    const windItemEl = document.createElement('li');
    const humidityItemEl = document.createElement('li');
    const rainItemEl = document.createElement('li');

    /* Assign stats to corresponding elements */
    temperatureItemEl.innerText = `${ temperature }°${ temperatureUnit }`;
    summaryItemEl.innerText = shortForecast;
    windItemEl.innerText = `Wind: ${ windSpeed } ${ windDirection }`;
    humidityItemEl.innerText = `Humidity: ${ relativeHumidity.value }%`;
    rainItemEl.innerText = `Chance of rain (this hour): ${ probabilityOfPrecipitation.value }%`;

    /* Set color theme of widget */
    const curDateHours = new Date().getHours();
    this._contentWrapperEl.dataset.theme = shortForecast.toLowerCase().includes('sunny')
      ? 'sunny'
      : curDateHours > 8 && curDateHours < 20
        ? 'cloudy'
        : 'dark';

    /* Place elements into wrappers */
    dataListWrapperEl.replaceChildren(
      temperatureItemEl,
      summaryItemEl,
      windItemEl,
      humidityItemEl,
      rainItemEl,
    );
    this._contentWrapperEl.replaceChildren(dataListWrapperEl);
  }
}

window.customElements.define('weather-widget', WeatherWidget);
