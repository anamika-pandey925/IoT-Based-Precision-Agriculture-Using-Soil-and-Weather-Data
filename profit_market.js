/* ========================================
   STEP 8: PROFIT & MARKET SYSTEM
   - High-profit crop suggestions ✅
   - Real-time crop market prices ✅
   - Best time to sell recommendations ✅
   - Profit calculations ✅
   - Market trends analysis ✅
   - Price alerts ✅
======================================== */

const BACKEND_URL = "http://localhost:5000";

// Profit & Market System State
let profitMarketState = {
    marketPrices: [],
    priceHistory: {},
    profitCalculations: [],
    priceAlerts: [],
    marketTrends: {},
    lastUpdate: null,
    autoUpdateEnabled: true,
    updateInterval: 600000, // 10 minutes
    investmentData: {
        landSize: 1, // acres
        laborCost: 5000, // per acre
        seedCost: 0,
        fertilizerCost: 3000,
        irrigationCost: 2000,
        otherCosts: 1000
    }
};

// Comprehensive Market Price Database (₹ per quintal)
const MARKET_PRICE_DATABASE = {
    'Rice': {
        basePrice: 2183,
        volatility: 0.15,
        seasonalFactor: { summer: 1.0, monsoon: 0.95, winter: 1.05 },
        demandLevel: 'high',
        storageLife: 'long',
        marketSize: 'very-large'
    },
    'Wheat': {
        basePrice: 2275,
        volatility: 0.12,
        seasonalFactor: { summer: 1.05, monsoon: 1.0, winter: 0.95 },
        demandLevel: 'very-high',
        storageLife: 'long',
        marketSize: 'very-large'
    },
    'Cotton': {
        basePrice: 6500,
        volatility: 0.20,
        seasonalFactor: { summer: 0.95, monsoon: 1.0, winter: 1.10 },
        demandLevel: 'high',
        storageLife: 'long',
        marketSize: 'large'
    },
    'Sugarcane': {
        basePrice: 3400,
        volatility: 0.10,
        seasonalFactor: { summer: 1.0, monsoon: 0.98, winter: 1.02 },
        demandLevel: 'high',
        storageLife: 'short',
        marketSize: 'large'
    },
    'Maize': {
        basePrice: 1950,
        volatility: 0.18,
        seasonalFactor: { summer: 1.0, monsoon: 0.92, winter: 1.08 },
        demandLevel: 'moderate',
        storageLife: 'medium',
        marketSize: 'large'
    },
    'Potato': {
        basePrice: 1500,
        volatility: 0.25,
        seasonalFactor: { summer: 1.15, monsoon: 1.0, winter: 0.90 },
        demandLevel: 'high',
        storageLife: 'medium',
        marketSize: 'large'
    },
    'Tomato': {
        basePrice: 2800,
        volatility: 0.30,
        seasonalFactor: { summer: 0.85, monsoon: 1.20, winter: 1.0 },
        demandLevel: 'very-high',
        storageLife: 'short',
        marketSize: 'large'
    },
    'Onion': {
        basePrice: 2200,
        volatility: 0.35,
        seasonalFactor: { summer: 1.25, monsoon: 0.90, winter: 0.95 },
        demandLevel: 'very-high',
        storageLife: 'medium',
        marketSize: 'large'
    },
    'Soybean': {
        basePrice: 4200,
        volatility: 0.15,
        seasonalFactor: { summer: 1.0, monsoon: 0.95, winter: 1.05 },
        demandLevel: 'moderate',
        storageLife: 'long',
        marketSize: 'medium'
    },
    'Mustard': {
        basePrice: 5500,
        volatility: 0.18,
        seasonalFactor: { summer: 1.10, monsoon: 1.0, winter: 0.95 },
        demandLevel: 'moderate',
        storageLife: 'long',
        marketSize: 'medium'
    }
};

