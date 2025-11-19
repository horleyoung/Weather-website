const unit = document.querySelector(".unit");
const searchBox = document.querySelector(".search-box input");
const searchBtn = document.querySelector(".small-search");
const weatherIcon = document.querySelector(".weather-icon");
const progressBar = document.querySelector(".progress-bar");
const temp = document.querySelectorAll(".temp"); 
let highTemps = document.querySelectorAll(".high-temp");
let lowTemps = document.querySelectorAll(".low-temp");
const icons = document.querySelectorAll(".day-icon"); 
const dayDropdown = document.querySelector(".day-dropdown");
const dayBtn = document.querySelector(".days-btn");
const searchDropdown = document.querySelector(".search-dropdown");
const hourlyTimes = document.querySelectorAll(".hour-time");
const hourlyTempsEls = document.querySelectorAll(".hour-max");
const dayItems = dayDropdown.querySelectorAll("li");
const fahrenheitTemp = document.querySelector(".fahrenheit");
const celsiusUnit = document.querySelector(".celsius-unit");
const celsiusTemp = document.querySelectorAll(".celsius"); 
const windSpeed = document.querySelector(".wind-number");
const unitText = document.querySelector(".unit-text");
const windNumber = document.querySelector(".wind-number");
const kilometre = document.querySelector(".kilometre");
const miles = document.querySelector(".miles");
const milliUnit = document.querySelector(".Millimeters");
const inchesUnit = document.querySelector(".inches");
const apparentTemp = document.querySelector(".apparent-temp");
const apiError = document.querySelector(".api-error");
const retryBtn = document.querySelector(".retry-btn");
let weatherData = null;
let daily = null;
let lastSearchedCity = "";



