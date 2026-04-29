/* ========================================
   STEP 4: MOTOR CONTROL SYSTEM
   - Motor ON/OFF based on soil moisture ✅
   - Auto OFF after long running time ⭐ NEW
   - Detect water overflow and stop motor ✅
   - Show "Motor not connected" ✅
======================================== */

const BACKEND_URL = "http://localhost:5000";

// Motor Control State
let motorControlState = {
    isConnected: false,
    currentStatus: "UNKNOWN",
    lastStatusChange: null,
    runningStartTime: null,
    totalRunTime: 0,
    maxRunTime: 300000, // 5 minutes default (300 seconds)
    autoOffEnabled: true,
    runHistory: []
};

// Motor Control Settings (configurable)
let motorSettings = {
    maxContinuousRunTime: 300000, // 5 minutes in milliseconds
    autoOffWarningTime: 60000, // Warn 1 minute before auto-off
    overflowThreshold: 90, // Moisture % for overflow
    dryThreshold: 40, // Moisture % for dry soil
    cooldownPeriod: 30000 // 30 seconds between motor cycles
};

// Load settings from localStorage
function loadMotorSettings() {
    const saved = localStorage.getItem('motorSettings');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            motorSettings = { ...motorSettings, ...parsed };
            console.log("✅ Motor settings loaded:", motorSettings);
        } catch (e) {
            console.error("Failed to load motor settings:", e);
        }
    }
}

// Save settings to localStorage
function saveMotorSettings() {
    localStorage.setItem('motorSettings', JSON.stringify(motorSettings));
    console.log("💾 Motor settings saved");
}

// ✅ STEP 4: Enhanced Motor Status Update
function updateMotorStatus(data) {
    if (!data || data.sensor_connected === false) {
        handleMotorDisconnected();
        return;
    }

    const newStatus = data.motor_status;
    const moisture = data.moisture;
    const previousStatus = motorControlState.currentStatus;

    // Update connection state
    motorControlState.isConnected = true;
    
    // Detect status change
    if (newStatus !== previousStatus) {
        handleMotorStatusChange(previousStatus, newStatus, moisture);
    }

    // Update current status
    motorControlState.currentStatus = newStatus;

    // ⭐ NEW: Track running time for auto-off
    if (newStatus === "ON") {
        trackMotorRunTime();
    } else {
        // Motor is OFF - reset run timer
        if (motorControlState.runningStartTime) {
            const runDuration = Date.now() - motorControlState.runningStartTime;
            motorControlState.totalRunTime += runDuration;
            
            // Add to history
            motorControlState.runHistory.push({
                startTime: new Date(motorControlState.runningStartTime),
                endTime: new Date(),
                duration: runDuration,
                reason: newStatus.includes("OVERFLOW") ? "overflow" : "normal"
            });
            
            // Keep last 10 runs
            if (motorControlState.runHistory.length > 10) {
                motorControlState.runHistory.shift();
            }
            
            motorControlState.runningStartTime = null;
        }
    }

    // Update UI
    updateMotorUI(newStatus, moisture);
}

// ⭐ NEW: Track Motor Running Time and Auto-Off
function trackMotorRunTime() {
    // Start timer if not already started
    if (!motorControlState.runningStartTime) {
        motorControlState.runningStartTime = Date.now();
        console.log("⏱️ Motor run timer started");
    }

    const runDuration = Date.now() - motorControlState.runningStartTime;
    const maxRunTime = motorSettings.maxContinuousRunTime;
    const warningTime = motorSettings.autoOffWarningTime;

    // Check if approaching max run time (1 minute warning)
    if (runDuration >= (maxRunTime - warningTime) && runDuration < maxRunTime) {
        const remainingSeconds = Math.ceil((maxRunTime - runDuration) / 1000);
        
        if (!window.motorWarningShown) {
            showAlert(`⚠️ Motor will auto-off in ${remainingSeconds} seconds to prevent overwatering`, 'warning');
            speakText(`Warning. Motor will automatically turn off in ${remainingSeconds} seconds to prevent overwatering.`);
            addLogEntry(`Motor Auto-Off Warning: ${remainingSeconds}s remaining`);
            window.motorWarningShown = true;
            
            // Reset warning flag after cooldown
            setTimeout(() => window.motorWarningShown = false, 30000);
        }
    }

    // ⭐ AUTO-OFF: Force motor off if exceeded max run time
    if (runDuration >= maxRunTime && motorSettings.autoOffEnabled) {
        requestMotorAutoOff();
    }

    // Update run time display
    updateMotorRunTimeDisplay(runDuration);
}