// Yield Database (quintals per acre)
const YIELD_DATABASE = {
    'Rice': { min: 18, avg: 22, max: 28 },
    'Wheat': { min: 15, avg: 20, max: 25 },
    'Cotton': { min: 8, avg: 12, max: 16 },
    'Sugarcane': { min: 250, avg: 300, max: 350 },
    'Maize': { min: 20, avg: 25, max: 32 },
    'Potato': { min: 80, avg: 100, max: 120 },
    'Tomato': { min: 150, avg: 200, max: 250 },
    'Onion': { min: 80, avg: 100, max: 130 },
    'Soybean': { min: 8, avg: 12, max: 16 },
    'Mustard': { min: 6, avg: 9, max: 12 }
};

// Cost Database (₹ per acre)
const COST_DATABASE = {
    'Rice': { seed: 1500, fertilizer: 4000, pesticide: 1500, labor: 6000, irrigation: 3000 },
    'Wheat': { seed: 1200, fertilizer: 3500, pesticide: 1000, labor: 5000, irrigation: 2500 },
    'Cotton': { seed: 2000, fertilizer: 5000, pesticide: 3000, labor: 7000, irrigation: 3500 },
    'Sugarcane': { seed: 8000, fertilizer: 6000, pesticide: 2000, labor: 10000, irrigation: 5000 },
    'Maize': { seed: 1000, fertilizer: 3000, pesticide: 1200, labor: 4500, irrigation: 2000 },
    'Potato': { seed: 15000, fertilizer: 5000, pesticide: 2500, labor: 8000, irrigation: 4000 },
    'Tomato': { seed: 3000, fertilizer: 6000, pesticide: 4000, labor: 12000, irrigation: 5000 },
    'Onion': { seed: 5000, fertilizer: 4000, pesticide: 2000, labor: 7000, irrigation: 3500 },
    'Soybean': { seed: 1800, fertilizer: 3500, pesticide: 1500, labor: 5000, irrigation: 2500 },
    'Mustard': { seed: 800, fertilizer: 2500, pesticide: 1000, labor: 4000, irrigation: 2000 }
};

// ⭐ Fetch Market Prices
async function fetchMarketPrices() {
    try {
        // Try backend endpoint first
        const response = await fetch(`${BACKEND_URL}/api/mandi`);
        if (response.ok) {
            const data = await response.json();
            profitMarketState.marketPrices = data;
        } else {
            throw new Error('Backend endpoint failed');
        }
    } catch (error) {
        console.log('Using simulated market prices');
        // Generate simulated prices
        generateSimulatedPrices();
    }
    
    profitMarketState.lastUpdate = Date.now();
    
    // Update price history
    updatePriceHistory();
    
    // Analyze market trends
    analyzeMarketTrends();
    
    // Calculate profits
    calculateProfits();
    
    // Check price alerts
    checkPriceAlerts();
    
    // Update UI
    updateMarketUI();
    
    // Save state
    saveMarketState();
    
    console.log('✅ Market prices updated');
}

// ⭐ Generate Simulated Market Prices
function generateSimulatedPrices() {
    const season = getCurrentSeason();
    const prices = [];
    
    Object.keys(MARKET_PRICE_DATABASE).forEach(crop => {
        const data = MARKET_PRICE_DATABASE[crop];
        
        // Calculate current price with seasonal factor and random volatility
        const seasonalMultiplier = data.seasonalFactor[season] || 1.0;
        const volatilityFactor = 1 + (Math.random() - 0.5) * data.volatility;
        const currentPrice = Math.round(data.basePrice * seasonalMultiplier * volatilityFactor);
        
        // Calculate trend
        const previousPrice = profitMarketState.priceHistory[crop]?.[0]?.price || currentPrice;
        const priceChange = currentPrice - previousPrice;
        const percentChange = previousPrice > 0 ? ((priceChange / previousPrice) * 100).toFixed(2) : 0;
        
        let trend = 'stable';
        let trendColor = 'var(--primary-color)';
        let advice = 'Monitor market conditions';
        
        if (percentChange > 2) {
            trend = 'up';
            trendColor = 'var(--success-color)';
            advice = 'Good time to sell. Prices rising.';
        } else if (percentChange < -2) {
            trend = 'down';
            trendColor = 'var(--danger-color)';
            advice = 'Consider holding. Prices falling.';
        } else {
            advice = 'Stable market. Sell when ready.';
        }
        
        prices.push({
            crop,
            price: `₹${currentPrice.toLocaleString()}/q`,
            priceValue: currentPrice,
            trend,
            trendColor,
            percentChange: `${percentChange > 0 ? '+' : ''}${percentChange}%`,
            advice,
            demandLevel: data.demandLevel,
            storageLife: data.storageLife,
            marketSize: data.marketSize
        });
    });
    
    profitMarketState.marketPrices = prices;
}