async function checkWeather(city) {
  // show progress bar
  progressBar.classList.remove("hidden");
  document.querySelector(".error").classList.add("hidden");

  try {
    // 1️⃣ Get coordinates or location
    const geoResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`
    );
    const geoData = await geoResponse.json();

    // ❌ If city is invalid or not found
    if (!geoData.results || geoData.results.length === 0) {
      document.querySelector(".error").classList.remove("hidden");
      apiError.classList.add("hidden"); // hide api error
      document.querySelector(".weather-section").classList.add("hidden"); // hide weather display
      progressBar.classList.add("hidden");
      return; // stop execution
    }

    const { latitude, longitude, name, country } = geoData.results[0];
    // Fetch weather data (with weather_code)
    const weatherResponse = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=precipitation_sum,precipitation_probability_max,precipitation_hours,weather_code,temperature_2m_max,temperature_2m_min&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,wind_speed_10m,weather_code&current=precipitation,temperature_2m,relative_humidity_2m,is_day,apparent_temperature,wind_speed_10m,weather_code&timezone=auto`
    );

    const fahrenheitApi =  `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=precipitation_sum,precipitation_probability_max,precipitation_hours,weather_code,temperature_2m_max,temperature_2m_min&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,wind_speed_10m,weather_code&current=precipitation,temperature_2m,relative_humidity_2m,is_day,apparent_temperature,wind_speed_10m,weather_code&timezone=auto&wind_speed_unit=mph&temperature_unit=fahrenheit&precipitation_unit=inch`
    window.weatherF = await fetch(fahrenheitApi).then(res => res.json());
  
    // window.weatherDataF = weatherF;
     weatherData = await weatherResponse.json();
     weather = weatherData.current;

     hourly = weatherData.hourly;
    // console.log("⏰ Hourly section:", hourly);
    console.log(weatherData.current.apparent_temperature)
    //  Localized date
    const timezone = weatherData.timezone;
    const cityDate = new Date().toLocaleString("en-US", {
      timeZone: timezone,
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric"
    });
    document.querySelector(".date").innerHTML = cityDate;

     //HOUR DAYS FORECAST
    // hour forecast dropdown day
    const cityDay = new Date().toLocaleString("en-US", { timeZone: timezone });
    //Convert it back into a Date object
    const localDate = new Date(cityDay);

    // Extract weekday name (e.g., "Tuesday")
    const currentDay = localDate.toLocaleDateString("en-US", { weekday: "long" });

    //  Update the button text
    const dayLabel = document.querySelector(".day-label");
    if (dayLabel) {
      dayLabel.textContent = currentDay;
    }
    // Event listener for each day in the dropdown
    dayItems.forEach(dayItem => {
      dayItem.addEventListener("click", () => {
      const selectedDay = dayItem.textContent.trim();

      // 1 Update button label text
      dayLabel.textContent = selectedDay;
      dayDropdown.classList.add("hidden");
      // 3️⃣ Update hourly data for that day
      updateHourlyForecast(selectedDay, weatherData);
      }); 
    });

    // Helper function to update hourly forecast UI
    function updateHourlyForecast(dayName, weatherData) {
      const { daily, hourly } = weatherData;
      if (!daily || !hourly) return;

    // find date for selected day
    const dateIndex = daily.time.findIndex((d) => {
      const name = new Date(d).toLocaleDateString("en-US", { weekday: "long" });
      return name.toLowerCase() === dayName.toLowerCase();
    });
    if (dateIndex === -1) return;
    const targetDate = daily.time[dateIndex];

    // update each hour item
    hourlyTimes.forEach((timeEl, i) => {
      const match = timeEl.textContent.match(/^(\d+)\s*([AP]M)$/i);
      if (!match) return;
      let [_, h, period] = match;
      h = parseInt(h);
      if (period.toUpperCase() === "PM" && h !== 12) h += 12;
      if (period.toUpperCase() === "AM" && h === 12) h = 0;

    // find this hour in hourly.time
    const idx = hourly.time.findIndex((t) => {
      const d = new Date(t);
      return d.toISOString().startsWith(targetDate) && d.getHours() === h;
    });
    if (idx === -1) return;

    const temp = Math.round(hourly.temperature_2m[idx]);
    const code = hourly.weather_code[idx];
    hourlyTempsEls[i].innerHTML = `${temp}<span class="text-sm absolute">o</span>`;

    // pick icon
    let iconSrc = "./assets/images/icon-sunny.webp";
    if (code >= 1 && code <= 3) iconSrc = "./assets/images/icon-overcast.webp";
    else if (code === 45 || code === 48) iconSrc = "./assets/images/icon-fog.webp";
    else if (code >= 51 && code <= 67) iconSrc = "./assets/images/icon-rain.webp";
    else if (code >= 71 && code <= 77) iconSrc = "./assets/images/icon-snow.webp";
    else if (code >= 80 && code <= 99) iconSrc = "./assets/images/icon-storm.webp";

    const iconEl = timeEl.previousElementSibling;
    if (iconEl && iconEl.tagName === "IMG") iconEl.src = iconSrc;
  });
}

    function initHourlyForecast(weatherData) {
      const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
      dayLabel.textContent = today;
      updateHourlyForecast(today, weatherData);
    }

    initHourlyForecast(weatherData);
    
    // Update weather info
    document.querySelector(".city").innerHTML = `${name}, ${country}`;
    updateDropdownList(name, country);
      for (let i = 0; i < temp.length; i++) {
      temp[i].innerHTML = Math.round(weather.temperature_2m) + "⁰";
      }
    apparentTemp.innerHTML = Math.round(weatherData.current.apparent_temperature) + "⁰" 
    windNumber.innerHTML = weather.wind_speed_10m + " km/h";
    document.querySelector(".humidity").innerHTML = weather.relative_humidity_2m +" %";
    daily = weatherData.daily;
    document.querySelector(".precipitation p").innerHTML = daily.precipitation_sum[0] + " mm";

    // Update weather icon based on weather_code
    const code = weather.weather_code;
    let iconSrc = "./assets/images/icon-sunny.webp"; // default

    if (code === 0) iconSrc = "./assets/images/icon-sunny.webp";
    else if (code >= 1 && code <= 3)
      iconSrc = "./assets/images/icon-overcast.webp";
    else if (code === 45 || code === 48)
      iconSrc = "./assets/images/icon-fog.webp";
    else if (code >= 51 && code <= 57)
      iconSrc = "./assets/images/icon-drizzle.webp";
    else if (code >= 61 && code <= 67)
      iconSrc = "./assets/images/icon-rain.webp";
    else if (code >= 71 && code <= 77)
      iconSrc = "./assets/images/icon-snow.webp";
    else if (code >= 80 && code <= 82)
      iconSrc = "./assets/images/icon-rain.webp";
    else if (code >= 95 && code <= 99)
      iconSrc = "./assets/images/icon-storm.webp";

    weatherIcon.src = iconSrc;

    // daily forecast
   // Function to update the 7-day forecast
    function updateForecast(daily) {
      // guard: ensure daily exists
      if (!daily) return;

      const maxTemps = daily.temperature_2m_max || [];
      const minTemps = daily.temperature_2m_min || [];
      // const codes = daily.weather_code || [];

      // Loop through each day (up to the number of boxes available)
      for (let i = 0; i < highTemps.length; i++) {
        // Get values safely
        const max = maxTemps[i];
        const min = minTemps[i];

      // Only update if data exists for that day
      if (max !== undefined && min !== undefined) {
        highTemps[i].textContent = Math.round(max) + "°" + "";
        lowTemps[i].textContent = Math.round(min) + "°";
      }

        // Update the weather icon image for that day (if the icon element exists)
        if (icons[i]) {
          icons[i].src = iconSrc;
        }
    }
  }
      // 🧩 Call it here
      updateForecast(daily);

    // Show weather section after successful load
    document.querySelector(".weather-section").classList.remove("hidden");
    document.querySelector(".error").classList.add("hidden");
  } catch (err) {
    console.error(err);
    // Show API/system error
    document.querySelector(".api-error").classList.remove("hidden");
    // Hide wrong-city error
    document.querySelector(".error").classList.add("hidden");
    // Hide UI since data is unreliable
    document.querySelector(".sky-container").classList.add("hidden")
    document.querySelector(".weather-section").classList.add("hidden"); // hide on error
    // api error
  } finally {
    // hide progress bar no matter what
    progressBar.classList.add("hidden");
  }
}
checkWeather("ilorin");

