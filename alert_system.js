/* ========================================
   STEP 5: COMPREHENSIVE ALERT SYSTEM
   - Dry soil alerts ✅
   - Water overflow alerts ✅
   - Message alerts ✅
   - Voice alerts ✅
   - Buzzer alert (Arduino) ⭐
   - Animal/bird detection ⭐
======================================== */

const BACKEND_URL = "http://localhost:5000";

// Alert System State
let alertSystemState = {
    activeAlerts: [],
    alertHistory: [],
    mutedAlerts: new Set(),
    voiceEnabled: true,
    buzzerEnabled: true,
    animalDetectionEnabled: true,
    lastAnimalAlert: null
};

// Alert Types Configuration
const ALERT_TYPES = {
    DRY_SOIL: {
        id: 'dry_soil',
        icon: 'fa-droplet',
        color: 'warning',
        priority: 2,
        cooldown: 10000, // 10 seconds
        buzzer: true,
        voice: true
    },
    WATER_OVERFLOW: {
        id: 'water_overflow',
        icon: 'fa-water',
        color: 'danger',
        priority: 1, // Highest priority
        cooldown: 10000,
        buzzer: true,
        voice: true
    },
    HIGH_TEMPERATURE: {
        id: 'high_temp',
        icon: 'fa-temperature-high',
        color: 'danger',
        priority: 2,
        cooldown: 10000,
        buzzer: false,
        voice: true
    },
    ANIMAL_DETECTED: {
        id: 'animal_detected',
        icon: 'fa-paw',
        color: 'warning',
        priority: 1,
        cooldown: 30000, // 30 seconds
        buzzer: true,
        voice: true
    },
    SENSOR_DISCONNECTED: {
        id: 'sensor_disconnected',
        icon: 'fa-plug-circle-xmark',
        color: 'danger',
        priority: 2,
        cooldown: 30000,
        buzzer: false,
        voice: true
    },
    MOTOR_AUTO_OFF: {
        id: 'motor_auto_off',
        icon: 'fa-power-off',
        color: 'warning',
        priority: 2,
        cooldown: 60000,
        buzzer: false,
        voice: true
    }
};

// ✅ Enhanced Alert Function
function triggerAlert(type, message, data = {}) {
    const alertConfig = ALERT_TYPES[type];
    if (!alertConfig) {
        console.error(`Unknown alert type: ${type}`);
        return;
    }

    // Check if alert is muted
    if (alertSystemState.mutedAlerts.has(alertConfig.id)) {
        console.log(`Alert muted: ${type}`);
        return;
    }

    // Check cooldown
    const lastAlert = alertSystemState.activeAlerts.find(a => a.type === type);
    if (lastAlert) {
        const timeSinceLastAlert = Date.now() - lastAlert.timestamp;
        if (timeSinceLastAlert < alertConfig.cooldown) {
            console.log(`Alert on cooldown: ${type} (${timeSinceLastAlert}ms / ${alertConfig.cooldown}ms)`);
            return;
        }
    }

    // Create alert object
    const alert = {
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        message,
        data,
        timestamp: Date.now(),
        priority: alertConfig.priority,
        acknowledged: false
    };

    // Add to active alerts
    alertSystemState.activeAlerts.push(alert);

    // Add to history (keep last 50)
    alertSystemState.alertHistory.unshift(alert);
    if (alertSystemState.alertHistory.length > 50) {
        alertSystemState.alertHistory.pop();
    }

    // Display visual alert
    showAlert(message, alertConfig.color, alertConfig.icon);

    // Trigger voice alert
    if (alertConfig.voice && alertSystemState.voiceEnabled) {
        speakText(message);
    }

    // ⭐ Trigger buzzer alert (Arduino)
    if (alertConfig.buzzer && alertSystemState.buzzerEnabled) {
        triggerBuzzer(type, data);
    }

    // Log to activity
    addLogEntry(`ALERT: ${message}`);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        const index = alertSystemState.activeAlerts.findIndex(a => a.id === alert.id);
        if (index !== -1) {
            alertSystemState.activeAlerts.splice(index, 1);
        }
    }, 5000);

    console.log(`✅ Alert triggered: ${type}`, alert);
    return alert;
}

