/* ========================================
   STEP 6: ENHANCED ANIMAL & BIRD DETECTION
   - Multiple sensor zones ✅
   - Detection patterns analysis ✅
   - Historical detection data ✅
   - Zone-specific alerts ✅
   - Detection heatmap ✅
   - Threat classification ✅
   - Automated responses ✅
======================================== */

const BACKEND_URL = "http://localhost:5000";

// Detection System State
let detectionSystemState = {
    zones: {
        north: { id: 'north', name: 'North Field', enabled: true, sensitivity: 'medium', detections: [], lastDetection: null },
        south: { id: 'south', name: 'South Field', enabled: true, sensitivity: 'medium', detections: [], lastDetection: null },
        east: { id: 'east', name: 'East Field', enabled: true, sensitivity: 'high', detections: [], lastDetection: null },
        west: { id: 'west', name: 'West Field', enabled: true, sensitivity: 'low', detections: [], lastDetection: null }
    },
    detectionHistory: [],
    threatDatabase: {},
    patterns: {
        timeOfDay: {},
        threatType: {},
        zoneFrequency: {}
    },
    settings: {
        pollingInterval: 15000, // 15 seconds
        historyLimit: 200,
        patternAnalysisEnabled: true,
        autoResponseEnabled: true,
        heatmapEnabled: true
    },
    statistics: {
        totalDetections: 0,
        last24Hours: 0,
        lastWeek: 0,
        mostActiveZone: null,
        mostCommonThreat: null
    }
};

// Threat Classification Database
const THREAT_DATABASE = {
    'Wild Boar': {
        severity: 'critical',
        icon: 'fa-piggy-bank',
        color: '#c92a2a',
        damage: 'high',
        response: 'immediate',
        description: 'Highly destructive, can destroy entire crops',
        recommendations: [
            'Activate all zone alarms',
            'Deploy bright lights',
            'Consider physical barriers',
            'Alert nearby farmers'
        ]
    },
    'Flock of Birds': {
        severity: 'moderate',
        icon: 'fa-dove',
        color: '#f59f00',
        damage: 'medium',
        response: 'standard',
        description: 'Can damage seeds and young plants',
        recommendations: [
            'Use bird scarers',
            'Deploy reflective tape',
            'Sound deterrents',
            'Net vulnerable areas'
        ]
    },
    'Stray Cattle': {
        severity: 'high',
        icon: 'fa-cow',
        color: '#e67700',
        damage: 'high',
        response: 'urgent',
        description: 'Can trample and eat crops',
        recommendations: [
            'Check fence integrity',
            'Alert local authorities',
            'Guide away from crops',
            'Strengthen barriers'
        ]
    },
    'Monkey': {
        severity: 'high',
        icon: 'fa-paw',
        color: '#d9480f',
        damage: 'high',
        response: 'urgent',
        description: 'Intelligent, can cause repeated damage',
        recommendations: [
            'Use loud deterrents',
            'Remove food sources',
            'Deploy motion-activated sprinklers',
            'Contact wildlife control'
        ]
    },
    'Deer': {
        severity: 'moderate',
        icon: 'fa-deer',
        color: '#a61e4d',
        damage: 'medium',
        response: 'standard',
        description: 'Grazes on crops, especially at dawn/dusk',
        recommendations: [
            'Install taller fencing',
            'Use scent deterrents',
            'Motion-activated lights',
            'Plant deterrent vegetation'
        ]
    },
    'Unknown Animal': {
        severity: 'moderate',
        icon: 'fa-question',
        color: '#868e96',
        damage: 'unknown',
        response: 'standard',
        description: 'Unidentified threat detected',
        recommendations: [
            'Investigate immediately',
            'Review camera footage',
            'Increase monitoring',
            'Document for identification'
        ]
    }
};

// ⭐ Enhanced Detection with Zone Support
async function checkEnhancedDetection() {
    try {
        // Check main detection endpoint
        const response = await fetch(`${BACKEND_URL}/api/detect`);
        if (!response.ok) return;

        const data = await response.json();

        if (data.detected) {
            // Simulate zone detection (in real system, backend would provide zone info)
            const zone = detectZone();
            handleEnhancedDetection(data, zone);
        }
    } catch (error) {
        console.error('Enhanced detection error:', error);
    }
}