// ⭐ NEW: Request Motor Auto-Off from Backend
async function requestMotorAutoOff() {
    console.log("🛑 Requesting motor auto-off (max run time exceeded)");
    
    try {
        // Send command to backend to force motor off
        const response = await fetch(`${BACKEND_URL}/motor/force_off`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                reason: 'max_run_time_exceeded',
                duration: Date.now() - motorControlState.runningStartTime
            })
        });

        if (response.ok) {
            const data = await response.json();
            console.log("✅ Motor auto-off successful:", data);
            
            showAlert("🛑 Motor Auto-OFF: Maximum run time exceeded (5 minutes)", 'warning');
            speakText("Motor has been automatically turned off after running for 5 minutes to prevent overwatering.");
            addLogEntry("Motor Auto-OFF: Max run time exceeded (5 min)");
            
            // Reset timer
            motorControlState.runningStartTime = null;
        } else {
            console.error("❌ Motor auto-off request failed:", response.status);
        }
    } catch (error) {
        console.error("❌ Motor auto-off error:", error);
        // Fallback: Show alert even if backend request fails
        showAlert("⚠️ Motor should be turned off manually (max run time exceeded)", 'danger');
    }
}

// ✅ Handle Motor Status Change
function handleMotorStatusChange(oldStatus, newStatus, moisture) {
    console.log(`🔄 Motor status changed: ${oldStatus} → ${newStatus}`);
    
    motorControlState.lastStatusChange = new Date();

    // Motor turned ON
    if (newStatus === "ON" && oldStatus !== "ON") {
        showAlert("✅ Motor Activated: Irrigation started", "success");
        speakText(`Motor activated. Irrigation started. Soil moisture is ${moisture.toFixed(0)} percent.`);
        addLogEntry(`Motor ON: Irrigation started (Moisture: ${moisture.toFixed(1)}%)`);
        
        // Start run timer
        motorControlState.runningStartTime = Date.now();
    }

    // Motor turned OFF (normal)
    if (newStatus === "OFF" && oldStatus === "ON") {
        const runDuration = motorControlState.runningStartTime 
            ? Date.now() - motorControlState.runningStartTime 
            : 0;
        const runMinutes = Math.floor(runDuration / 60000);
        const runSeconds = Math.floor((runDuration % 60000) / 1000);
        
        showAlert(`Motor Deactivated: Ran for ${runMinutes}m ${runSeconds}s`, "info");
        addLogEntry(`Motor OFF: Ran for ${runMinutes}m ${runSeconds}s (Moisture: ${moisture.toFixed(1)}%)`);
    }

    // Motor FORCED OFF (overflow)
    if (newStatus.includes("OVERFLOW") || newStatus.includes("FORCED OFF")) {
        showAlert("🚨 CRITICAL: Water Overflow Detected! Motor Force Stopped", "danger");
        speakText("Critical alert. Water overflow detected. Motor has been force stopped for safety.");
        addLogEntry(`CRITICAL: Motor Force Stopped - Water Overflow (Moisture: ${moisture.toFixed(1)}%)`);
        
        // Reset timer
        motorControlState.runningStartTime = null;
    }
}