// ⭐ Update Price History
function updatePriceHistory() {
    profitMarketState.marketPrices.forEach(item => {
        if (!profitMarketState.priceHistory[item.crop]) {
            profitMarketState.priceHistory[item.crop] = [];
        }
        
        profitMarketState.priceHistory[item.crop].unshift({
            price: item.priceValue,
            timestamp: Date.now()
        });
        
        // Keep last 30 data points
        if (profitMarketState.priceHistory[item.crop].length > 30) {
            profitMarketState.priceHistory[item.crop].pop();
        }
    });
}

// ⭐ Analyze Market Trends
function analyzeMarketTrends() {
    const trends = {};
    
    Object.keys(profitMarketState.priceHistory).forEach(crop => {
        const history = profitMarketState.priceHistory[crop];
        if (history.length < 2) return;
        
        // Calculate average price change
        let totalChange = 0;
        for (let i = 0; i < history.length - 1; i++) {
            totalChange += history[i].price - history[i + 1].price;
        }
        const avgChange = totalChange / (history.length - 1);
        
        // Calculate volatility (standard deviation)
        const prices = history.map(h => h.price);
        const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
        const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;
        const volatility = Math.sqrt(variance);
        
        // Determine trend direction
        let direction = 'stable';
        if (avgChange > mean * 0.02) direction = 'rising';
        else if (avgChange < -mean * 0.02) direction = 'falling';
        
        // Determine volatility level
        let volatilityLevel = 'low';
        if (volatility > mean * 0.15) volatilityLevel = 'high';
        else if (volatility > mean * 0.08) volatilityLevel = 'medium';
        
        trends[crop] = {
            direction,
            avgChange: avgChange.toFixed(2),
            volatility: volatility.toFixed(2),
            volatilityLevel,
            recommendation: getMarketRecommendation(direction, volatilityLevel)
        };
    });
    
    profitMarketState.marketTrends = trends;
}

// ⭐ Get Market Recommendation
function getMarketRecommendation(direction, volatility) {
    if (direction === 'rising' && volatility === 'low') {
        return 'Excellent time to sell. Stable upward trend.';
    } else if (direction === 'rising' && volatility === 'high') {
        return 'Prices rising but volatile. Sell at peak.';
    } else if (direction === 'falling' && volatility === 'low') {
        return 'Hold if possible. Steady decline.';
    } else if (direction === 'falling' && volatility === 'high') {
        return 'Risky market. Consider selling to avoid losses.';
    } else if (volatility === 'high') {
        return 'High volatility. Wait for stability.';
    } else {
        return 'Stable market. Sell when convenient.';
    }
}