// ⭐ Detect Zone (Simulated - in real system, multiple PIR sensors would report zones)
function detectZone() {
    const zones = Object.keys(detectionSystemState.zones);
    const enabledZones = zones.filter(z => detectionSystemState.zones[z].enabled);
    
    if (enabledZones.length === 0) return 'north'; // Default
    
    // Simulate zone detection based on probability
    return enabledZones[Math.floor(Math.random() * enabledZones.length)];
}

// ⭐ Handle Enhanced Detection with Zone and Pattern Analysis
function handleEnhancedDetection(data, zoneId) {
    const threat = data.threat || 'Unknown Animal';
    const zone = detectionSystemState.zones[zoneId];
    const timestamp = Date.now();
    const timeOfDay = getTimeOfDay();

    // Create detection record
    const detection = {
        id: `det_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
        threat,
        zone: zoneId,
        zoneName: zone.name,
        timestamp,
        timeOfDay,
        severity: THREAT_DATABASE[threat]?.severity || 'moderate',
        acknowledged: false,
        responseAction: null
    };

    // Add to zone history
    zone.detections.push(detection);
    zone.lastDetection = timestamp;

    // Add to global history (keep last 200)
    detectionSystemState.detectionHistory.unshift(detection);
    if (detectionSystemState.detectionHistory.length > detectionSystemState.settings.historyLimit) {
        detectionSystemState.detectionHistory.pop();
    }

    // Update statistics
    updateDetectionStatistics(detection);

    // Analyze patterns
    if (detectionSystemState.settings.patternAnalysisEnabled) {
        analyzeDetectionPatterns(detection);
    }

    // Trigger zone-specific alert
    triggerZoneAlert(detection);

    // Automated response
    if (detectionSystemState.settings.autoResponseEnabled) {
        executeAutomatedResponse(detection);
    }

    // Update heatmap
    if (detectionSystemState.settings.heatmapEnabled) {
        updateDetectionHeatmap();
    }

    // Save to localStorage
    saveDetectionState();

    console.log('🐾 Enhanced detection recorded:', detection);
}

// ⭐ Get Time of Day
function getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
}

// ⭐ Update Detection Statistics
function updateDetectionStatistics(detection) {
    const stats = detectionSystemState.statistics;
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;

    // Total detections
    stats.totalDetections++;

    // Count last 24 hours and last week
    stats.last24Hours = detectionSystemState.detectionHistory.filter(d => 
        now - d.timestamp < oneDay
    ).length;

    stats.lastWeek = detectionSystemState.detectionHistory.filter(d => 
        now - d.timestamp < oneWeek
    ).length;

    // Most active zone
    const zoneCounts = {};
    detectionSystemState.detectionHistory.forEach(d => {
        zoneCounts[d.zone] = (zoneCounts[d.zone] || 0) + 1;
    });
    stats.mostActiveZone = Object.keys(zoneCounts).reduce((a, b) => 
        zoneCounts[a] > zoneCounts[b] ? a : b, 'north'
    );

    // Most common threat
    const threatCounts = {};
    detectionSystemState.detectionHistory.forEach(d => {
        threatCounts[d.threat] = (threatCounts[d.threat] || 0) + 1;
    });
    stats.mostCommonThreat = Object.keys(threatCounts).reduce((a, b) => 
        threatCounts[a] > threatCounts[b] ? a : b, 'Unknown Animal'
    );
}

// ⭐ Analyze Detection Patterns
function analyzeDetectionPatterns(detection) {
    const patterns = detectionSystemState.patterns;

    // Time of day pattern
    patterns.timeOfDay[detection.timeOfDay] = (patterns.timeOfDay[detection.timeOfDay] || 0) + 1;

    // Threat type pattern
    patterns.threatType[detection.threat] = (patterns.threatType[detection.threat] || 0) + 1;

    // Zone frequency pattern
    patterns.zoneFrequency[detection.zone] = (patterns.zoneFrequency[detection.zone] || 0) + 1;

    console.log('📊 Patterns updated:', patterns);
}

// ⭐ Trigger Zone-Specific Alert
function triggerZoneAlert(detection) {
    const threatInfo = THREAT_DATABASE[detection.threat] || THREAT_DATABASE['Unknown Animal'];
    const zone = detectionSystemState.zones[detection.zone];

    const message = `🚨 ${detection.threat} detected in ${zone.name}!`;

    // Trigger alert system (from STEP 5)
    if (window.alertSystem) {
        window.alertSystem.trigger('ANIMAL_DETECTED', message, {
            threat: detection.threat,
            zone: detection.zone,
            zoneName: zone.name,
            severity: detection.severity,
            timestamp: new Date(detection.timestamp).toISOString()
        });
    }

    // Show enhanced zone notification
    showZoneDetectionNotification(detection, threatInfo);

    // Voice alert with zone information
    if (window.speechSynthesis) {
        const voiceMessage = `Alert! ${detection.threat} detected in ${zone.name}. Severity: ${detection.severity}.`;
        const utterance = new SpeechSynthesisUtterance(voiceMessage);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        speechSynthesis.speak(utterance);
    }
}

// ⭐ Show Enhanced Zone Detection Notification
function showZoneDetectionNotification(detection, threatInfo) {
    const container = document.getElementById('alerts-container');
    if (!container) return;

    const alertEl = document.createElement('div');
    alertEl.className = 'alert danger zone-detection-alert';
    alertEl.style.borderLeft = `5px solid ${threatInfo.color}`;
    
    alertEl.innerHTML = `
        <div class="zone-alert-header">
            <i class="fa-solid ${threatInfo.icon}" style="color: ${threatInfo.color}"></i>
            <div class="zone-alert-title">
                <div class="threat-name">${detection.threat}</div>
                <div class="zone-name">${detection.zoneName}</div>
            </div>
            <div class="severity-badge severity-${detection.severity}">${detection.severity.toUpperCase()}</div>
        </div>
        <div class="zone-alert-body">
            <div class="threat-description">${threatInfo.description}</div>
            <div class="threat-damage">Damage Level: <span class="highlight">${threatInfo.damage}</span></div>
            <div class="recommendations-section">
                <strong>Recommended Actions:</strong>
                <ul class="recommendations-list">
                    ${threatInfo.recommendations.map(r => `<li>${r}</li>`).join('')}
                </ul>
            </div>
        </div>
        <div class="zone-alert-actions">
            <button class="alert-btn btn-acknowledge" onclick="acknowledgeZoneDetection('${detection.id}')">
                <i class="fa-solid fa-check"></i> Acknowledge
            </button>
            <button class="alert-btn btn-view-zone" onclick="viewZoneDetails('${detection.zone}')">
                <i class="fa-solid fa-map-marker-alt"></i> View Zone
            </button>
            <button class="alert-btn btn-mute-zone" onclick="muteZone('${detection.zone}', 60)">
                <i class="fa-solid fa-bell-slash"></i> Mute Zone 1hr
            </button>
        </div>
    `;
    
    container.appendChild(alertEl);

    // Auto-remove after 15 seconds
    setTimeout(() => {
        alertEl.style.animation = 'slideOutRight 0.5s forwards';
        setTimeout(() => alertEl.remove(), 500);
    }, 15000);
}

// ⭐ Execute Automated Response
async function executeAutomatedResponse(detection) {
    const threatInfo = THREAT_DATABASE[detection.threat] || THREAT_DATABASE['Unknown Animal'];
    
    console.log(`🤖 Executing automated response for ${detection.threat} (${threatInfo.response})`);

    // Trigger buzzer with appropriate pattern
    if (window.alertSystem && window.alertSystem.getState().buzzerEnabled) {
        try {
            await fetch(`${BACKEND_URL}/buzzer/trigger`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    alert_type: 'ANIMAL_DETECTED',
                    duration: threatInfo.severity === 'critical' ? 5000 : 3000,
                    pattern: threatInfo.severity === 'critical' ? 'continuous' : 'rapid',
                    zone: detection.zone,
                    threat: detection.threat
                })
            });
        } catch (error) {
            console.error('Automated buzzer response failed:', error);
        }
    }

    // Log automated action
    detection.responseAction = `Automated ${threatInfo.response} response executed`;
    
    // Add to activity log
    if (window.addLogEntry) {
        window.addLogEntry(`AUTO-RESPONSE: ${detection.threat} in ${detection.zoneName} - ${threatInfo.response} action taken`);
    }
}

// ⭐ Update Detection Heatmap
function updateDetectionHeatmap() {
    const heatmapData = {};
    
    // Calculate detection frequency per zone
    Object.keys(detectionSystemState.zones).forEach(zoneId => {
        const zone = detectionSystemState.zones[zoneId];
        heatmapData[zoneId] = {
            count: zone.detections.length,
            lastDetection: zone.lastDetection,
            intensity: calculateHeatmapIntensity(zone.detections)
        };
    });

    // Update heatmap visualization (if element exists)
    renderHeatmap(heatmapData);
}

// ⭐ Calculate Heatmap Intensity
function calculateHeatmapIntensity(detections) {
    if (detections.length === 0) return 0;
    
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    // Count detections in last 24 hours
    const recentDetections = detections.filter(d => now - d.timestamp < oneDay).length;
    
    // Intensity: 0 (none), 1 (low), 2 (medium), 3 (high), 4 (critical)
    if (recentDetections === 0) return 0;
    if (recentDetections <= 2) return 1;
    if (recentDetections <= 5) return 2;
    if (recentDetections <= 10) return 3;
    return 4;
}

// ⭐ Render Heatmap
function renderHeatmap(heatmapData) {
    const heatmapContainer = document.getElementById('detectionHeatmap');
    if (!heatmapContainer) return;

    const intensityColors = ['#e9ecef', '#74c0fc', '#4dabf7', '#339af0', '#1c7ed6'];
    const intensityLabels = ['None', 'Low', 'Medium', 'High', 'Critical'];

    let html = '<div class="heatmap-grid">';
    
    Object.keys(heatmapData).forEach(zoneId => {
        const data = heatmapData[zoneId];
        const zone = detectionSystemState.zones[zoneId];
        const color = intensityColors[data.intensity];
        const label = intensityLabels[data.intensity];
        
        html += `
            <div class="heatmap-zone" style="background-color: ${color}" onclick="viewZoneDetails('${zoneId}')">
                <div class="heatmap-zone-name">${zone.name}</div>
                <div class="heatmap-zone-count">${data.count} detections</div>
                <div class="heatmap-zone-intensity">${label}</div>
            </div>
        `;
    });
    
    html += '</div>';
    heatmapContainer.innerHTML = html;
}

// ⭐ Acknowledge Zone Detection
window.acknowledgeZoneDetection = function(detectionId) {
    const detection = detectionSystemState.detectionHistory.find(d => d.id === detectionId);
    if (detection) {
        detection.acknowledged = true;
        console.log('✅ Zone detection acknowledged:', detectionId);
        
        if (window.addLogEntry) {
            window.addLogEntry(`Detection acknowledged: ${detection.threat} in ${detection.zoneName}`);
        }
    }
    
    // Remove notification from DOM
    document.querySelectorAll('.zone-detection-alert').forEach(el => {
        el.style.animation = 'slideOutRight 0.5s forwards';
        setTimeout(() => el.remove(), 500);
    });
    
    saveDetectionState();
};

// ⭐ View Zone Details
window.viewZoneDetails = function(zoneId) {
    const zone = detectionSystemState.zones[zoneId];
    if (!zone) return;

    const modal = document.getElementById('zoneDetailsModal');
    if (!modal) {
        createZoneDetailsModal();
        return viewZoneDetails(zoneId);
    }

    // Populate modal with zone data
    document.getElementById('zoneDetailsTitle').textContent = zone.name;
    document.getElementById('zoneDetailsContent').innerHTML = generateZoneDetailsHTML(zone);
    
    modal.style.display = 'block';
};

// ⭐ Generate Zone Details HTML
function generateZoneDetailsHTML(zone) {
    const recentDetections = zone.detections.slice(0, 10);
    const stats = calculateZoneStatistics(zone);

    return `
        <div class="zone-details-stats">
            <div class="stat-item">
                <div class="stat-label">Total Detections</div>
                <div class="stat-value">${zone.detections.length}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Last 24 Hours</div>
                <div class="stat-value">${stats.last24Hours}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Most Common Threat</div>
                <div class="stat-value">${stats.mostCommonThreat}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Sensitivity</div>
                <div class="stat-value">${zone.sensitivity}</div>
            </div>
        </div>
        
        <div class="zone-details-settings">
            <h4>Zone Settings</h4>
            <div class="setting-item setting-item-row">
                <label>Enable Zone</label>
                <label class="switch">
                    <input type="checkbox" id="zoneEnabled_${zone.id}" ${zone.enabled ? 'checked' : ''} 
                           onchange="toggleZone('${zone.id}', this.checked)">
                    <span class="slider round"></span>
                </label>
            </div>
            <div class="setting-item">
                <label>Sensitivity Level</label>
                <select id="zoneSensitivity_${zone.id}" onchange="updateZoneSensitivity('${zone.id}', this.value)">
                    <option value="low" ${zone.sensitivity === 'low' ? 'selected' : ''}>Low</option>
                    <option value="medium" ${zone.sensitivity === 'medium' ? 'selected' : ''}>Medium</option>
                    <option value="high" ${zone.sensitivity === 'high' ? 'selected' : ''}>High</option>
                </select>
            </div>
        </div>
        
        <div class="zone-details-history">
            <h4>Recent Detections</h4>
            <div class="detection-list">
                ${recentDetections.length > 0 ? recentDetections.map(d => `
                    <div class="detection-item">
                        <div class="detection-threat">${d.threat}</div>
                        <div class="detection-time">${new Date(d.timestamp).toLocaleString()}</div>
                        <div class="detection-severity severity-${d.severity}">${d.severity}</div>
                    </div>
                `).join('') : '<p>No recent detections</p>'}
            </div>
        </div>
    `;
}

// ⭐ Calculate Zone Statistics
function calculateZoneStatistics(zone) {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    const last24Hours = zone.detections.filter(d => now - d.timestamp < oneDay).length;

    const threatCounts = {};
    zone.detections.forEach(d => {
        threatCounts[d.threat] = (threatCounts[d.threat] || 0) + 1;
    });
    const mostCommonThreat = Object.keys(threatCounts).length > 0 
        ? Object.keys(threatCounts).reduce((a, b) => threatCounts[a] > threatCounts[b] ? a : b)
        : 'None';

    return { last24Hours, mostCommonThreat };
}

// ⭐ Mute Zone
window.muteZone = function(zoneId, minutes) {
    const zone = detectionSystemState.zones[zoneId];
    if (!zone) return;

    zone.enabled = false;
    console.log(`🔇 Zone ${zone.name} muted for ${minutes} minutes`);

    if (window.showAlert) {
        window.showAlert(`${zone.name} muted for ${minutes} minutes`, 'info');
    }

    // Unmute after specified time
    setTimeout(() => {
        zone.enabled = true;
        console.log(`🔔 Zone ${zone.name} unmuted`);
        if (window.showAlert) {
            window.showAlert(`${zone.name} re-enabled`, 'success');
        }
        saveDetectionState();
    }, minutes * 60000);

    saveDetectionState();
};

// ⭐ Toggle Zone
window.toggleZone = function(zoneId, enabled) {
    const zone = detectionSystemState.zones[zoneId];
    if (!zone) return;

    zone.enabled = enabled;
    console.log(`Zone ${zone.name} ${enabled ? 'enabled' : 'disabled'}`);
    saveDetectionState();
};

// ⭐ Update Zone Sensitivity
window.updateZoneSensitivity = function(zoneId, sensitivity) {
    const zone = detectionSystemState.zones[zoneId];
    if (!zone) return;

    zone.sensitivity = sensitivity;
    console.log(`Zone ${zone.name} sensitivity set to ${sensitivity}`);
    saveDetectionState();
};

// ⭐ Export Detection History
function exportDetectionHistory() {
    const csv = ['Timestamp,Threat,Zone,Severity,TimeOfDay,Acknowledged,ResponseAction'];
    
    detectionSystemState.detectionHistory.forEach(detection => {
        const row = [
            new Date(detection.timestamp).toISOString(),
            detection.threat,
            detection.zoneName,
            detection.severity,
            detection.timeOfDay,
            detection.acknowledged,
            detection.responseAction || 'None'
        ];
        csv.push(row.join(','));
    });

    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `detection_history_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    console.log('📥 Detection history exported');
    if (window.showAlert) {
        window.showAlert('Detection history exported successfully', 'success');
    }
}

// ⭐ Get Detection Statistics
function getDetectionStatistics() {
    return {
        ...detectionSystemState.statistics,
        patterns: detectionSystemState.patterns,
        zones: Object.keys(detectionSystemState.zones).map(zoneId => ({
            id: zoneId,
            name: detectionSystemState.zones[zoneId].name,
            detections: detectionSystemState.zones[zoneId].detections.length,
            enabled: detectionSystemState.zones[zoneId].enabled
        }))
    };
}

// ⭐ Save Detection State
function saveDetectionState() {
    try {
        const toSave = {
            zones: detectionSystemState.zones,
            detectionHistory: detectionSystemState.detectionHistory.slice(0, 200),
            patterns: detectionSystemState.patterns,
            statistics: detectionSystemState.statistics,
            settings: detectionSystemState.settings
        };
        localStorage.setItem('detectionSystemState', JSON.stringify(toSave));
        console.log('💾 Detection state saved');
    } catch (error) {
        console.error('Failed to save detection state:', error);
    }
}

// ⭐ Load Detection State
function loadDetectionState() {
    try {
        const saved = localStorage.getItem('detectionSystemState');
        if (saved) {
            const parsed = JSON.parse(saved);
            detectionSystemState = { ...detectionSystemState, ...parsed };
            console.log('✅ Detection state loaded');
        }
    } catch (error) {
        console.error('Failed to load detection state:', error);
    }
}

// ⭐ Create Zone Details Modal
function createZoneDetailsModal() {
    const modal = document.createElement('div');
    modal.id = 'zoneDetailsModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content zone-details-modal">
            <button class="modal-close" onclick="document.getElementById('zoneDetailsModal').style.display='none'">&times;</button>
            <h2 id="zoneDetailsTitle">Zone Details</h2>
            <div id="zoneDetailsContent"></div>
        </div>
    `;
    document.body.appendChild(modal);

    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// ⭐ Initialize Enhanced Detection System
function initEnhancedDetection() {
    console.log('🚀 Initializing Enhanced Animal Detection System...');
    
    // Load saved state
    loadDetectionState();
    
    // Start enhanced detection polling
    setInterval(checkEnhancedDetection, detectionSystemState.settings.pollingInterval);
    
    // Update heatmap every minute
    setInterval(updateDetectionHeatmap, 60000);
    
    // Initial heatmap render
    updateDetectionHeatmap();
    
    console.log('✅ Enhanced Animal Detection System initialized');
}

// Export functions for global access
window.animalDetection = {
    checkDetection: checkEnhancedDetection,
    getStatistics: getDetectionStatistics,
    exportHistory: exportDetectionHistory,
    getState: () => detectionSystemState,
    viewZone: viewZoneDetails,
    muteZone,
    toggleZone,
    updateZoneSensitivity
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initEnhancedDetection();
});

// Save state before page unload
window.addEventListener('beforeunload', () => {
    saveDetectionState();
});

console.log('✅ Enhanced Animal Detection Module Loaded');


// ⭐ Update Detection UI
function updateDetectionUI() {
    const stats = detectionSystemState.statistics;
    const patterns = detectionSystemState.patterns;

    // Update statistics
    document.getElementById('totalDetections').textContent = stats.totalDetections;
    document.getElementById('detections24h').textContent = stats.last24Hours;
    document.getElementById('detectionsWeek').textContent = stats.lastWeek;
    document.getElementById('mostActiveZone').textContent = 
        detectionSystemState.zones[stats.mostActiveZone]?.name || '--';

    // Update most common threat
    document.getElementById('mostCommonThreat').textContent = 
        stats.mostCommonThreat || 'No data yet';

    // Update time of day pattern
    const timePattern = patterns.timeOfDay;
    const maxTime = Math.max(...Object.values(timePattern), 1);
    const timeOfDayEl = document.getElementById('timeOfDayPattern');
    
    if (timeOfDayEl && Object.keys(timePattern).length > 0) {
        timeOfDayEl.innerHTML = '';
        ['morning', 'afternoon', 'evening', 'night'].forEach(time => {
            const count = timePattern[time] || 0;
            const percentage = (count / maxTime) * 100;
            const bar = document.createElement('div');
            bar.className = 'pattern-bar';
            bar.innerHTML = `
                <div class="pattern-bar-fill" style="width: ${percentage}%">${count}</div>
                <div class="pattern-label">${time}</div>
            `;
            timeOfDayEl.appendChild(bar);
        });
    }
}

// ⭐ View All Zones
window.viewAllZones = function() {
    const zones = Object.keys(detectionSystemState.zones);
    zones.forEach(zoneId => {
        console.log(`Zone: ${detectionSystemState.zones[zoneId].name}`, detectionSystemState.zones[zoneId]);
    });
    
    if (zones.length > 0) {
        viewZoneDetails(zones[0]);
    }
};

// ⭐ Refresh Detection Statistics
window.refreshDetectionStats = function() {
    updateDetectionStatistics({ timestamp: Date.now() });
    updateDetectionUI();
    updateDetectionHeatmap();
    
    if (window.showAlert) {
        window.showAlert('Detection statistics refreshed', 'success');
    }
    
    console.log('📊 Detection statistics refreshed');
};

// Auto-update UI every 30 seconds
setInterval(updateDetectionUI, 30000);

// Initial UI update
setTimeout(updateDetectionUI, 2000);
