/* ========================================
   STEP 3: SENSOR INTEGRATION LOGIC
   Show data ONLY when sensor is connected
   Display "Sensor not connected" otherwise
======================================== */

const BACKEND_URL = "http://localhost:5000";

// Global Settings
let refreshInterval = 2000;
let tempThreshold = 35;
let moistureThreshold = 40;
let mainIntervalId = null;

// Sensor Connection State
let sensorConnectionState = {
    isConnected: false,
    lastConnectedTime: null,
    reconnectAttempts: 0,
    maxReconnectAttempts: 5
};

// ✅ STEP 3: Enhanced Data Fetching with Sensor Detection
async function fetchData() {
    try {
        const response = await fetch(`${BACKEND_URL}/data`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // ✅ Check sensor connection status from backend
        if (data.sensor_connected === true) {
            // Sensor is connected - show real data
            sensorConnectionState.isConnected = true;
            sensorConnectionState.lastConnectedTime = new Date();
            sensorConnectionState.reconnectAttempts = 0;
            
            updateDashboardWithSensorData(data);
            updateCharts(data);
            updateLastUpdateTime();
            
            // ML Prediction (only when sensor connected)
            makeMLPrediction(data.moisture, data.temperature);
            
            // ⭐ STEP 4: Update Motor Control
            if (window.motorControl) {
                window.motorControl.updateStatus(data);
            }
            
        } else {
            // Sensor is NOT connected
            handleSensorDisconnected();
        }

    } catch (error) {
        console.error('❌ Backend connection error:', error);
        
        // Backend is offline or unreachable
        handleBackendOffline(error);
    }
}

// ✅ STEP 3: Update Dashboard with Real Sensor Data
function updateDashboardWithSensorData(data) {
    // Temperature Card
    const tempEl = document.getElementById('temp');
    const tempSub = document.getElementById('tempSub');
    tempEl.innerText = `${data.temperature.toFixed(1)} °C`;
    tempSub.innerText = `Real-time sensor data`;
    tempSub.style.color = "var(--success-color)";
    
    // Visual alert for high temperature
    if (data.temperature > tempThreshold) {
        tempEl.style.color = "var(--danger-color)";
        if (!window.tempAlertActive) {
            showAlert(`⚠️ High Temperature: ${data.temperature.toFixed(1)}°C`, 'danger');
            speakText(`Warning. High temperature detected. ${data.temperature} degrees celsius.`);
            addLogEntry(`High Temperature Alert: ${data.temperature.toFixed(1)}°C`);
            window.tempAlertActive = true;
            setTimeout(() => window.tempAlertActive = false, 10000);
        }
    } else {
        tempEl.style.color = "var(--text-main)";
    }

    // Humidity Card
    const humEl = document.getElementById('hum');
    const humSub = document.getElementById('humSub');
    humEl.innerText = `${data.humidity.toFixed(1)} %`;
    humSub.innerText = `Optimal range: 40-70%`;
    humSub.style.color = "var(--text-muted)";

    // Soil Moisture Card
    const soilEl = document.getElementById('soil');
    const soilSub = document.getElementById('soilSub');
    soilEl.innerText = `${data.moisture.toFixed(1)} %`;
    
    // Color-code based on moisture level
    if (data.moisture < moistureThreshold) {
        soilEl.style.color = "var(--danger-color)";
        soilSub.innerText = `⚠️ Dry soil - irrigation needed`;
        soilSub.style.color = "var(--danger-color)";
        
        if (!window.moistureAlertActive) {
            showAlert(`💧 Low Soil Moisture: ${data.moisture.toFixed(1)}%`, 'warning');
            speakText(`Alert. Dry soil detected. Moisture level is ${data.moisture.toFixed(0)} percent.`);
            addLogEntry(`Low Moisture Alert: ${data.moisture.toFixed(1)}%`);
            window.moistureAlertActive = true;
            setTimeout(() => window.moistureAlertActive = false, 10000);
        }
    } else if (data.moisture > 90) {
        soilEl.style.color = "var(--danger-color)";
        soilSub.innerText = `⚠️ Water overflow detected`;
        soilSub.style.color = "var(--danger-color)";
    } else {
        soilEl.style.color = "var(--success-color)";
        soilSub.innerText = `✓ Optimal moisture level`;
        soilSub.style.color = "var(--success-color)";
        window.moistureAlertActive = false;
    }

    // Motor Status Card
    const motorEl = document.getElementById('motor');
    const motorSub = document.getElementById('motorSub');
    const motorStatus = data.motor_status;
    
    motorEl.innerText = motorStatus;
    
    // Alert on motor state change
    if (window.lastMotorStatus && window.lastMotorStatus !== motorStatus) {
        if (motorStatus === "ON") {
            showAlert("✓ Motor activated automatically", "success");
            addLogEntry("Motor: Activated (Auto-irrigation)");
        }
        if (motorStatus === "OFF") {
            showAlert("Motor deactivated", "info");
            addLogEntry("Motor: Deactivated");
        }
        if (motorStatus.includes("OVERFLOW") || motorStatus.includes("FORCED OFF")) {
            showAlert("🚨 Water Overflow! Motor Disabled for Safety", "danger");
            speakText("Critical alert. Water overflow detected. Motor has been disabled for safety.");
            addLogEntry("CRITICAL: Water Overflow - Motor Force Stopped");
        }
    }
    window.lastMotorStatus = motorStatus;

    // Color-code motor status
    if (motorStatus === "ON") {
        motorEl.style.color = "var(--success-color)";
        motorSub.innerText = `✓ Irrigation in progress`;
        motorSub.style.color = "var(--success-color)";
    } else if (motorStatus.includes("OVERFLOW") || motorStatus.includes("FORCED OFF")) {
        motorEl.style.color = "var(--danger-color)";
        motorSub.innerText = `⚠️ Safety cutoff activated`;
        motorSub.style.color = "var(--danger-color)";
    } else {
        motorEl.style.color = "var(--text-muted)";
        motorSub.innerText = `Standby mode`;
        motorSub.style.color = "var(--text-muted)";
    }

    // Update Soil Status Banner
    const statusEl = document.getElementById('soilStatusText');
    if (data.soil_condition) {
        statusEl.innerText = data.soil_condition;
        
        // Color-code status banner
        const banner = document.getElementById('statusBanner');
        if (data.soil_condition.includes("Critical") || data.soil_condition.includes("Danger")) {
            banner.style.borderLeftColor = "var(--danger-color)";
        } else if (data.soil_condition.includes("Optimal")) {
            banner.style.borderLeftColor = "var(--success-color)";
        } else {
            banner.style.borderLeftColor = "var(--primary-color)";
        }
    }

    // Update System Status Indicator
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('systemStatusText');
    if (statusDot && statusText) {
        statusDot.style.background = "var(--success-color)";
        statusDot.style.boxShadow = "0 0 10px var(--success-color)";
        statusText.innerText = "System Online";
    }
}

// ✅ STEP 3: Handle Sensor Disconnected State
function handleSensorDisconnected() {
    sensorConnectionState.isConnected = false;
    sensorConnectionState.reconnectAttempts++;
    
    // Update all sensor cards to show "Not Connected"
    const tempEl = document.getElementById('temp');
    const tempSub = document.getElementById('tempSub');
    tempEl.innerText = "-- °C";
    tempEl.style.color = "var(--text-muted)";
    tempSub.innerText = "⚠️ Sensor not connected";
    tempSub.style.color = "var(--danger-color)";

    const humEl = document.getElementById('hum');
    const humSub = document.getElementById('humSub');
    humEl.innerText = "-- %";
    humEl.style.color = "var(--text-muted)";
    humSub.innerText = "⚠️ Sensor not connected";
    humSub.style.color = "var(--danger-color)";

    const soilEl = document.getElementById('soil');
    const soilSub = document.getElementById('soilSub');
    soilEl.innerText = "-- %";
    soilEl.style.color = "var(--text-muted)";
    soilSub.innerText = "⚠️ Sensor not connected";
    soilSub.style.color = "var(--danger-color)";

    const motorEl = document.getElementById('motor');
    const motorSub = document.getElementById('motorSub');
    motorEl.innerText = "Not Connected";
    motorEl.style.color = "var(--text-muted)";
    motorSub.innerText = "⚠️ Motor not connected";
    motorSub.style.color = "var(--danger-color)";

    // Update Status Banner
    const statusEl = document.getElementById('soilStatusText');
    statusEl.innerText = "⚠️ Sensor Not Connected - Check Physical Wiring";
    
    const banner = document.getElementById('statusBanner');
    banner.style.borderLeftColor = "var(--danger-color)";

    // Update System Status Indicator
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('systemStatusText');
    if (statusDot && statusText) {
        statusDot.style.background = "var(--danger-color)";
        statusDot.style.boxShadow = "0 0 10px var(--danger-color)";
        statusText.innerText = "Sensor Offline";
    }

    // Show alert (with cooldown to avoid spam)
    if (!window.sensorDisconnectAlertActive) {
        showAlert("⚠️ Sensor disconnected. Please check Arduino connection and wiring.", "danger");
        speakText("Warning. Sensor disconnected. Please check physical wiring.");
        addLogEntry("ALERT: Sensor Disconnected - Check Hardware");
        
        window.sensorDisconnectAlertActive = true;
        setTimeout(() => window.sensorDisconnectAlertActive = false, 30000); // 30 second cooldown
    }

    // Update ML Status
    const mlStatus = document.getElementById('mlStatus');
    if (mlStatus) {
        mlStatus.innerText = "Waiting for sensor data...";
        mlStatus.style.color = "var(--text-muted)";
    }
}

// ✅ STEP 3: Handle Backend Offline State
function handleBackendOffline(error) {
    console.error("Backend offline:", error);
    
    // Update all cards to show backend offline
    const tempEl = document.getElementById('temp');
    const tempSub = document.getElementById('tempSub');
    tempEl.innerText = "-- °C";
    tempEl.style.color = "var(--text-muted)";
    tempSub.innerText = "⚠️ Backend server offline";
    tempSub.style.color = "var(--danger-color)";

    const humEl = document.getElementById('hum');
    const humSub = document.getElementById('humSub');
    humEl.innerText = "-- %";
    humEl.style.color = "var(--text-muted)";
    humSub.innerText = "⚠️ Backend server offline";
    humSub.style.color = "var(--danger-color)";

    const soilEl = document.getElementById('soil');
    const soilSub = document.getElementById('soilSub');
    soilEl.innerText = "-- %";
    soilEl.style.color = "var(--text-muted)";
    soilSub.innerText = "⚠️ Backend server offline";
    soilSub.style.color = "var(--danger-color)";

    const motorEl = document.getElementById('motor');
    const motorSub = document.getElementById('motorSub');
    motorEl.innerText = "Offline";
    motorEl.style.color = "var(--text-muted)";
    motorSub.innerText = "⚠️ Backend server offline";
    motorSub.style.color = "var(--danger-color)";

    // Update Status Banner
    const statusEl = document.getElementById('soilStatusText');
    statusEl.innerText = "⚠️ Backend Server Offline - Start Flask Server";
    
    const banner = document.getElementById('statusBanner');
    banner.style.borderLeftColor = "var(--danger-color)";

    // Update System Status
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('systemStatusText');
    if (statusDot && statusText) {
        statusDot.style.background = "#ff4757";
        statusDot.style.boxShadow = "0 0 10px #ff4757";
        statusText.innerText = "Backend Offline";
    }

    // Show alert (with cooldown)
    if (!window.backendOfflineAlertActive) {
        showAlert("⚠️ Backend server offline. Please start Flask server: python app.py", "danger");
        addLogEntry("ERROR: Backend Server Offline");
        
        window.backendOfflineAlertActive = true;
        setTimeout(() => window.backendOfflineAlertActive = false, 30000);
    }
}

// ✅ STEP 3: Update Last Update Time
function updateLastUpdateTime() {
    const lastUpdateEl = document.getElementById('lastUpdateTime');
    if (lastUpdateEl) {
        const now = new Date();
        lastUpdateEl.innerText = now.toLocaleTimeString();
    }
}

// ✅ STEP 3: Chart Updates (only with real data)
let timeLabels = [];
let tempData = [];
let humData = [];
let soilData = [];

function updateCharts(data) {
    // Only update charts if sensor is connected
    if (!sensorConnectionState.isConnected) {
        return;
    }

    const now = new Date();
    const timeString = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    // Keep last 20 data points
    if (timeLabels.length > 20) {
        timeLabels.shift();
        tempData.shift();
        humData.shift();
        soilData.shift();
    }

    timeLabels.push(timeString);
    tempData.push(data.temperature);
    humData.push(data.humidity);
    soilData.push(data.moisture);

    // Update Environmental Chart
    if (window.envChart) {
        window.envChart.data.labels = timeLabels;
        window.envChart.data.datasets[0].data = tempData;
        window.envChart.data.datasets[1].data = humData;
        window.envChart.update('none'); // No animation for performance
    }

    // Update Soil Chart
    if (window.soilChart) {
        window.soilChart.data.labels = timeLabels;
        window.soilChart.data.datasets[0].data = soilData;
        window.soilChart.update('none');
    }
}

// ✅ STEP 3: Start Real-Time Data Polling
function startSensorPolling() {
    // Initial fetch
    fetchData();
    
    // Poll at configured interval
    mainIntervalId = setInterval(fetchData, refreshInterval);
    
    console.log(`✅ Sensor polling started (${refreshInterval}ms interval)`);
}

// ✅ STEP 3: Stop Polling
function stopSensorPolling() {
    if (mainIntervalId) {
        clearInterval(mainIntervalId);
        mainIntervalId = null;
        console.log("⏸️ Sensor polling stopped");
    }
}

// ✅ STEP 3: Restart Polling with New Interval
function restartSensorPolling(newInterval) {
    stopSensorPolling();
    refreshInterval = newInterval;
    startSensorPolling();
    console.log(`🔄 Sensor polling restarted (${newInterval}ms interval)`);
}

// ✅ STEP 3: Initialize on Page Load
document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 Initializing Sensor Integration System...");
    
    // Start polling
    startSensorPolling();
    
    // Add connection status to log
    addLogEntry("System Initialized - Connecting to sensors...");
});

// Export functions for use in other scripts
window.sensorIntegration = {
    fetchData,
    startPolling: startSensorPolling,
    stopPolling: stopSensorPolling,
    restartPolling: restartSensorPolling,
    getConnectionState: () => sensorConnectionState
};

console.log("✅ Sensor Integration Module Loaded");
