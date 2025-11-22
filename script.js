document.getElementById("search-btn").addEventListener("click", () => {

    showLoading(); 

    const city = document.getElementById("city-input").value.trim();

    if (city === "") {
        document.getElementById("weather-now").innerHTML = "<p>Podaj nazwę miasta.</p>";
        document.getElementById("weather-forecast").innerHTML = "";
        return;
    }

    getCurrentWeather(city);
    getForecast(city);
});

function getIcon(code) {
    if (code === "01d" || code === "01n") 
    return "icons/sun.png";

    if (code.startsWith("02") || code.startsWith("03") || code.startsWith("04"))
        return "icons/cloudy.png";

    if (code.startsWith("09") || code.startsWith("10"))
        return "icons/rain.png";

    if (code.startsWith("11"))
        return "icons/thunderstorm.png";

    if (code.startsWith("13"))
        return "icons/snow.png";

    if (code.startsWith("50"))
        return "icons/fog.png";

    return "icons/extreme-weather.png"; 
}


function getCurrentWeather(city) {
    const apiKey = "6e1cc3a771b953a777892859f9270cd5";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=pl`;

    const xhr = new XMLHttpRequest();

    xhr.open("GET", url);

    xhr.onload = function () {
        console.log("Dane: ", xhr.responseText);
     
        if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);

            const iconPath = getIcon(data.weather[0].icon);

           document.getElementById("weather-now").innerHTML = `
    <div class="weather-now-wrapper">

        <div class="weather-details">
            <p><strong>Miasto:</strong> <span class="value">${data.name}</span></p>
            <p><strong>Temperatura:</strong> <span class="value">${data.main.temp}°C</span></p>
            <p><strong>Wilgotność:</strong> <span class="value">${data.main.humidity}%</span></p>
            <p><strong>Opis:</strong> <span class="value">${data.weather[0].description}</span></p>
        </div>

        <div class="weather-icon-right">
            <img src="${iconPath}" alt="Ikona pogody" class="weather-icon">
        </div>

    </div>
`;


        } else {
            document.getElementById("weather-now").innerHTML =
                "<p>Nie znaleziono miasta lub błąd serwera.</p>";
        }
    };

    xhr.onerror = function () {
        document.getElementById("weather-now").innerHTML =
            "<p>Błąd połączenia (offline?).</p>";
    };

    xhr.send();
}

function getForecast(city) {
    const apiKey = "6e1cc3a771b953a777892859f9270cd5";
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=pl`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error("Błąd API");
            }
            else
                console.log("Wczytano poprawnie API")
            return response.json();
        })
        .then(data => {
    let html = "";

    for (let i = 0; i < data.list.length; i += 8) {
        const day = data.list[i];
        const date = new Date(day.dt * 1000).toLocaleDateString("pl-PL");

        const iconPath = getIcon(day.weather[0].icon);

        html += `
    <div class="CardForecastItem">
        
        <div class="forecast-top">
            <span class="forecast-date">${date}</span>
            <img src="${iconPath}" class="weather-icon-forecast" alt="Ikona">
        </div>

        <div class="forecast-bottom">
            <span class="forecast-temp">${day.main.temp}°C</span>
            <span class="forecast-desc">${day.weather[0].description}</span>
        </div>

    </div>
`;

    }

    document.getElementById("weather-forecast").innerHTML = html;
})

        .catch(() => {
            document.getElementById("weather-forecast").innerHTML =
                "<p>Błąd pobierania prognozy.</p>";
        });


}



        function showLoading() {
    document.getElementById("weather-now").innerHTML = `
        <div class="loader"></div>
        <div class="loading-text">Szukam pogody...</div>
    `;

    document.getElementById("weather-forecast").innerHTML = `
        <div class="loader"></div>
        <div class="loading-text">Ładuję prognozę...</div>
    `;
}