// ⭐ NEW: Trigger Buzzer via Backend
async function triggerBuzzer(alertType, data = {}) {
    try {
        const response = await fetch(`${BACKEND_URL}/buzzer/trigger`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                alert_type: alertType,
                duration: getBuzzerDuration(alertType),
                pattern: getBuzzerPattern(alertType),
                data
            })
        });

        if (response.ok) {
            const result = await response.json();
            console.log('🔔 Buzzer triggered:', result);
        } else {
            console.warn('⚠️ Buzzer trigger failed:', response.status);
        }
    } catch (error) {
        console.error('❌ Buzzer trigger error:', error);
    }
}

// ⭐ Get Buzzer Duration based on Alert Type
function getBuzzerDuration(alertType) {
    const durations = {
        'WATER_OVERFLOW': 5000, // 5 seconds (critical)
        'ANIMAL_DETECTED': 3000, // 3 seconds
        'DRY_SOIL': 2000, // 2 seconds
        'default': 1000 // 1 second
    };
    return durations[alertType] || durations.default;
}

// ⭐ Get Buzzer Pattern based on Alert Type
function getBuzzerPattern(alertType) {
    const patterns = {
        'WATER_OVERFLOW': 'continuous', // Continuous beep
        'ANIMAL_DETECTED': 'rapid', // Rapid beeps
        'DRY_SOIL': 'slow', // Slow beeps
        'default': 'single' // Single beep
    };
    return patterns[alertType] || patterns.default;
}

// ⭐ NEW: Animal/Bird Detection System
let animalDetectionInterval = null;

function startAnimalDetection() {
    if (!alertSystemState.animalDetectionEnabled) {
        console.log('Animal detection disabled');
        return;
    }

    // Poll every 15 seconds
    animalDetectionInterval = setInterval(checkAnimalDetection, 15000);
    console.log('🐾 Animal detection started (15s interval)');
}

function stopAnimalDetection() {
    if (animalDetectionInterval) {
        clearInterval(animalDetectionInterval);
        animalDetectionInterval = null;
        console.log('🐾 Animal detection stopped');
    }
}

async function checkAnimalDetection() {
    try {
        const response = await fetch(`${BACKEND_URL}/api/detect`);
        if (!response.ok) return;

        const data = await response.json();

        if (data.detected) {
            handleAnimalDetection(data);
        }
    } catch (error) {
        console.error('Animal detection error:', error);
    }
}

function handleAnimalDetection(data) {
    const threat = data.threat || 'Unknown Animal';
    const message = data.message || `Alert! ${threat} detected near crops!`;

    // Trigger comprehensive alert
    triggerAlert('ANIMAL_DETECTED', message, {
        threat,
        timestamp: new Date().toISOString()
    });

    // Update last detection time
    alertSystemState.lastAnimalAlert = Date.now();

    // Show detailed notification
    showAnimalDetectionNotification(threat);
}

// ⭐ Show Enhanced Animal Detection Notification
function showAnimalDetectionNotification(threat) {
    const container = document.getElementById('alerts-container');
    if (!container) return;

    const alertEl = document.createElement('div');
    alertEl.className = 'alert danger animal-alert';
    alertEl.innerHTML = `
        <i class="fa-solid fa-paw"></i>
        <div class="alert-content">
            <div class="alert-title">🚨 Animal Detected!</div>
            <div class="alert-message">${threat} movement detected by PIR sensor</div>
            <div class="alert-actions">
                <button class="alert-btn" onclick="acknowledgeAnimalAlert()">
                    <i class="fa-solid fa-check"></i> Acknowledged
                </button>
                <button class="alert-btn" onclick="muteAnimalAlerts(30)">
                    <i class="fa-solid fa-bell-slash"></i> Mute 30min
                </button>
            </div>
        </div>
    `;
    container.appendChild(alertEl);

    // Auto-remove after 10 seconds
    setTimeout(() => {
        alertEl.style.animation = 'slideOutRight 0.5s forwards';
        setTimeout(() => alertEl.remove(), 500);
    }, 10000);
}

