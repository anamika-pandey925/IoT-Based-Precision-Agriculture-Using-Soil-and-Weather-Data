/* ========================================
   STEP 9: WATER OVERFLOW RECOVERY
   - Detect excess water ✅
   - Recovery suggestions ✅
   - Drainage recommendations ✅
   - Crop damage prevention ✅
   - Emergency response system ✅
======================================== */

const BACKEND_URL = "http://localhost:5000";

// Overflow Recovery System State
let overflowRecoveryState = {
    overflowDetected: false,
    overflowLevel: 'none', // none, low, medium, high, critical
    waterLevel: 0,
    soilMoisture: 0,
    lastOverflowTime: null,
    overflowHistory: [],
    recoveryPlan: null,
    drainageStatus: 'unknown',
    cropDamageRisk: 'none',
    emergencyMode: false,
    recoveryProgress: 0,
    recommendations: [],
    autoResponseEnabled: true
};

// Overflow Severity Levels
const OVERFLOW_LEVELS = {
    none: {
        threshold: 0,
        color: '#37b24d',
        icon: 'fa-check-circle',
        severity: 'none',
        action: 'normal'
    },
    low: {
        threshold: 70,
        color: '#fab005',
        icon: 'fa-exclamation-triangle',
        severity: 'low',
        action: 'monitor'
    },
    medium: {
        threshold: 80,
        color: '#fd7e14',
        icon: 'fa-exclamation-circle',
        severity: 'medium',
        action: 'prepare'
    },
    high: {
        threshold: 90,
        color: '#e67700',
        icon: 'fa-triangle-exclamation',
        severity: 'high',
        action: 'respond'
    },
    critical: {
        threshold: 95,
        color: '#c92a2a',
        icon: 'fa-circle-exclamation',
        severity: 'critical',
        action: 'emergency'
    }
};

// Crop Damage Risk Assessment
const CROP_DAMAGE_RISKS = {
    'Rice': { waterTolerance: 'very-high', maxWaterlogging: 30 },
    'Wheat': { waterTolerance: 'low', maxWaterlogging: 2 },
    'Cotton': { waterTolerance: 'low', maxWaterlogging: 3 },
    'Sugarcane': { waterTolerance: 'high', maxWaterlogging: 15 },
    'Maize': { waterTolerance: 'medium', maxWaterlogging: 5 },
    'Potato': { waterTolerance: 'very-low', maxWaterlogging: 1 },
    'Tomato': { waterTolerance: 'low', maxWaterlogging: 2 },
    'Onion': { waterTolerance: 'low', maxWaterlogging: 2 },
    'Soybean': { waterTolerance: 'medium', maxWaterlogging: 4 },
    'Mustard': { waterTolerance: 'low', maxWaterlogging: 3 }
};

// ⭐ Check Overflow Status
async function checkOverflowStatus() {
    try {
        // Fetch sensor data
        const response = await fetch(`${BACKEND_URL}/data`);
        if (!response.ok) return;
        
        const data = await response.json();
        
        // Update state
        overflowRecoveryState.soilMoisture = data.moisture || 0;
        
        // Simulate water level (in real system, this would come from water level sensor)
        // For now, we'll use soil moisture as proxy
        overflowRecoveryState.waterLevel = data.moisture || 0;
        
        // Determine overflow level
        const level = determineOverflowLevel(overflowRecoveryState.waterLevel);
        const previousLevel = overflowRecoveryState.overflowLevel;
        overflowRecoveryState.overflowLevel = level;
        
        // Check if overflow detected
        if (level !== 'none' && !overflowRecoveryState.overflowDetected) {
            overflowRecoveryState.overflowDetected = true;
            overflowRecoveryState.lastOverflowTime = Date.now();
            
            // Add to history
            overflowRecoveryState.overflowHistory.unshift({
                timestamp: Date.now(),
                level,
                waterLevel: overflowRecoveryState.waterLevel,
                soilMoisture: overflowRecoveryState.soilMoisture
            });
            
            // Keep last 50 records
            if (overflowRecoveryState.overflowHistory.length > 50) {
                overflowRecoveryState.overflowHistory.pop();
            }
            
            // Trigger overflow response
            handleOverflowDetection(level);
        } else if (level === 'none' && overflowRecoveryState.overflowDetected) {
            // Overflow resolved
            overflowRecoveryState.overflowDetected = false;
            handleOverflowResolved();
        } else if (level !== previousLevel && level !== 'none') {
            // Level changed
            handleOverflowLevelChange(previousLevel, level);
        }
        
        // Update UI
        updateOverflowUI();
        
    } catch (error) {
        console.error('Overflow check error:', error);
    }
}

