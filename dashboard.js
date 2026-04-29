fetch("https://precision-agriculture.netlify.app/data")
.then(response => response.json())
.then(data => {
    document.getElementById("moisture").innerText = data.moisture;
    document.getElementById("temp").innerText = data.temperature;
    document.getElementById("humidity").innerText = data.humidity;
})
.catch(error => console.log(error));
