/* ========================================
   STEP 7: WEATHER + FARMING SUGGESTION
   - Real-time weather integration ✅
   - Auto-update weather ✅
   - Crop suggestions based on weather ✅
   - Weather-based farming advice ✅
   - Seasonal recommendations ✅
   - Climate-based irrigation planning ✅
======================================== */

const BACKEND_URL = "http://localhost:5000";

// Weather & Farming System State
let weatherFarmingState = {
    currentWeather: null,
    forecast: [],
    location: {
        lat: 28.6139, // Default: New Delhi, India
        lon: 77.2090,
        name: 'New Delhi, India'
    },
    lastUpdate: null,
    autoUpdateEnabled: true,
    updateInterval: 300000, // 5 minutes
    cropSuggestions: [],
    farmingAdvice: [],
    irrigationPlan: null,
    seasonalData: null
};

// Crop Database with Weather Requirements
const CROP_DATABASE = {
    'Rice': {
        minTemp: 20,
        maxTemp: 35,
        rainfall: 'high',
        season: ['monsoon', 'summer'],
        soilMoisture: 'high',
        growthDays: 120,
        waterRequirement: 'very-high',
        profitability: 'high',
        description: 'Requires flooded fields, high water availability'
    },
    'Wheat': {
        minTemp: 10,
        maxTemp: 25,
        rainfall: 'moderate',
        season: ['winter'],
        soilMoisture: 'moderate',
        growthDays: 120,
        waterRequirement: 'moderate',
        profitability: 'high',
        description: 'Cool season crop, requires moderate irrigation'
    },
    'Cotton': {
        minTemp: 21,
        maxTemp: 35,
        rainfall: 'moderate',
        season: ['summer'],
        soilMoisture: 'moderate',
        growthDays: 180,
        waterRequirement: 'moderate',
        profitability: 'very-high',
        description: 'Warm season crop, drought tolerant'
    },
    'Sugarcane': {
        minTemp: 20,
        maxTemp: 35,
        rainfall: 'high',
        season: ['summer', 'monsoon'],
        soilMoisture: 'high',
        growthDays: 365,
        waterRequirement: 'very-high',
        profitability: 'very-high',
        description: 'Tropical crop, requires consistent moisture'
    },
    'Maize': {
        minTemp: 18,
        maxTemp: 32,
        rainfall: 'moderate',
        season: ['monsoon', 'summer'],
        soilMoisture: 'moderate',
        growthDays: 90,
        waterRequirement: 'moderate',
        profitability: 'moderate',
        description: 'Versatile crop, adapts to various conditions'
    },
    'Potato': {
        minTemp: 15,
        maxTemp: 25,
        rainfall: 'moderate',
        season: ['winter'],
        soilMoisture: 'moderate',
        growthDays: 90,
        waterRequirement: 'moderate',
        profitability: 'high',
        description: 'Cool season crop, requires well-drained soil'
    },
    'Tomato': {
        minTemp: 18,
        maxTemp: 30,
        rainfall: 'low',
        season: ['summer', 'winter'],
        soilMoisture: 'moderate',
        growthDays: 75,
        waterRequirement: 'moderate',
        profitability: 'high',
        description: 'Warm season crop, sensitive to frost'
    },
    'Onion': {
        minTemp: 13,
        maxTemp: 24,
        rainfall: 'low',
        season: ['winter'],
        soilMoisture: 'low',
        growthDays: 120,
        waterRequirement: 'low',
        profitability: 'high',
        description: 'Cool season crop, drought tolerant'
    },
    'Soybean': {
        minTemp: 20,
        maxTemp: 30,
        rainfall: 'moderate',
        season: ['monsoon'],
        soilMoisture: 'moderate',
        growthDays: 100,
        waterRequirement: 'moderate',
        profitability: 'moderate',
        description: 'Nitrogen-fixing crop, good for soil health'
    },
    'Mustard': {
        minTemp: 10,
        maxTemp: 25,
        rainfall: 'low',
        season: ['winter'],
        soilMoisture: 'low',
        growthDays: 90,
        waterRequirement: 'low',
        profitability: 'moderate',
        description: 'Cool season crop, oil seed'
    }
};