// ⭐ Determine Overflow Level
function determineOverflowLevel(waterLevel) {
    if (waterLevel >= OVERFLOW_LEVELS.critical.threshold) return 'critical';
    if (waterLevel >= OVERFLOW_LEVELS.high.threshold) return 'high';
    if (waterLevel >= OVERFLOW_LEVELS.medium.threshold) return 'medium';
    if (waterLevel >= OVERFLOW_LEVELS.low.threshold) return 'low';
    return 'none';
}

// ⭐ Handle Overflow Detection
function handleOverflowDetection(level) {
    console.log(`🚨 Overflow detected: ${level}`);
    
    // Assess crop damage risk
    assessCropDamageRisk();
    
    // Generate recovery plan
    generateRecoveryPlan(level);
    
    // Trigger emergency mode if critical
    if (level === 'critical') {
        activateEmergencyMode();
    }
    
    // Trigger alerts
    triggerOverflowAlert(level);
    
    // Auto-response
    if (overflowRecoveryState.autoResponseEnabled) {
        executeAutoResponse(level);
    }
    
    // Save state
    saveOverflowState();
}

// ⭐ Handle Overflow Resolved
function handleOverflowResolved() {
    console.log('✅ Overflow resolved');
    
    overflowRecoveryState.emergencyMode = false;
    overflowRecoveryState.recoveryProgress = 100;
    
    if (window.showAlert) {
        window.showAlert('Water overflow resolved. Normal operations resumed.', 'success');
    }
    
    // Update UI
    updateOverflowUI();
    saveOverflowState();
}

// ⭐ Handle Overflow Level Change
function handleOverflowLevelChange(previousLevel, newLevel) {
    console.log(`⚠️ Overflow level changed: ${previousLevel} → ${newLevel}`);
    
    // Update recovery plan
    generateRecoveryPlan(newLevel);
    
    // Trigger alert
    if (window.showAlert) {
        const levelInfo = OVERFLOW_LEVELS[newLevel];
        window.showAlert(`Overflow level changed to ${newLevel}. ${levelInfo.action} required.`, 'warning');
    }
    
    updateOverflowUI();
}

// ⭐ Assess Crop Damage Risk
function assessCropDamageRisk() {
    // Get current crop (from weather farming system if available)
    let currentCrop = 'Wheat'; // Default
    
    if (window.weatherFarming) {
        const suggestions = window.weatherFarming.getCropSuggestions();
        if (suggestions && suggestions.length > 0) {
            currentCrop = suggestions[0].name;
        }
    }
    
    const cropData = CROP_DAMAGE_RISKS[currentCrop];
    if (!cropData) {
        overflowRecoveryState.cropDamageRisk = 'unknown';
        return;
    }
    
    // Calculate waterlogging duration (hours)
    const waterloggingDuration = overflowRecoveryState.lastOverflowTime 
        ? (Date.now() - overflowRecoveryState.lastOverflowTime) / (1000 * 60 * 60)
        : 0;
    
    // Assess risk
    if (waterloggingDuration > cropData.maxWaterlogging * 2) {
        overflowRecoveryState.cropDamageRisk = 'critical';
    } else if (waterloggingDuration > cropData.maxWaterlogging) {
        overflowRecoveryState.cropDamageRisk = 'high';
    } else if (waterloggingDuration > cropData.maxWaterlogging * 0.5) {
        overflowRecoveryState.cropDamageRisk = 'medium';
    } else {
        overflowRecoveryState.cropDamageRisk = 'low';
    }
    
    console.log(`🌾 Crop damage risk: ${overflowRecoveryState.cropDamageRisk} (${currentCrop}, ${waterloggingDuration.toFixed(1)}h)`);
}