// ⭐ Calculate Profits
function calculateProfits() {
    const calculations = [];
    const landSize = profitMarketState.investmentData.landSize;
    
    Object.keys(MARKET_PRICE_DATABASE).forEach(crop => {
        const marketPrice = profitMarketState.marketPrices.find(p => p.crop === crop);
        if (!marketPrice) return;
        
        const yield_data = YIELD_DATABASE[crop];
        const costs = COST_DATABASE[crop];
        
        // Calculate total cost per acre
        const totalCostPerAcre = Object.values(costs).reduce((a, b) => a + b, 0);
        const totalCost = totalCostPerAcre * landSize;
        
        // Calculate revenue (using average yield)
        const avgYield = yield_data.avg * landSize;
        const revenue = avgYield * marketPrice.priceValue;
        
        // Calculate profit
        const profit = revenue - totalCost;
        const profitMargin = ((profit / totalCost) * 100).toFixed(2);
        const roi = ((profit / totalCost) * 100).toFixed(2);
        
        // Calculate break-even price
        const breakEvenPrice = Math.round(totalCost / avgYield);
        
        // Determine profitability level
        let profitabilityLevel = 'low';
        let profitabilityColor = '#e67700';
        if (roi > 50) {
            profitabilityLevel = 'very-high';
            profitabilityColor = '#37b24d';
        } else if (roi > 30) {
            profitabilityLevel = 'high';
            profitabilityColor = '#51cf66';
        } else if (roi > 15) {
            profitabilityLevel = 'moderate';
            profitabilityColor = '#fab005';
        }
        
        calculations.push({
            crop,
            totalCost,
            revenue,
            profit,
            profitMargin,
            roi,
            breakEvenPrice,
            currentPrice: marketPrice.priceValue,
            avgYield,
            profitabilityLevel,
            profitabilityColor,
            recommendation: profit > 0 ? 'Profitable' : 'Not Recommended'
        });
    });
    
    // Sort by profit (highest first)
    calculations.sort((a, b) => b.profit - a.profit);
    
    profitMarketState.profitCalculations = calculations;
}

// ⭐ Check Price Alerts
function checkPriceAlerts() {
    profitMarketState.priceAlerts = [];
    
    profitMarketState.marketPrices.forEach(item => {
        const trend = profitMarketState.marketTrends[item.crop];
        if (!trend) return;
        
        // Alert for significant price increase
        if (trend.direction === 'rising' && trend.volatilityLevel === 'low') {
            profitMarketState.priceAlerts.push({
                type: 'opportunity',
                crop: item.crop,
                message: `${item.crop} prices rising steadily. Good time to sell!`,
                priority: 'high',
                icon: 'fa-arrow-trend-up',
                color: '#37b24d'
            });
        }
        
        // Alert for significant price decrease
        if (trend.direction === 'falling' && parseFloat(item.percentChange) < -5) {
            profitMarketState.priceAlerts.push({
                type: 'warning',
                crop: item.crop,
                message: `${item.crop} prices falling rapidly. Consider selling soon.`,
                priority: 'high',
                icon: 'fa-arrow-trend-down',
                color: '#e67700'
            });
        }
        
        // Alert for high volatility
        if (trend.volatilityLevel === 'high') {
            profitMarketState.priceAlerts.push({
                type: 'caution',
                crop: item.crop,
                message: `${item.crop} market highly volatile. Monitor closely.`,
                priority: 'medium',
                icon: 'fa-chart-line',
                color: '#fab005'
            });
        }
    });
    
    // Trigger alerts if any
    if (profitMarketState.priceAlerts.length > 0 && window.showAlert) {
        const highPriorityAlerts = profitMarketState.priceAlerts.filter(a => a.priority === 'high');
        if (highPriorityAlerts.length > 0) {
            window.showAlert(`${highPriorityAlerts.length} market alerts! Check profit section.`, 'warning');
        }
    }
}

// ⭐ Get Current Season
function getCurrentSeason() {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 6) return 'summer';
    if (month >= 7 && month <= 10) return 'monsoon';
    return 'winter';
}

// ⭐ Update Market UI
function updateMarketUI() {
    // Update market prices table
    updateMarketPricesUI();
    
    // Update profit calculations
    updateProfitCalculationsUI();
    
    // Update price alerts
    updatePriceAlertsUI();
    
    // Update market trends
    updateMarketTrendsUI();
    
    // Update last update time
    const lastUpdateEl = document.getElementById('marketLastUpdate');
    if (lastUpdateEl) {
        lastUpdateEl.textContent = `Last updated: ${new Date(profitMarketState.lastUpdate).toLocaleTimeString()}`;
    }
}

