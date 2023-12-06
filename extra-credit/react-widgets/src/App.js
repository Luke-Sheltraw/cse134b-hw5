import './App.css';
import RatingWidget from './components/RatingWidget.js';
import WeatherWidget from './components/WeatherWidget.js';

function App() {
  return (
    <>
      <h1>React widgets</h1>
      <h2>Rating widget</h2>
      <RatingWidget />
      <h2>Weather widget</h2>
      <WeatherWidget />
    </>
  );
}

export default App;
