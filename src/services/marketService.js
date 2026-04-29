import api from './api';

// Fallback simulated prices when backend is unavailable
const MARKET_PRICE_DATABASE = {
  Rice:      { basePrice: 2183, volatility: 0.15, demandLevel: 'high',      storageLife: 'long',   marketSize: 'very-large' },
  Wheat:     { basePrice: 2275, volatility: 0.12, demandLevel: 'very-high', storageLife: 'long',   marketSize: 'very-large' },
  Cotton:    { basePrice: 6500, volatility: 0.20, demandLevel: 'high',      storageLife: 'long',   marketSize: 'large' },
  Sugarcane: { basePrice: 3400, volatility: 0.10, demandLevel: 'high',      storageLife: 'short',  marketSize: 'large' },
  Maize:     { basePrice: 1950, volatility: 0.18, demandLevel: 'moderate',  storageLife: 'medium', marketSize: 'large' },
  Potato:    { basePrice: 1500, volatility: 0.25, demandLevel: 'high',      storageLife: 'medium', marketSize: 'large' },
  Tomato:    { basePrice: 2800, volatility: 0.30, demandLevel: 'very-high', storageLife: 'short',  marketSize: 'large' },
  Onion:     { basePrice: 2200, volatility: 0.35, demandLevel: 'very-high', storageLife: 'medium', marketSize: 'large' },
  Soybean:   { basePrice: 4200, volatility: 0.15, demandLevel: 'moderate',  storageLife: 'long',   marketSize: 'medium' },
  Mustard:   { basePrice: 5500, volatility: 0.18, demandLevel: 'moderate',  storageLife: 'long',   marketSize: 'medium' },
};

function getSimulatedPrices() {
  return Object.entries(MARKET_PRICE_DATABASE).map(([crop, data]) => {
    const volatilityFactor = 1 + (Math.random() - 0.5) * data.volatility;
    const currentPrice = Math.round(data.basePrice * volatilityFactor);
    const prevPrice = Math.round(data.basePrice * (1 + (Math.random() - 0.5) * data.volatility));
    const priceChange = currentPrice - prevPrice;
    const percentChange = ((priceChange / prevPrice) * 100).toFixed(2);
    const trend = percentChange > 2 ? 'up' : percentChange < -2 ? 'down' : 'stable';
    return {
      crop,
      priceValue: currentPrice,
      price: `₹${currentPrice.toLocaleString()}/q`,
      trend,
      percentChange: `${percentChange > 0 ? '+' : ''}${percentChange}%`,
      advice: trend === 'up' ? 'Good time to sell.' : trend === 'down' ? 'Consider holding.' : 'Stable market.',
      demandLevel: data.demandLevel,
      storageLife: data.storageLife,
      marketSize: data.marketSize,
    };
  });
}

const marketService = {
  /**
   * Fetch live Mandi rates. Falls back to simulated data on error.
   */
  getMandi: async () => {
    try {
      return await api.get('/api/mandi');
    } catch {
      return getSimulatedPrices();
    }
  },

  getSimulatedPrices,
};

export default marketService;