// ⭐ Update Market Prices UI
function updateMarketPricesUI() {
    const container = document.getElementById('marketPricesContainer');
    if (!container || profitMarketState.marketPrices.length === 0) return;
    
    container.innerHTML = profitMarketState.marketPrices.map((item, index) => `
        <div class="market-price-card" style="animation-delay: ${index * 0.05}s">
            <div class="market-price-header">
                <div class="market-crop-name">${item.crop}</div>
                <div class="market-price-value">${item.price}</div>
            </div>
            <div class="market-price-trend">
                <span class="trend-indicator trend-${item.trend}">
                    <i class="fa-solid fa-arrow-${item.trend === 'up' ? 'up' : item.trend === 'down' ? 'down' : 'right'}"></i>
                    ${item.percentChange}
                </span>
                <span class="demand-badge demand-${item.demandLevel.replace('-', '')}">${item.demandLevel}</span>
            </div>
            <div class="market-price-advice">${item.advice}</div>
            <div class="market-price-meta">
                <span><i class="fa-solid fa-box"></i> ${item.storageLife}</span>
                <span><i class="fa-solid fa-store"></i> ${item.marketSize}</span>
            </div>
        </div>
    `).join('');
}

// ⭐ Update Profit Calculations UI
function updateProfitCalculationsUI() {
    const container = document.getElementById('profitCalculationsContainer');
    if (!container || profitMarketState.profitCalculations.length === 0) return;
    
    container.innerHTML = profitMarketState.profitCalculations.slice(0, 5).map((calc, index) => `
        <div class="profit-calc-card" style="animation-delay: ${index * 0.05}s">
            <div class="profit-rank">#${index + 1}</div>
            <div class="profit-crop-name">${calc.crop}</div>
            <div class="profit-amount" style="color: ${calc.profitabilityColor}">
                ₹${calc.profit.toLocaleString()}
            </div>
            <div class="profit-roi">ROI: ${calc.roi}%</div>
            <div class="profit-details-grid">
                <div class="profit-detail">
                    <span class="detail-label">Investment</span>
                    <span class="detail-value">₹${calc.totalCost.toLocaleString()}</span>
                </div>
                <div class="profit-detail">
                    <span class="detail-label">Revenue</span>
                    <span class="detail-value">₹${calc.revenue.toLocaleString()}</span>
                </div>
                <div class="profit-detail">
                    <span class="detail-label">Yield</span>
                    <span class="detail-value">${calc.avgYield}q</span>
                </div>
                <div class="profit-detail">
                    <span class="detail-label">Break-even</span>
                    <span class="detail-value">₹${calc.breakEvenPrice}/q</span>
                </div>
            </div>
            <div class="profit-recommendation ${calc.profit > 0 ? 'profitable' : 'not-profitable'}">
                ${calc.recommendation}
            </div>
        </div>
    `).join('');
}

// ⭐ Update Price Alerts UI
function updatePriceAlertsUI() {
    const container = document.getElementById('priceAlertsContainer');
    if (!container) return;
    
    if (profitMarketState.priceAlerts.length === 0) {
        container.innerHTML = '<div class="no-alerts">No price alerts at this time</div>';
        return;
    }
    
    container.innerHTML = profitMarketState.priceAlerts.map((alert, index) => `
        <div class="price-alert-card alert-${alert.type}" style="animation-delay: ${index * 0.05}s; border-left-color: ${alert.color}">
            <div class="alert-icon" style="color: ${alert.color}">
                <i class="fa-solid ${alert.icon}"></i>
            </div>
            <div class="alert-content">
                <div class="alert-crop">${alert.crop}</div>
                <div class="alert-message">${alert.message}</div>
            </div>
            <div class="alert-priority priority-${alert.priority}">${alert.priority}</div>
        </div>
    `).join('');
}