searchBtn.addEventListener("click",()=> {
  const city = searchBox.value.trim();
  if (!city) return;

  lastSearchedCity = city;  
  checkWeather(city);        // run your function
  // checkWeather(searchBox.value);
});
// Trigger search when Enter key is pressed in the input box
searchBox.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    checkWeather(searchBox.value.trim());
    searchDropdown.classList.add("hidden");
    lastSearchedCity = city;
  }
});

// for search dropdown
searchBox.addEventListener("click", function (e) {
    // prevent immediate closing when clicking on input
  searchDropdown.classList.toggle("hidden");
});

// listener for dropdown hour forecast
    dayBtn.addEventListener("click", function() {
      dayDropdown.classList.toggle("hidden");
    })

// hide dropdown when clicking anywhere outside
document.addEventListener("click", function (e) {
  if (!searchDropdown.contains(e.target) && !searchBox.contains(e.target)) {
    searchDropdown.classList.add("hidden");
  }
});

// update dropdown list for searching city
const dropdownItems = document.querySelectorAll(".search-dropdown li");
// Keep an array to store recent searches
let recentSearches = [];
// Function to update dropdown list
function updateDropdownList(cityName, countryName) {
  const fullName = `${cityName}, ${countryName}`;
  // If city already exists in the array, remove it (avoid duplicates)
  recentSearches = recentSearches.filter(item => item !== fullName);
  // Add new city to the beginning
  recentSearches.unshift(fullName);
  // Limit to 4 items only
  if (recentSearches.length > 4) {
    recentSearches.pop();
  }

  // Update visible list items
  for (let i = 0; i < dropdownItems.length; i++) {
    if (recentSearches[i]) {
      dropdownItems[i].textContent = recentSearches[i];
    } else {
      dropdownItems[i].textContent = "City Name"; // fallback if empty
    }
  }
}
dropdownItems.forEach((item, index) => {
  item.addEventListener("click", () => {
    // Use the text content of the clicked item or the corresponding recentSearches value
    const cityName = item.textContent; // or recentSearches[index] if aligned
    searchDropdown.classList.add("hidden");
    checkWeather(cityName);
  });
});


// for unit dropdown
$(".unit-wrapper").hover(
  function() {
    $(this).find("ul.dropdown").removeClass("hidden");
  },
  function() {
    $(this).find("ul.dropdown").addClass("hidden");
  }
); 


unitText.addEventListener("click", function() {
  if (unitText.textContent === "Switch to imperial") {
    switchToFahrenheit();
    unitText.textContent = "Switch to metric";
  } 
  else {
    switchToCelsius();
    unitText.textContent = "Switch to imperial";
  };
})

celsiusUnit.classList.add("active-unit");
kilometre.classList.add("active-unit");
milliUnit.classList.add("active-unit");
// Imperial conversion
function switchToFahrenheit() {
  celsiusUnit.classList.remove("active-unit");
  fahrenheitTemp.classList.add("active-unit");
  kilometre.classList.remove("active-unit");
  miles.classList.add("active-unit");
  milliUnit.classList.remove("active-unit");
  inchesUnit.classList.add("active-unit");
 
  celsiusTemp.forEach((temp, index) => {
    temp.textContent = Math.round(window.weatherF.hourly.temperature_2m[index]) + "°";    
  });

  windNumber.textContent = window.weatherF.current.wind_speed_10m + " mph";
  apparentTemp.innerHTML = Math.round(window.weatherF.current.apparent_temperature) + "°";
   document.querySelector(".precipitation p").innerHTML = window.weatherF.current.precipitation + " in"
}
// metric conversion
function switchToCelsius() {
    fahrenheitTemp.classList.remove("active-unit");
    celsiusUnit.classList.add("active-unit");
    kilometre.classList.add("active-unit");
    miles.classList.remove("active-unit");
    milliUnit.classList.add("active-unit");
    inchesUnit.classList.remove("active-unit");

     // Convert back all temps using your Celsius API
     celsiusTemp.forEach((temp, index) => {
      temp.textContent = Math.round(hourly.temperature_2m[index]) + "°"
  });
  windNumber.textContent = weather.wind_speed_10m + " km/h";
  apparentTemp.innerHTML = Math.round(weatherData.current.apparent_temperature) + "°";
  document.querySelector(".precipitation p").innerHTML = daily.precipitation_sum[0] + " mm";
}

retryBtn.addEventListener("click", function() {
   if (!lastSearchedCity) return; // nothing to retry

  // hide error while retrying
  apiError.classList.add("hidden");
  document.querySelector(".sky-container").classList.remove("hidden");
  checkWeather(lastSearchedCity);
})