// ✅ Handle Motor Disconnected
function handleMotorDisconnected() {
    motorControlState.isConnected = false;
    motorControlState.currentStatus = "DISCONNECTED";
    motorControlState.runningStartTime = null;

    const motorEl = document.getElementById('motor');
    const motorSub = document.getElementById('motorSub');
    
    if (motorEl && motorSub) {
        motorEl.innerText = "Not Connected";
        motorEl.style.color = "var(--text-muted)";
        motorSub.innerText = "⚠️ Motor not connected";
        motorSub.style.color = "var(--danger-color)";
    }

    // Hide run time display
    const runTimeEl = document.getElementById('motorRunTime');
    if (runTimeEl) {
        runTimeEl.style.display = 'none';
    }
}

// ✅ Update Motor UI
function updateMotorUI(status, moisture) {
    const motorEl = document.getElementById('motor');
    const motorSub = document.getElementById('motorSub');
    
    if (!motorEl || !motorSub) return;

    motorEl.innerText = status;

    // Color-code based on status
    if (status === "ON") {
        motorEl.style.color = "var(--success-color)";
        motorSub.innerText = "✓ Irrigation in progress";
        motorSub.style.color = "var(--success-color)";
    } else if (status.includes("OVERFLOW") || status.includes("FORCED OFF")) {
        motorEl.style.color = "var(--danger-color)";
        motorSub.innerText = "⚠️ Safety cutoff activated";
        motorSub.style.color = "var(--danger-color)";
    } else if (status === "OFF") {
        motorEl.style.color = "var(--text-muted)";
        
        // Show reason for being off
        if (moisture < motorSettings.dryThreshold) {
            motorSub.innerText = "⏳ Cooldown period";
            motorSub.style.color = "var(--text-muted)";
        } else {
            motorSub.innerText = "Standby mode";
            motorSub.style.color = "var(--text-muted)";
        }
    } else {
        motorEl.style.color = "var(--text-muted)";
        motorSub.innerText = status;
        motorSub.style.color = "var(--text-muted)";
    }
}

// ⭐ NEW: Update Motor Run Time Display
function updateMotorRunTimeDisplay(runDuration) {
    let runTimeEl = document.getElementById('motorRunTime');
    
    // Create element if it doesn't exist
    if (!runTimeEl) {
        const motorCard = document.getElementById('motorCard');
        if (!motorCard) return;
        
        runTimeEl = document.createElement('div');
        runTimeEl.id = 'motorRunTime';
        runTimeEl.className = 'motor-run-time';
        motorCard.appendChild(runTimeEl);
    }

    if (runDuration > 0) {
        const minutes = Math.floor(runDuration / 60000);
        const seconds = Math.floor((runDuration % 60000) / 1000);
        const maxMinutes = Math.floor(motorSettings.maxContinuousRunTime / 60000);
        
        runTimeEl.style.display = 'block';
        runTimeEl.innerHTML = `
            <div class="run-time-label">Running Time:</div>
            <div class="run-time-value">${minutes}m ${seconds}s / ${maxMinutes}m max</div>
            <div class="run-time-bar">
                <div class="run-time-fill" style="width: ${(runDuration / motorSettings.maxContinuousRunTime) * 100}%"></div>
            </div>
        `;
        
        // Color-code progress bar
        const fillEl = runTimeEl.querySelector('.run-time-fill');
        const percentage = (runDuration / motorSettings.maxContinuousRunTime) * 100;
        
        if (percentage < 70) {
            fillEl.style.background = "var(--success-color)";
        } else if (percentage < 90) {
            fillEl.style.background = "#ffa500"; // Orange
        } else {
            fillEl.style.background = "var(--danger-color)";
        }
    } else {
        runTimeEl.style.display = 'none';
    }
}

// ⭐ NEW: Manual Motor Control (for testing/emergency)
async function manualMotorControl(action) {
    console.log(`🎮 Manual motor control: ${action}`);
    
    try {
        const response = await fetch(`${BACKEND_URL}/motor/manual`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action })
        });

        if (response.ok) {
            const data = await response.json();
            showAlert(`Manual Control: Motor ${action.toUpperCase()}`, 'info');
            addLogEntry(`Manual Control: Motor ${action.toUpperCase()}`);
            return data;
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        console.error("Manual motor control error:", error);
        showAlert("Manual control failed. Check backend connection.", 'danger');
    }
}