// ⭐ Update Market Trends UI
function updateMarketTrendsUI() {
    const container = document.getElementById('marketTrendsContainer');
    if (!container || Object.keys(profitMarketState.marketTrends).length === 0) return;
    
    const trends = Object.entries(profitMarketState.marketTrends).slice(0, 5);
    
    container.innerHTML = trends.map(([crop, trend], index) => `
        <div class="market-trend-card" style="animation-delay: ${index * 0.05}s">
            <div class="trend-crop-name">${crop}</div>
            <div class="trend-direction direction-${trend.direction}">
                <i class="fa-solid fa-arrow-${trend.direction === 'rising' ? 'up' : trend.direction === 'falling' ? 'down' : 'right'}"></i>
                ${trend.direction}
            </div>
            <div class="trend-volatility volatility-${trend.volatilityLevel}">
                Volatility: ${trend.volatilityLevel}
            </div>
            <div class="trend-recommendation">${trend.recommendation}</div>
        </div>
    `).join('');
}

// ⭐ Update Investment Data
window.updateInvestmentData = function(data) {
    profitMarketState.investmentData = { ...profitMarketState.investmentData, ...data };
    calculateProfits();
    updateProfitCalculationsUI();
    saveMarketState();
    
    if (window.showAlert) {
        window.showAlert('Investment data updated. Profits recalculated.', 'success');
    }
};

// ⭐ Auto-Update Market Data
function startAutoUpdate() {
    if (!profitMarketState.autoUpdateEnabled) return;
    
    // Initial fetch
    fetchMarketPrices();
    
    // Set interval for auto-update
    setInterval(() => {
        if (profitMarketState.autoUpdateEnabled) {
            console.log('🔄 Auto-updating market data...');
            fetchMarketPrices();
        }
    }, profitMarketState.updateInterval);
    
    console.log(`✅ Market auto-update enabled (every ${profitMarketState.updateInterval / 1000 / 60} minutes)`);
}

// ⭐ Manual Refresh
window.refreshMarketData = function() {
    console.log('🔄 Manual market refresh...');
    fetchMarketPrices();
    
    if (window.showAlert) {
        window.showAlert('Market data refreshed successfully', 'success');
    }
};

// ⭐ Toggle Auto-Update
window.toggleMarketAutoUpdate = function(enabled) {
    profitMarketState.autoUpdateEnabled = enabled;
    console.log(`🔄 Market auto-update ${enabled ? 'enabled' : 'disabled'}`);
    saveMarketState();
    
    if (enabled) {
        startAutoUpdate();
    }
};

// ⭐ Save Market State
function saveMarketState() {
    try {
        const toSave = {
            priceHistory: profitMarketState.priceHistory,
            investmentData: profitMarketState.investmentData,
            autoUpdateEnabled: profitMarketState.autoUpdateEnabled,
            updateInterval: profitMarketState.updateInterval,
            lastUpdate: profitMarketState.lastUpdate
        };
        localStorage.setItem('profitMarketState', JSON.stringify(toSave));
        console.log('💾 Market state saved');
    } catch (error) {
        console.error('Failed to save market state:', error);
    }
}

// ⭐ Load Market State
function loadMarketState() {
    try {
        const saved = localStorage.getItem('profitMarketState');
        if (saved) {
            const parsed = JSON.parse(saved);
            profitMarketState = { ...profitMarketState, ...parsed };
            console.log('✅ Market state loaded');
        }
    } catch (error) {
        console.error('Failed to load market state:', error);
    }
}

// ⭐ Initialize Profit & Market System
function initProfitMarket() {
    console.log('🚀 Initializing Profit & Market System...');
    
    // Load saved state
    loadMarketState();
    
    // Start auto-update
    startAutoUpdate();
    
    console.log('✅ Profit & Market System initialized');
}

// Export functions for global access
window.profitMarket = {
    refresh: fetchMarketPrices,
    updateInvestment: updateInvestmentData,
    toggleAutoUpdate: toggleMarketAutoUpdate,
    getState: () => profitMarketState,
    getMarketPrices: () => profitMarketState.marketPrices,
    getProfitCalculations: () => profitMarketState.profitCalculations,
    getPriceAlerts: () => profitMarketState.priceAlerts,
    getMarketTrends: () => profitMarketState.marketTrends
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initProfitMarket();
});

// Save state before page unload
window.addEventListener('beforeunload', () => {
    saveMarketState();
});

console.log('✅ Profit & Market Module Loaded');