// ⭐ Acknowledge Animal Alert
window.acknowledgeAnimalAlert = function() {
    console.log('✅ Animal alert acknowledged');
    addLogEntry('Animal Alert: Acknowledged by user');
    
    // Remove all animal alerts from DOM
    document.querySelectorAll('.animal-alert').forEach(el => {
        el.style.animation = 'slideOutRight 0.5s forwards';
        setTimeout(() => el.remove(), 500);
    });
};

// ⭐ Mute Animal Alerts Temporarily
window.muteAnimalAlerts = function(minutes) {
    alertSystemState.mutedAlerts.add('animal_detected');
    console.log(`🔇 Animal alerts muted for ${minutes} minutes`);
    
    showAlert(`Animal alerts muted for ${minutes} minutes`, 'info');
    addLogEntry(`Animal Alerts: Muted for ${minutes} minutes`);

    // Unmute after specified time
    setTimeout(() => {
        alertSystemState.mutedAlerts.delete('animal_detected');
        console.log('🔔 Animal alerts unmuted');
        showAlert('Animal alerts re-enabled', 'success');
    }, minutes * 60000);
};

// ✅ Enhanced showAlert with Icon Support
function showAlert(message, type = 'info', customIcon = null) {
    const container = document.getElementById('alerts-container');
    if (!container) return;

    const alertEl = document.createElement('div');
    alertEl.className = `alert ${type}`;
    
    let iconClass = customIcon || 'fa-circle-info';
    if (!customIcon) {
        if (type === 'danger') iconClass = 'fa-triangle-exclamation';
        else if (type === 'warning') iconClass = 'fa-circle-exclamation';
        else if (type === 'success') iconClass = 'fa-circle-check';
    }

    alertEl.innerHTML = `<i class="fa-solid ${iconClass}"></i><span>${message}</span>`;
    container.appendChild(alertEl);

    // Auto-remove
    setTimeout(() => {
        alertEl.style.animation = 'slideOutRight 0.5s forwards';
        setTimeout(() => alertEl.remove(), 500);
    }, 5000);
}

// ⭐ Get Alert Statistics
function getAlertStatistics() {
    const stats = {
        total: alertSystemState.alertHistory.length,
        byType: {},
        last24Hours: 0,
        lastHour: 0
    };

    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const twentyFourHours = 24 * oneHour;

    alertSystemState.alertHistory.forEach(alert => {
        // Count by type
        stats.byType[alert.type] = (stats.byType[alert.type] || 0) + 1;

        // Count by time
        const age = now - alert.timestamp;
        if (age < oneHour) stats.lastHour++;
        if (age < twentyFourHours) stats.last24Hours++;
    });

    return stats;
}

// ⭐ Export Alert History
function exportAlertHistory() {
    const csv = ['Timestamp,Type,Message,Priority,Acknowledged'];
    
    alertSystemState.alertHistory.forEach(alert => {
        const row = [
            new Date(alert.timestamp).toISOString(),
            alert.type,
            `"${alert.message.replace(/"/g, '""')}"`,
            alert.priority,
            alert.acknowledged
        ];
        csv.push(row.join(','));
    });

    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alert_history_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    console.log('📥 Alert history exported');
    showAlert('Alert history exported successfully', 'success');
}

// ⭐ Clear Alert History
function clearAlertHistory() {
    if (confirm('Are you sure you want to clear all alert history?')) {
        alertSystemState.alertHistory = [];
        alertSystemState.activeAlerts = [];
        console.log('🗑️ Alert history cleared');
        showAlert('Alert history cleared', 'info');
    }
}

// ⭐ Toggle Alert Settings
function toggleAlertSetting(setting, value) {
    if (setting in alertSystemState) {
        alertSystemState[setting] = value;
        localStorage.setItem('alertSystemState', JSON.stringify(alertSystemState));
        console.log(`✅ Alert setting updated: ${setting} = ${value}`);
    }
}

// ⭐ Load Alert Settings
function loadAlertSettings() {
    const saved = localStorage.getItem('alertSystemState');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            alertSystemState = { ...alertSystemState, ...parsed };
            // Convert mutedAlerts back to Set
            if (Array.isArray(parsed.mutedAlerts)) {
                alertSystemState.mutedAlerts = new Set(parsed.mutedAlerts);
            }
            console.log('✅ Alert settings loaded');
        } catch (e) {
            console.error('Failed to load alert settings:', e);
        }
    }
}