// ⭐ NEW: Get Motor Statistics
function getMotorStatistics() {
    const totalRuns = motorControlState.runHistory.length;
    const totalRunTime = motorControlState.runHistory.reduce((sum, run) => sum + run.duration, 0);
    const avgRunTime = totalRuns > 0 ? totalRunTime / totalRuns : 0;
    
    const overflowStops = motorControlState.runHistory.filter(run => run.reason === 'overflow').length;
    const normalStops = motorControlState.runHistory.filter(run => run.reason === 'normal').length;

    return {
        totalRuns,
        totalRunTime: Math.floor(totalRunTime / 1000), // seconds
        avgRunTime: Math.floor(avgRunTime / 1000), // seconds
        overflowStops,
        normalStops,
        currentStatus: motorControlState.currentStatus,
        isRunning: motorControlState.currentStatus === "ON",
        currentRunTime: motorControlState.runningStartTime 
            ? Date.now() - motorControlState.runningStartTime 
            : 0
    };
}

// ⭐ NEW: Update Settings from UI
function updateMotorSettings(newSettings) {
    motorSettings = { ...motorSettings, ...newSettings };
    saveMotorSettings();
    console.log("✅ Motor settings updated:", motorSettings);
    showAlert("Motor settings saved successfully", "success");
}

// ✅ Initialize Motor Control System
function initMotorControl() {
    console.log("🚀 Initializing Motor Control System...");
    
    // Load saved settings
    loadMotorSettings();
    
    // Add motor control to settings panel
    addMotorSettingsToUI();
    
    console.log("✅ Motor Control System initialized");
}

// ⭐ NEW: Add Motor Settings to Settings Panel
function addMotorSettingsToUI() {
    const settingsModal = document.querySelector('#settingsModal .modal-content');
    if (!settingsModal) return;

    // Check if already added
    if (document.getElementById('motorMaxRunTime')) return;

    // Find the save button
    const saveBtn = document.getElementById('saveSettings');
    if (!saveBtn) return;

    // Create motor settings section
    const motorSettingsHTML = `
        <div class="setting-section">
            <h3 style="color: var(--primary-color); margin-top: 20px; margin-bottom: 15px;">
                <i class="fa-solid fa-gears"></i> Motor Control Settings
            </h3>
            
            <div class="setting-item">
                <label for="motorMaxRunTime">Maximum Continuous Run Time (minutes)</label>
                <input type="number" id="motorMaxRunTime" value="${motorSettings.maxContinuousRunTime / 60000}" min="1" max="30">
                <small style="color: var(--text-muted); display: block; margin-top: 5px;">
                    Motor will auto-off after this duration to prevent overwatering
                </small>
            </div>
            
            <div class="setting-item setting-item-row">
                <label for="motorAutoOffToggle">Enable Auto-Off Timer</label>
                <label class="switch">
                    <input type="checkbox" id="motorAutoOffToggle" ${motorSettings.autoOffEnabled ? 'checked' : ''}>
                    <span class="slider round"></span>
                </label>
            </div>
        </div>
    `;

    // Insert before save button
    saveBtn.insertAdjacentHTML('beforebegin', motorSettingsHTML);

    // Update save button handler
    const originalSaveHandler = saveBtn.onclick;
    saveBtn.onclick = () => {
        // Call original handler
        if (originalSaveHandler) originalSaveHandler();

        // Save motor settings
        const maxRunTime = parseInt(document.getElementById('motorMaxRunTime').value) * 60000;
        const autoOffEnabled = document.getElementById('motorAutoOffToggle').checked;

        updateMotorSettings({
            maxContinuousRunTime: maxRunTime,
            autoOffEnabled: autoOffEnabled
        });
    };
}

// Export functions for global access
window.motorControl = {
    updateStatus: updateMotorStatus,
    manualControl: manualMotorControl,
    getStatistics: getMotorStatistics,
    updateSettings: updateMotorSettings,
    getState: () => motorControlState,
    getSettings: () => motorSettings
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initMotorControl();
});

console.log("✅ Motor Control Module Loaded");