// ⭐ Fetch Enhanced Weather Data
async function fetchEnhancedWeather() {
    try {
        const { lat, lon } = weatherFarmingState.location;
        
        // Fetch comprehensive weather data
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=auto&forecast_days=7`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Weather API failed');
        
        const data = await response.json();
        
        // Process current weather
        const current = data.current;
        weatherFarmingState.currentWeather = {
            temperature: Math.round(current.temperature_2m),
            humidity: Math.round(current.relative_humidity_2m),
            precipitation: current.precipitation,
            weatherCode: current.weather_code,
            windSpeed: Math.round(current.wind_speed_10m),
            condition: getWeatherCondition(current.weather_code),
            icon: getWeatherIcon(current.weather_code),
            timestamp: Date.now()
        };
        
        // Process 7-day forecast
        const daily = data.daily;
        weatherFarmingState.forecast = [];
        
        for (let i = 0; i < 7; i++) {
            weatherFarmingState.forecast.push({
                date: daily.time[i],
                day: getDayLabel(i),
                tempMax: Math.round(daily.temperature_2m_max[i]),
                tempMin: Math.round(daily.temperature_2m_min[i]),
                precipitation: Math.round(daily.precipitation_sum[i]),
                precipProbability: daily.precipitation_probability_max[i],
                windSpeed: Math.round(daily.wind_speed_10m_max[i]),
                weatherCode: daily.weather_code[i],
                condition: getWeatherCondition(daily.weather_code[i]),
                icon: getWeatherIcon(daily.weather_code[i])
            });
        }
        
        weatherFarmingState.lastUpdate = Date.now();
        
        // Generate crop suggestions based on weather
        generateCropSuggestions();
        
        // Generate farming advice
        generateFarmingAdvice();
        
        // Generate irrigation plan
        generateIrrigationPlan();
        
        // Update UI
        updateWeatherUI();
        
        // Save state
        saveWeatherState();
        
        console.log('✅ Weather data updated successfully');
        return true;
        
    } catch (error) {
        console.error('❌ Weather fetch error:', error);
        return false;
    }
}

// ⭐ Get Weather Condition from WMO Code
function getWeatherCondition(code) {
    if (code === 0) return 'Clear Sky';
    if (code <= 3) return 'Partly Cloudy';
    if (code <= 48) return 'Foggy';
    if (code <= 57) return 'Drizzle';
    if (code <= 67) return 'Rainy';
    if (code <= 77) return 'Snowy';
    if (code <= 82) return 'Rain Showers';
    if (code <= 86) return 'Snow Showers';
    if (code >= 95) return 'Thunderstorm';
    return 'Unknown';
}

// ⭐ Get Weather Icon from WMO Code
function getWeatherIcon(code) {
    if (code === 0) return 'fa-sun';
    if (code <= 3) return 'fa-cloud-sun';
    if (code <= 48) return 'fa-smog';
    if (code <= 57) return 'fa-cloud-rain';
    if (code <= 67) return 'fa-cloud-showers-heavy';
    if (code <= 77) return 'fa-snowflake';
    if (code <= 82) return 'fa-cloud-rain';
    if (code <= 86) return 'fa-cloud-meatball';
    if (code >= 95) return 'fa-cloud-bolt';
    return 'fa-question';
}

// ⭐ Get Day Label
function getDayLabel(index) {
    const days = ['Today', 'Tomorrow', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];
    return days[index] || `Day ${index + 1}`;
}

// ⭐ Get Current Season
function getCurrentSeason() {
    const month = new Date().getMonth() + 1; // 1-12
    
    // Northern Hemisphere (India)
    if (month >= 3 && month <= 6) return 'summer';
    if (month >= 7 && month <= 10) return 'monsoon';
    if (month >= 11 || month <= 2) return 'winter';
    
    return 'unknown';
}

// ⭐ Generate Crop Suggestions Based on Weather
function generateCropSuggestions() {
    const current = weatherFarmingState.currentWeather;
    const forecast = weatherFarmingState.forecast;
    const season = getCurrentSeason();
    
    if (!current || forecast.length === 0) return;
    
    // Calculate average temperature for next 7 days
    const avgTemp = forecast.reduce((sum, day) => sum + (day.tempMax + day.tempMin) / 2, 0) / forecast.length;
    
    // Calculate total expected rainfall
    const totalRainfall = forecast.reduce((sum, day) => sum + day.precipitation, 0);
    const rainfallLevel = totalRainfall > 100 ? 'high' : totalRainfall > 50 ? 'moderate' : 'low';
    
    // Find suitable crops
    const suggestions = [];
    
    Object.keys(CROP_DATABASE).forEach(cropName => {
        const crop = CROP_DATABASE[cropName];
        let score = 0;
        let reasons = [];
        
        // Temperature suitability
        if (avgTemp >= crop.minTemp && avgTemp <= crop.maxTemp) {
            score += 40;
            reasons.push(`Ideal temperature range (${crop.minTemp}-${crop.maxTemp}°C)`);
        } else if (avgTemp >= crop.minTemp - 5 && avgTemp <= crop.maxTemp + 5) {
            score += 20;
            reasons.push(`Acceptable temperature`);
        }
        
        // Season suitability
        if (crop.season.includes(season)) {
            score += 30;
            reasons.push(`Perfect for ${season} season`);
        }
        
        // Rainfall suitability
        if (crop.rainfall === rainfallLevel) {
            score += 20;
            reasons.push(`Matches expected rainfall (${rainfallLevel})`);
        } else if (
            (crop.rainfall === 'moderate' && rainfallLevel !== 'high') ||
            (crop.rainfall === 'high' && rainfallLevel === 'moderate')
        ) {
            score += 10;
            reasons.push(`Acceptable rainfall conditions`);
        }
        
        // Profitability bonus
        if (crop.profitability === 'very-high') score += 10;
        else if (crop.profitability === 'high') score += 5;
        
        // Only suggest crops with score > 50
        if (score > 50) {
            suggestions.push({
                name: cropName,
                score,
                reasons,
                ...crop
            });
        }
    });
    
    // Sort by score (highest first)
    suggestions.sort((a, b) => b.score - a.score);
    
    // Take top 5
    weatherFarmingState.cropSuggestions = suggestions.slice(0, 5);
    
    console.log('🌾 Crop suggestions generated:', weatherFarmingState.cropSuggestions);
}

// ⭐ Generate Farming Advice Based on Weather
function generateFarmingAdvice() {
    const current = weatherFarmingState.currentWeather;
    const forecast = weatherFarmingState.forecast;
    const advice = [];
    
    if (!current || forecast.length === 0) return;
    
    // Temperature-based advice
    if (current.temperature > 35) {
        advice.push({
            type: 'warning',
            icon: 'fa-temperature-high',
            title: 'High Temperature Alert',
            message: 'Extreme heat detected. Increase irrigation frequency and provide shade for sensitive crops.',
            priority: 'high'
        });
    } else if (current.temperature < 10) {
        advice.push({
            type: 'warning',
            icon: 'fa-temperature-low',
            title: 'Cold Weather Alert',
            message: 'Low temperatures may damage crops. Consider frost protection measures.',
            priority: 'high'
        });
    }
    
    // Rainfall-based advice
    const upcomingRain = forecast.slice(0, 3).some(day => day.precipitation > 10);
    if (upcomingRain) {
        advice.push({
            type: 'info',
            icon: 'fa-cloud-rain',
            title: 'Rain Expected',
            message: 'Rainfall expected in next 3 days. Reduce irrigation and ensure proper drainage.',
            priority: 'medium'
        });
    } else {
        const noRainDays = forecast.filter(day => day.precipitation < 1).length;
        if (noRainDays >= 5) {
            advice.push({
                type: 'warning',
                icon: 'fa-droplet-slash',
                title: 'Dry Period Ahead',
                message: `No significant rain expected for ${noRainDays} days. Plan irrigation accordingly.`,
                priority: 'high'
            });
        }
    }
    
    // Wind-based advice
    const highWind = forecast.some(day => day.windSpeed > 40);
    if (highWind) {
        advice.push({
            type: 'warning',
            icon: 'fa-wind',
            title: 'High Wind Alert',
            message: 'Strong winds expected. Secure loose structures and protect young plants.',
            priority: 'medium'
        });
    }
    
    // Humidity-based advice
    if (current.humidity > 80) {
        advice.push({
            type: 'info',
            icon: 'fa-droplet',
            title: 'High Humidity',
            message: 'High humidity increases disease risk. Monitor crops for fungal infections.',
            priority: 'medium'
        });
    } else if (current.humidity < 30) {
        advice.push({
            type: 'info',
            icon: 'fa-droplet-slash',
            title: 'Low Humidity',
            message: 'Low humidity may stress plants. Consider misting or mulching.',
            priority: 'low'
        });
    }
    
    // General seasonal advice
    const season = getCurrentSeason();
    if (season === 'summer') {
        advice.push({
            type: 'success',
            icon: 'fa-sun',
            title: 'Summer Season Tips',
            message: 'Focus on heat-tolerant crops. Mulch soil to retain moisture. Irrigate early morning or evening.',
            priority: 'low'
        });
    } else if (season === 'monsoon') {
        advice.push({
            type: 'success',
            icon: 'fa-cloud-rain',
            title: 'Monsoon Season Tips',
            message: 'Ensure proper drainage. Plant water-loving crops. Watch for waterlogging.',
            priority: 'low'
        });
    } else if (season === 'winter') {
        advice.push({
            type: 'success',
            icon: 'fa-snowflake',
            title: 'Winter Season Tips',
            message: 'Plant cool-season crops. Protect from frost. Reduce irrigation frequency.',
            priority: 'low'
        });
    }
    
    weatherFarmingState.farmingAdvice = advice;
    console.log('💡 Farming advice generated:', advice);
}

// ⭐ Generate Irrigation Plan Based on Weather
function generateIrrigationPlan() {
    const current = weatherFarmingState.currentWeather;
    const forecast = weatherFarmingState.forecast;
    
    if (!current || forecast.length === 0) return;
    
    const plan = {
        today: null,
        next7Days: [],
        recommendation: '',
        waterSavings: 0
    };
    
    // Analyze each day
    forecast.forEach((day, index) => {
        let irrigationNeeded = 'normal';
        let amount = 'moderate';
        let reason = '';
        
        // Check rainfall
        if (day.precipitation > 20) {
            irrigationNeeded = 'skip';
            amount = 'none';
            reason = `Heavy rain expected (${day.precipitation}mm)`;
        } else if (day.precipitation > 5) {
            irrigationNeeded = 'reduce';
            amount = 'light';
            reason = `Light rain expected (${day.precipitation}mm)`;
        } else {
            // Check temperature
            const avgTemp = (day.tempMax + day.tempMin) / 2;
            if (avgTemp > 35) {
                irrigationNeeded = 'increase';
                amount = 'heavy';
                reason = `High temperature (${Math.round(avgTemp)}°C)`;
            } else if (avgTemp < 15) {
                irrigationNeeded = 'reduce';
                amount = 'light';
                reason = `Cool temperature (${Math.round(avgTemp)}°C)`;
            } else {
                irrigationNeeded = 'normal';
                amount = 'moderate';
                reason = 'Normal conditions';
            }
        }
        
        const dayPlan = {
            day: day.day,
            date: day.date,
            irrigationNeeded,
            amount,
            reason,
            precipitation: day.precipitation,
            temperature: Math.round((day.tempMax + day.tempMin) / 2)
        };
        
        if (index === 0) {
            plan.today = dayPlan;
        }
        
        plan.next7Days.push(dayPlan);
    });
    
    // Calculate water savings
    const skipDays = plan.next7Days.filter(d => d.irrigationNeeded === 'skip').length;
    const reduceDays = plan.next7Days.filter(d => d.irrigationNeeded === 'reduce').length;
    plan.waterSavings = (skipDays * 100) + (reduceDays * 50); // Percentage
    
    // Generate recommendation
    if (skipDays >= 3) {
        plan.recommendation = `Excellent! Rain expected on ${skipDays} days. You can save significant water this week.`;
    } else if (reduceDays >= 3) {
        plan.recommendation = `Good conditions. Light irrigation needed on ${reduceDays} days.`;
    } else {
        const increaseDays = plan.next7Days.filter(d => d.irrigationNeeded === 'increase').length;
        if (increaseDays >= 3) {
            plan.recommendation = `Hot and dry week ahead. Increase irrigation on ${increaseDays} days.`;
        } else {
            plan.recommendation = 'Normal irrigation schedule recommended for this week.';
        }
    }
    
    weatherFarmingState.irrigationPlan = plan;
    console.log('💧 Irrigation plan generated:', plan);
}

// ⭐ Update Weather UI
function updateWeatherUI() {
    const current = weatherFarmingState.currentWeather;
    const forecast = weatherFarmingState.forecast;
    
    if (!current) return;
    
    // Update current weather display
    const currentWeatherEl = document.getElementById('currentWeatherDisplay');
    if (currentWeatherEl) {
        currentWeatherEl.innerHTML = `
            <div class="current-weather-card">
                <div class="weather-icon-large">
                    <i class="fa-solid ${current.icon}"></i>
                </div>
                <div class="weather-details">
                    <div class="weather-temp">${current.temperature}°C</div>
                    <div class="weather-condition">${current.condition}</div>
                    <div class="weather-meta">
                        <span><i class="fa-solid fa-droplet"></i> ${current.humidity}%</span>
                        <span><i class="fa-solid fa-wind"></i> ${current.windSpeed} km/h</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Update 7-day forecast
    const forecastEl = document.getElementById('forecast7Days');
    if (forecastEl && forecast.length > 0) {
        forecastEl.innerHTML = forecast.map(day => `
            <div class="forecast-day-card">
                <div class="forecast-day-name">${day.day}</div>
                <i class="fa-solid ${day.icon} forecast-icon"></i>
                <div class="forecast-temp">
                    <span class="temp-max">${day.tempMax}°</span>
                    <span class="temp-min">${day.tempMin}°</span>
                </div>
                <div class="forecast-condition">${day.condition}</div>
                ${day.precipitation > 0 ? `<div class="forecast-rain"><i class="fa-solid fa-droplet"></i> ${day.precipitation}mm</div>` : ''}
            </div>
        `).join('');
    }
    
    // Update crop suggestions
    updateCropSuggestionsUI();
    
    // Update farming advice
    updateFarmingAdviceUI();
    
    // Update irrigation plan
    updateIrrigationPlanUI();
    
    // Update last update time
    const lastUpdateEl = document.getElementById('weatherLastUpdate');
    if (lastUpdateEl) {
        lastUpdateEl.textContent = `Last updated: ${new Date(weatherFarmingState.lastUpdate).toLocaleTimeString()}`;
    }
}

// ⭐ Update Crop Suggestions UI
function updateCropSuggestionsUI() {
    const suggestions = weatherFarmingState.cropSuggestions;
    const container = document.getElementById('cropSuggestionsContainer');
    
    if (!container || suggestions.length === 0) return;
    
    container.innerHTML = suggestions.map((crop, index) => `
        <div class="crop-suggestion-card" style="animation-delay: ${index * 0.1}s">
            <div class="crop-rank">#${index + 1}</div>
            <div class="crop-info">
                <div class="crop-name">${crop.name}</div>
                <div class="crop-score">Match: ${crop.score}%</div>
                <div class="crop-description">${crop.description}</div>
                <div class="crop-details">
                    <span><i class="fa-solid fa-calendar"></i> ${crop.growthDays} days</span>
                    <span><i class="fa-solid fa-droplet"></i> ${crop.waterRequirement}</span>
                    <span><i class="fa-solid fa-coins"></i> ${crop.profitability}</span>
                </div>
                <div class="crop-reasons">
                    ${crop.reasons.map(r => `<div class="reason-tag">${r}</div>`).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

// ⭐ Update Farming Advice UI
function updateFarmingAdviceUI() {
    const advice = weatherFarmingState.farmingAdvice;
    const container = document.getElementById('farmingAdviceContainer');
    
    if (!container || advice.length === 0) return;
    
    container.innerHTML = advice.map((item, index) => `
        <div class="advice-card advice-${item.type}" style="animation-delay: ${index * 0.1}s">
            <div class="advice-icon">
                <i class="fa-solid ${item.icon}"></i>
            </div>
            <div class="advice-content">
                <div class="advice-title">${item.title}</div>
                <div class="advice-message">${item.message}</div>
            </div>
            <div class="advice-priority priority-${item.priority}">${item.priority}</div>
        </div>
    `).join('');
}

// ⭐ Update Irrigation Plan UI
function updateIrrigationPlanUI() {
    const plan = weatherFarmingState.irrigationPlan;
    const container = document.getElementById('irrigationPlanContainer');
    
    if (!container || !plan) return;
    
    container.innerHTML = `
        <div class="irrigation-summary">
            <div class="irrigation-recommendation">
                <i class="fa-solid fa-lightbulb"></i>
                <span>${plan.recommendation}</span>
            </div>
            <div class="water-savings">
                <i class="fa-solid fa-hand-holding-droplet"></i>
                <span>Potential water savings: <strong>${plan.waterSavings}%</strong></span>
            </div>
        </div>
        
        <div class="irrigation-schedule">
            ${plan.next7Days.map((day, index) => `
                <div class="irrigation-day" style="animation-delay: ${index * 0.05}s">
                    <div class="irrigation-day-header">
                        <span class="irrigation-day-name">${day.day}</span>
                        <span class="irrigation-amount amount-${day.irrigationNeeded}">${day.amount}</span>
                    </div>
                    <div class="irrigation-day-details">
                        <span><i class="fa-solid fa-temperature-half"></i> ${day.temperature}°C</span>
                        <span><i class="fa-solid fa-cloud-rain"></i> ${day.precipitation}mm</span>
                    </div>
                    <div class="irrigation-reason">${day.reason}</div>
                </div>
            `).join('')}
        </div>
    `;
}

// ⭐ Auto-Update Weather
function startAutoUpdate() {
    if (!weatherFarmingState.autoUpdateEnabled) return;
    
    // Initial fetch
    fetchEnhancedWeather();
    
    // Set interval for auto-update
    setInterval(() => {
        if (weatherFarmingState.autoUpdateEnabled) {
            console.log('🔄 Auto-updating weather...');
            fetchEnhancedWeather();
        }
    }, weatherFarmingState.updateInterval);
    
    console.log(`✅ Auto-update enabled (every ${weatherFarmingState.updateInterval / 1000 / 60} minutes)`);
}

// ⭐ Manual Refresh
window.refreshWeather = function() {
    console.log('🔄 Manual weather refresh...');
    fetchEnhancedWeather().then(success => {
        if (success && window.showAlert) {
            window.showAlert('Weather data refreshed successfully', 'success');
        } else if (window.showAlert) {
            window.showAlert('Failed to refresh weather data', 'danger');
        }
    });
};

// ⭐ Change Location
window.changeWeatherLocation = function(lat, lon, name) {
    weatherFarmingState.location = { lat, lon, name };
    console.log(`📍 Location changed to: ${name}`);
    fetchEnhancedWeather();
    saveWeatherState();
};

// ⭐ Toggle Auto-Update
window.toggleWeatherAutoUpdate = function(enabled) {
    weatherFarmingState.autoUpdateEnabled = enabled;
    console.log(`🔄 Auto-update ${enabled ? 'enabled' : 'disabled'}`);
    saveWeatherState();
    
    if (enabled) {
        startAutoUpdate();
    }
};

// ⭐ Save Weather State
function saveWeatherState() {
    try {
        const toSave = {
            location: weatherFarmingState.location,
            autoUpdateEnabled: weatherFarmingState.autoUpdateEnabled,
            updateInterval: weatherFarmingState.updateInterval,
            lastUpdate: weatherFarmingState.lastUpdate
        };
        localStorage.setItem('weatherFarmingState', JSON.stringify(toSave));
        console.log('💾 Weather state saved');
    } catch (error) {
        console.error('Failed to save weather state:', error);
    }
}

// ⭐ Load Weather State
function loadWeatherState() {
    try {
        const saved = localStorage.getItem('weatherFarmingState');
        if (saved) {
            const parsed = JSON.parse(saved);
            weatherFarmingState = { ...weatherFarmingState, ...parsed };
            console.log('✅ Weather state loaded');
        }
    } catch (error) {
        console.error('Failed to load weather state:', error);
    }
}

// ⭐ Initialize Weather & Farming System
function initWeatherFarming() {
    console.log('🚀 Initializing Weather & Farming System...');
    
    // Load saved state
    loadWeatherState();
    
    // Start auto-update
    startAutoUpdate();
    
    console.log('✅ Weather & Farming System initialized');
}

// Export functions for global access
window.weatherFarming = {
    refresh: fetchEnhancedWeather,
    changeLocation: changeWeatherLocation,
    toggleAutoUpdate: toggleWeatherAutoUpdate,
    getState: () => weatherFarmingState,
    getCropSuggestions: () => weatherFarmingState.cropSuggestions,
    getFarmingAdvice: () => weatherFarmingState.farmingAdvice,
    getIrrigationPlan: () => weatherFarmingState.irrigationPlan
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initWeatherFarming();
});

// Save state before page unload
window.addEventListener('beforeunload', () => {
    saveWeatherState();
});

console.log('✅ Weather & Farming Module Loaded');
