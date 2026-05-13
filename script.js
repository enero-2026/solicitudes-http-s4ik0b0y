const apiKey = "84914908422e0c235b6d67dd27f75ea3";

const campoBusqueda = document.getElementById("cityInput");
const btnBusqueda = document.getElementById("btnBusqueda");
const sugerenciasUl = document.querySelector("#sugerencia ul");
const infoClima = document.getElementById("infoClima");

let debounceTimer;

// Sugerencias en tiempo real al escribir
campoBusqueda.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    const query = campoBusqueda.value.trim();

    if (query.length < 2) {
        sugerenciasUl.innerHTML = "";
        return;
    }

    debounceTimer = setTimeout(() => buscarCiudades(query), 400); // espera 400ms tras dejar de escribir
});

// También funciona con el botón
btnBusqueda.addEventListener("click", () => {
    const query = campoBusqueda.value.trim();
    if (query) buscarCiudades(query);
});

function buscarCiudades(query) {
    fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`)
        .then(res => {
            if (res.ok) return res.json();
            throw new Error("Error al buscar ciudades");
        })
        .then(data => {
            sugerenciasUl.innerHTML = "";

            data.forEach(ciudad => {
                const li = document.createElement("li");
                const link = document.createElement("a");
                link.href = "javascript:void(0)";
                link.textContent = `${ciudad.name}, ${ciudad.state ? ciudad.state + ", " : ""}${ciudad.country}`;
                li.appendChild(link);
                li.addEventListener("click", () => elegirSugerencia(ciudad.lat, ciudad.lon, ciudad.name, ciudad.country));
                sugerenciasUl.appendChild(li);
            });
        })
        .catch(error => console.error(error));
}

function elegirSugerencia(lat, lon) {
    sugerenciasUl.innerHTML = "";
    campoBusqueda.value = "";

    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=es`)
        .then(res => {
            if (res.ok) return res.json();
            throw new Error("Error al obtener el clima");
        })
        .then(data => {
            const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

            infoClima.innerHTML = `
                <div class="bg-white rounded-xl shadow p-6 max-w-sm mx-auto text-center">
                    <h2 class="text-2xl font-bold">${data.name}, ${data.sys.country}</h2>
                    <img src="${iconUrl}" alt="${data.weather[0].description}" class="mx-auto">
                    <p class="text-5xl font-semibold">${Math.round(data.main.temp)}°C</p>
                    <p class="capitalize text-gray-500 mt-1">${data.weather[0].description}</p>
                    <div class="flex justify-around mt-4 text-sm text-gray-600">
                        <span>💧 ${data.main.humidity}%</span>
                        <span>💨 ${data.wind.speed} m/s</span>
                        <span>🌡️ ${Math.round(data.main.feels_like)}°C</span>
                    </div>
                </div>
            `;
        })
        .catch(error => console.error(error));
}