// ⭐ Generate Recovery Plan
function generateRecoveryPlan(level) {
    const plan = {
        level,
        priority: OVERFLOW_LEVELS[level].action,
        steps: [],
        estimatedTime: 0,
        drainageRecommendations: [],
        preventionMeasures: [],
        emergencyContacts: []
    };
    
    // Immediate actions
    if (level === 'critical' || level === 'high') {
        plan.steps.push({
            step: 1,
            action: 'Stop all irrigation immediately',
            priority: 'critical',
            duration: '0 min',
            status: 'pending'
        });
        
        plan.steps.push({
            step: 2,
            action: 'Open all drainage channels',
            priority: 'critical',
            duration: '5 min',
            status: 'pending'
        });
        
        plan.steps.push({
            step: 3,
            action: 'Deploy emergency pumps if available',
            priority: 'high',
            duration: '15 min',
            status: 'pending'
        });
    }
    
    // Drainage recommendations
    plan.drainageRecommendations = [
        {
            method: 'Surface Drainage',
            description: 'Create shallow channels to direct water away from crops',
            effectiveness: 'high',
            timeRequired: '2-4 hours',
            cost: 'low'
        },
        {
            method: 'Subsurface Drainage',
            description: 'Install underground pipes or tiles for long-term solution',
            effectiveness: 'very-high',
            timeRequired: '1-2 days',
            cost: 'high'
        },
        {
            method: 'Pump Drainage',
            description: 'Use water pumps to remove excess water quickly',
            effectiveness: 'high',
            timeRequired: '4-8 hours',
            cost: 'medium'
        },
        {
            method: 'Raised Beds',
            description: 'Elevate crop beds to prevent waterlogging',
            effectiveness: 'medium',
            timeRequired: '1-2 days',
            cost: 'medium'
        }
    ];
    
    // Recovery steps
    plan.steps.push({
        step: plan.steps.length + 1,
        action: 'Monitor water level every 30 minutes',
        priority: 'high',
        duration: 'ongoing',
        status: 'pending'
    });
    
    plan.steps.push({
        step: plan.steps.length + 1,
        action: 'Check crop health for signs of damage',
        priority: 'medium',
        duration: '1 hour',
        status: 'pending'
    });
    
    plan.steps.push({
        step: plan.steps.length + 1,
        action: 'Apply foliar nutrients after water recedes',
        priority: 'medium',
        duration: '2 hours',
        status: 'pending'
    });
    
    // Prevention measures
    plan.preventionMeasures = [
        'Install proper drainage system before next season',
        'Create bunds and channels for water management',
        'Monitor weather forecasts and prepare in advance',
        'Maintain irrigation equipment to prevent leaks',
        'Plant water-tolerant crops in flood-prone areas',
        'Improve soil structure with organic matter'
    ];
    
    // Emergency contacts
    plan.emergencyContacts = [
        { name: 'Local Agriculture Office', phone: '1800-XXX-XXXX' },
        { name: 'Drainage Department', phone: '1800-XXX-XXXX' },
        { name: 'Crop Insurance', phone: '1800-XXX-XXXX' }
    ];
    
    // Estimate total time
    plan.estimatedTime = plan.steps.reduce((total, step) => {
        const match = step.duration.match(/(\d+)/);
        return total + (match ? parseInt(match[1]) : 0);
    }, 0);
    
    overflowRecoveryState.recoveryPlan = plan;
    console.log('📋 Recovery plan generated:', plan);
}