// ⭐ Save Alert Settings
function saveAlertSettings() {
    const toSave = {
        ...alertSystemState,
        mutedAlerts: Array.from(alertSystemState.mutedAlerts),
        activeAlerts: [], // Don't persist active alerts
        alertHistory: alertSystemState.alertHistory.slice(0, 50) // Keep last 50
    };
    localStorage.setItem('alertSystemState', JSON.stringify(toSave));
    console.log('💾 Alert settings saved');
}

// ⭐ Add Alert Settings to UI
function addAlertSettingsToUI() {
    const settingsModal = document.querySelector('#settingsModal .modal-content');
    if (!settingsModal) return;

    // Check if already added
    if (document.getElementById('voiceAlertToggle')) return;

    const saveBtn = document.getElementById('saveSettings');
    if (!saveBtn) return;

    const alertSettingsHTML = `
        <div class="setting-section">
            <h3 style="color: var(--primary-color); margin-top: 20px; margin-bottom: 15px;">
                <i class="fa-solid fa-bell"></i> Alert System Settings
            </h3>
            
            <div class="setting-item setting-item-row">
                <label for="voiceAlertToggle">Voice Alerts</label>
                <label class="switch">
                    <input type="checkbox" id="voiceAlertToggle" ${alertSystemState.voiceEnabled ? 'checked' : ''}>
                    <span class="slider round"></span>
                </label>
            </div>
            
            <div class="setting-item setting-item-row">
                <label for="buzzerAlertToggle">Buzzer Alerts (Arduino)</label>
                <label class="switch">
                    <input type="checkbox" id="buzzerAlertToggle" ${alertSystemState.buzzerEnabled ? 'checked' : ''}>
                    <span class="slider round"></span>
                </label>
            </div>
            
            <div class="setting-item setting-item-row">
                <label for="animalDetectionToggle">Animal Detection</label>
                <label class="switch">
                    <input type="checkbox" id="animalDetectionToggle" ${alertSystemState.animalDetectionEnabled ? 'checked' : ''}>
                    <span class="slider round"></span>
                </label>
            </div>
            
            <div class="setting-item">
                <button class="btn-secondary" onclick="window.alertSystem.exportHistory()">
                    <i class="fa-solid fa-download"></i> Export Alert History
                </button>
            </div>
        </div>
    `;

    saveBtn.insertAdjacentHTML('beforebegin', alertSettingsHTML);

    // Update save handler
    const originalHandler = saveBtn.onclick;
    saveBtn.onclick = () => {
        if (originalHandler) originalHandler();

        // Save alert settings
        toggleAlertSetting('voiceEnabled', document.getElementById('voiceAlertToggle').checked);
        toggleAlertSetting('buzzerEnabled', document.getElementById('buzzerAlertToggle').checked);
        
        const animalDetectionEnabled = document.getElementById('animalDetectionToggle').checked;
        toggleAlertSetting('animalDetectionEnabled', animalDetectionEnabled);
        
        // Start/stop animal detection based on setting
        if (animalDetectionEnabled) {
            startAnimalDetection();
        } else {
            stopAnimalDetection();
        }

        saveAlertSettings();
    };
}

// ✅ Initialize Alert System
function initAlertSystem() {
    console.log('🚀 Initializing Alert System...');
    
    // Load saved settings
    loadAlertSettings();
    
    // Add settings to UI
    addAlertSettingsToUI();
    
    // Start animal detection if enabled
    if (alertSystemState.animalDetectionEnabled) {
        startAnimalDetection();
    }
    
    console.log('✅ Alert System initialized');
}

// Export functions for global access
window.alertSystem = {
    trigger: triggerAlert,
    getStatistics: getAlertStatistics,
    exportHistory: exportAlertHistory,
    clearHistory: clearAlertHistory,
    toggleSetting: toggleAlertSetting,
    getState: () => alertSystemState,
    startAnimalDetection,
    stopAnimalDetection
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initAlertSystem();
});

// Save settings before page unload
window.addEventListener('beforeunload', () => {
    saveAlertSettings();
});

console.log('✅ Alert System Module Loaded');
