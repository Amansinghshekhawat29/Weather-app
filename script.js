const apiKey = "98931e0f8bb37aef79ee4754c14d1698"; 


async function getWeatherByCity() {
  const city = document.getElementById("cityInput").value;
  if (!city) return alert("Please enter a city name.");
  getWeather(city);
}
function showLoader() {
  document.getElementById("loader").style.display = "block";
}

function hideLoader() {
  document.getElementById("loader").style.display = "none";
}


function getWeatherByLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      getWeather(null, lat, lon);
    }, () => {
      alert("Geolocation permission denied.");
    });
  } else {
    alert("Geolocation not supported.");
  }
}


async function getWeather(city = null, lat = null, lon = null) {
  const weatherBox = document.getElementById("weatherBox");
  const forecastContainer = document.getElementById("forecastContainer");

  showLoader();
  weatherBox.innerHTML = "";
  forecastContainer.innerHTML = "";

  let weatherURL = "";
  if (city) {
    weatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
  } else {
    weatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
  }

  try {
    const response = await fetch(weatherURL);
    const data = await response.json();
    const { name, main, weather, wind, coord } = data;

    weatherBox.innerHTML = `
      <h2>${name}</h2>
      <img src="https://openweathermap.org/img/wn/${weather[0].icon}@2x.png" alt="icon" />
      <p>🌡 Temp: ${main.temp}°C</p>
      <p>🌥 Condition: ${weather[0].description}</p>
      <p>💧 Humidity: ${main.humidity}%</p>
      <p>🌬 Wind: ${wind.speed} m/s</p>
    `;

    await getForecast(coord.lat, coord.lon);
  } catch (error) {
    weatherBox.innerHTML = `<p>Error fetching data.</p>`;
  } finally {
    hideLoader();
  }
}



async function getForecast(lat, lon) {
  const forecastContainer = document.getElementById("forecastContainer");
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();

  
  const dailyData = data.list.filter(item => item.dt_txt.includes("12:00:00"));
  forecastContainer.innerHTML = dailyData.map(item => {
    const date = new Date(item.dt_txt).toLocaleDateString('en-IN', { weekday: 'short' });
    return `
      <div class="forecast-card">
        <p>${date}</p>
        <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" />
        <p>${item.main.temp.toFixed(1)}°C</p>
      </div>
    `;
  }).join("");
}

function startVoiceRecognition() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-IN';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.start();

  recognition.onresult = function(event) {
    const spokenCity = event.results[0][0].transcript;
    document.getElementById("cityInput").value = spokenCity;
    getWeatherByCity();
  };

  recognition.onerror = function(event) {
    alert("Voice recognition error: " + event.error);
  };
}