// ⭐ Activate Emergency Mode
function activateEmergencyMode() {
    overflowRecoveryState.emergencyMode = true;
    
    console.log('🚨 EMERGENCY MODE ACTIVATED');
    
    // Trigger critical alert
    if (window.alertSystem) {
        window.alertSystem.trigger('WATER_OVERFLOW', 'CRITICAL: Water overflow detected! Emergency response activated.', {
            level: 'critical',
            waterLevel: overflowRecoveryState.waterLevel,
            timestamp: new Date().toISOString()
        });
    }
    
    // Voice alert
    if (window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance('Critical water overflow detected. Emergency response activated. Stop all irrigation immediately.');
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        utterance.volume = 1.0;
        speechSynthesis.speak(utterance);
    }
    
    // Force motor off
    forceMotorOff('emergency_overflow');
}

// ⭐ Trigger Overflow Alert
function triggerOverflowAlert(level) {
    const levelInfo = OVERFLOW_LEVELS[level];
    
    if (window.showAlert) {
        window.showAlert(
            `Water overflow detected (${level}). ${levelInfo.action} required.`,
            level === 'critical' || level === 'high' ? 'danger' : 'warning'
        );
    }
}

// ⭐ Execute Auto Response
async function executeAutoResponse(level) {
    console.log(`🤖 Executing auto-response for ${level} overflow`);
    
    // Stop motor
    await forceMotorOff('auto_overflow_response');
    
    // Trigger buzzer
    if (window.alertSystem && window.alertSystem.getState().buzzerEnabled) {
        try {
            await fetch(`${BACKEND_URL}/buzzer/trigger`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    alert_type: 'WATER_OVERFLOW',
                    duration: 5000,
                    pattern: 'continuous'
                })
            });
        } catch (error) {
            console.error('Buzzer trigger failed:', error);
        }
    }
    
    // Log action
    if (window.addLogEntry) {
        window.addLogEntry(`AUTO-RESPONSE: ${level} overflow - Motor stopped, alerts triggered`);
    }
}

// ⭐ Force Motor Off
async function forceMotorOff(reason) {
    try {
        const response = await fetch(`${BACKEND_URL}/motor/force_off`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason })
        });
        
        if (response.ok) {
            console.log('✅ Motor forced off:', reason);
        }
    } catch (error) {
        console.error('Failed to force motor off:', error);
    }
}

// ⭐ Update Overflow UI
function updateOverflowUI() {
    // Update overflow status
    updateOverflowStatusUI();
    
    // Update recovery plan
    updateRecoveryPlanUI();
    
    // Update drainage recommendations
    updateDrainageRecommendationsUI();
    
    // Update crop damage assessment
    updateCropDamageUI();
}

// ⭐ Update Overflow Status UI
function updateOverflowStatusUI() {
    const container = document.getElementById('overflowStatusContainer');
    if (!container) return;
    
    const level = overflowRecoveryState.overflowLevel;
    const levelInfo = OVERFLOW_LEVELS[level];
    
    container.innerHTML = `
        <div class="overflow-status-card status-${level}">
            <div class="overflow-status-header">
                <div class="overflow-icon" style="color: ${levelInfo.color}">
                    <i class="fa-solid ${levelInfo.icon}"></i>
                </div>
                <div class="overflow-status-info">
                    <div class="overflow-level-label">Overflow Level: <strong>${level.toUpperCase()}</strong></div>
                    <div class="overflow-water-level">Water Level: ${overflowRecoveryState.waterLevel}%</div>
                </div>
                ${overflowRecoveryState.emergencyMode ? '<div class="emergency-badge">EMERGENCY</div>' : ''}
            </div>
            <div class="overflow-status-details">
                <div class="status-detail">
                    <span class="detail-label">Soil Moisture:</span>
                    <span class="detail-value">${overflowRecoveryState.soilMoisture}%</span>
                </div>
                <div class="status-detail">
                    <span class="detail-label">Action Required:</span>
                    <span class="detail-value">${levelInfo.action}</span>
                </div>
                <div class="status-detail">
                    <span class="detail-label">Crop Damage Risk:</span>
                    <span class="detail-value risk-${overflowRecoveryState.cropDamageRisk}">${overflowRecoveryState.cropDamageRisk}</span>
                </div>
            </div>
        </div>
    `;
}

