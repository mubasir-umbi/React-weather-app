
import React, { useState, useEffect } from "react";
import apiKeys from "./apiKeys";
import Clock from "react-live-clock";
import Forcast from "./forcast";
import loader from "./images/WeatherIcons.gif";
import ReactAnimatedWeather from "react-animated-weather";

const dateBuilder = (d) => {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const days = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
  ];

  const day = days[d.getDay()];
  const date = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();

  return `${day}, ${date} ${month} ${year}`;
};

const defaults = {
  color: "white",
  size: 112,
  animate: true,
};

function Weather() {
  const [weatherData, setWeatherData] = useState(null);
  const [icon, setIcon] = useState("CLEAR_DAY");

  useEffect(() => {
    if (navigator.geolocation) {
      getPosition()
        .then((position) => {
          getWeather(position.coords.latitude, position.coords.longitude);
        })
        .catch((err) => {
          getWeather(28.67, 77.22);
          alert(
            "You have disabled location service. Allow 'This APP' to access your location. Your current location will be used for calculating Real time weather."
          );
        });
    } else {
      alert("Geolocation not available");
    }

    const timerID = setInterval(() => getWeather(weatherData?.lat, weatherData?.lon), 600000);

    return () => clearInterval(timerID);
  }, [weatherData]);

  const getPosition = (options) => {
    return new Promise(function (resolve, reject) {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  };

  const getWeather = async (lat, lon) => {
    try {
      const api_call = await fetch(
        `${apiKeys.base}weather?lat=${lat}&lon=${lon}&units=metric&APPID=${apiKeys.key}`
      );
      const data = await api_call.json();
      setWeatherData({
        lat,
        lon,
        city: data.name,
        temperatureC: Math.round(data.main.temp),
        temperatureF: Math.round(data.main.temp * 1.8 + 32),
        humidity: data.main.humidity,
        main: data.weather[0].main,
        country: data.sys.country,
      });

      switch (data.weather[0].main) {
        case "Haze":
          setIcon("CLEAR_DAY");
          break;
        case "Clouds":
          setIcon("CLOUDY");
          break;
        case "Rain":
          setIcon("RAIN");
          break;
        case "Snow":
          setIcon("SNOW");
          break;
        case "Dust":
          setIcon("WIND");
          break;
        case "Drizzle":
          setIcon("SLEET");
          break;
        case "Fog":
          setIcon("FOG");
          break;
        case "Smoke":
          setIcon("FOG");
          break;
        case "Tornado":
          setIcon("WIND");
          break;
        default:
          setIcon("CLEAR_DAY");
      }
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  };

  if (weatherData?.temperatureC) {
    return (
      <>
        <div className="city">
          <div className="title">
            <h2>{weatherData.city}</h2>
            <h3>{weatherData.country}</h3>
          </div>
          <div className="mb-icon">
            {" "}
            <ReactAnimatedWeather
              icon={icon}
              color={defaults.color}
              size={defaults.size}
              animate={defaults.animate}
            />
            <p>{weatherData.main}</p>
          </div>
          <div className="date-time">
            <div className="dmy">
              <div id="txt"></div>
              <div className="current-time">
                <Clock format="HH:mm" interval={1000} ticking={true} />
              </div>
              <div className="current-date">{dateBuilder(new Date())}</div>
            </div>
            <div className="temperature">
              <p>
                {weatherData.temperatureC}°<span>C</span>
              </p>
            </div>
          </div>
        </div>
        <Forcast icon={icon} weather={weatherData.main} />
      </>
    );
  } else {
    return (
      <>
        <img src={loader} style={{ width: "50%", WebkitUserDrag: "none" }} />
        <h3 style={{ color: "white", fontSize: "22px", fontWeight: "600" }}>
          Detecting your location
        </h3>
        <h3 style={{ color: "white", marginTop: "10px" }}>
          Your current location wil be displayed on the App <br></br> & used
          for calculating Real time weather.
        </h3>
      </>
    );
  }
}

export default Weather;