// ⭐ Update Recovery Plan UI
function updateRecoveryPlanUI() {
    const container = document.getElementById('recoveryPlanContainer');
    if (!container || !overflowRecoveryState.recoveryPlan) return;
    
    const plan = overflowRecoveryState.recoveryPlan;
    
    container.innerHTML = `
        <div class="recovery-plan-header">
            <h4>Recovery Action Plan (${plan.priority})</h4>
            <div class="estimated-time">Est. Time: ${plan.estimatedTime} min</div>
        </div>
        <div class="recovery-steps">
            ${plan.steps.map(step => `
                <div class="recovery-step step-${step.priority}">
                    <div class="step-number">${step.step}</div>
                    <div class="step-content">
                        <div class="step-action">${step.action}</div>
                        <div class="step-meta">
                            <span class="step-priority">${step.priority}</span>
                            <span class="step-duration">${step.duration}</span>
                        </div>
                    </div>
                    <button class="step-complete-btn" onclick="markStepComplete(${step.step})">
                        <i class="fa-solid fa-check"></i>
                    </button>
                </div>
            `).join('')}
        </div>
        
        <div class="prevention-measures">
            <h4>Prevention Measures for Future</h4>
            <ul class="prevention-list">
                ${plan.preventionMeasures.map(measure => `<li>${measure}</li>`).join('')}
            </ul>
        </div>
    `;
}

// ⭐ Update Drainage Recommendations UI
function updateDrainageRecommendationsUI() {
    const container = document.getElementById('drainageRecommendationsContainer');
    if (!container || !overflowRecoveryState.recoveryPlan) return;
    
    const recommendations = overflowRecoveryState.recoveryPlan.drainageRecommendations;
    
    container.innerHTML = recommendations.map((rec, index) => `
        <div class="drainage-rec-card" style="animation-delay: ${index * 0.05}s">
            <div class="drainage-method">${rec.method}</div>
            <div class="drainage-description">${rec.description}</div>
            <div class="drainage-details">
                <div class="drainage-detail">
                    <span class="detail-icon"><i class="fa-solid fa-gauge-high"></i></span>
                    <span class="detail-text">Effectiveness: ${rec.effectiveness}</span>
                </div>
                <div class="drainage-detail">
                    <span class="detail-icon"><i class="fa-solid fa-clock"></i></span>
                    <span class="detail-text">${rec.timeRequired}</span>
                </div>
                <div class="drainage-detail">
                    <span class="detail-icon"><i class="fa-solid fa-indian-rupee-sign"></i></span>
                    <span class="detail-text">Cost: ${rec.cost}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// ⭐ Update Crop Damage UI
function updateCropDamageUI() {
    const container = document.getElementById('cropDamageContainer');
    if (!container) return;
    
    const risk = overflowRecoveryState.cropDamageRisk;
    const duration = overflowRecoveryState.lastOverflowTime 
        ? ((Date.now() - overflowRecoveryState.lastOverflowTime) / (1000 * 60 * 60)).toFixed(1)
        : 0;
    
    let riskColor = '#37b24d';
    let riskIcon = 'fa-check-circle';
    let riskMessage = 'No significant crop damage expected';
    
    if (risk === 'critical') {
        riskColor = '#c92a2a';
        riskIcon = 'fa-skull-crossbones';
        riskMessage = 'Severe crop damage likely. Immediate action required!';
    } else if (risk === 'high') {
        riskColor = '#e67700';
        riskIcon = 'fa-triangle-exclamation';
        riskMessage = 'High risk of crop damage. Act quickly to minimize losses.';
    } else if (risk === 'medium') {
        riskColor = '#fab005';
        riskIcon = 'fa-exclamation-triangle';
        riskMessage = 'Moderate crop damage possible. Monitor closely.';
    } else if (risk === 'low') {
        riskColor = '#51cf66';
        riskIcon = 'fa-info-circle';
        riskMessage = 'Low crop damage risk. Continue monitoring.';
    }
    
    container.innerHTML = `
        <div class="crop-damage-card" style="border-left-color: ${riskColor}">
            <div class="damage-icon" style="color: ${riskColor}">
                <i class="fa-solid ${riskIcon}"></i>
            </div>
            <div class="damage-content">
                <div class="damage-risk">Risk Level: <strong style="color: ${riskColor}">${risk.toUpperCase()}</strong></div>
                <div class="damage-message">${riskMessage}</div>
                <div class="damage-duration">Waterlogging Duration: ${duration} hours</div>
            </div>
        </div>
    `;
}

// ⭐ Mark Step Complete
window.markStepComplete = function(stepNumber) {
    if (!overflowRecoveryState.recoveryPlan) return;
    
    const step = overflowRecoveryState.recoveryPlan.steps.find(s => s.step === stepNumber);
    if (step) {
        step.status = 'completed';
        
        // Calculate progress
        const completedSteps = overflowRecoveryState.recoveryPlan.steps.filter(s => s.status === 'completed').length;
        const totalSteps = overflowRecoveryState.recoveryPlan.steps.length;
        overflowRecoveryState.recoveryProgress = Math.round((completedSteps / totalSteps) * 100);
        
        console.log(`✅ Step ${stepNumber} completed. Progress: ${overflowRecoveryState.recoveryProgress}%`);
        
        if (window.showAlert) {
            window.showAlert(`Recovery step ${stepNumber} completed`, 'success');
        }
        
        updateRecoveryPlanUI();
        saveOverflowState();
    }
};

// ⭐ Start Monitoring
function startOverflowMonitoring() {
    // Check every 5 seconds
    setInterval(checkOverflowStatus, 5000);
    console.log('✅ Overflow monitoring started (5s interval)');
}

// ⭐ Save Overflow State
function saveOverflowState() {
    try {
        const toSave = {
            overflowHistory: overflowRecoveryState.overflowHistory.slice(0, 50),
            autoResponseEnabled: overflowRecoveryState.autoResponseEnabled,
            lastOverflowTime: overflowRecoveryState.lastOverflowTime
        };
        localStorage.setItem('overflowRecoveryState', JSON.stringify(toSave));
        console.log('💾 Overflow state saved');
    } catch (error) {
        console.error('Failed to save overflow state:', error);
    }
}

// ⭐ Load Overflow State
function loadOverflowState() {
    try {
        const saved = localStorage.getItem('overflowRecoveryState');
        if (saved) {
            const parsed = JSON.parse(saved);
            overflowRecoveryState = { ...overflowRecoveryState, ...parsed };
            console.log('✅ Overflow state loaded');
        }
    } catch (error) {
        console.error('Failed to load overflow state:', error);
    }
}

// ⭐ Initialize Overflow Recovery System
function initOverflowRecovery() {
    console.log('🚀 Initializing Water Overflow Recovery System...');
    
    // Load saved state
    loadOverflowState();
    
    // Start monitoring
    startOverflowMonitoring();
    
    // Initial check
    checkOverflowStatus();
    
    console.log('✅ Water Overflow Recovery System initialized');
}

// Export functions for global access
window.overflowRecovery = {
    checkStatus: checkOverflowStatus,
    getState: () => overflowRecoveryState,
    getRecoveryPlan: () => overflowRecoveryState.recoveryPlan,
    markStepComplete: window.markStepComplete,
    toggleAutoResponse: (enabled) => {
        overflowRecoveryState.autoResponseEnabled = enabled;
        saveOverflowState();
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initOverflowRecovery();
});

// Save state before page unload
window.addEventListener('beforeunload', () => {
    saveOverflowState();
});

console.log('✅ Water Overflow Recovery Module Loaded');
