import React, { useState } from 'react';
import { FaIndianRupeeSign, FaCoins, FaBell, FaSync, FaArrowUp, FaArrowDown, FaArrowRight } from 'react-icons/fa6';
import useMarketData from '../hooks/useMarketData';
import LoadingSpinner from '../components/common/LoadingSpinner';
import styles from './MarketPage.module.css';

const YIELD_DB = {
  Rice: 22, Wheat: 20, Cotton: 12, Sugarcane: 300, Maize: 25,
  Potato: 100, Tomato: 200, Onion: 100, Soybean: 12, Mustard: 9,
};
const COST_DB = {
  Rice: 16000, Wheat: 13200, Cotton: 20500, Sugarcane: 31000, Maize: 11700,
  Potato: 34500, Tomato: 30000, Onion: 21500, Soybean: 14300, Mustard: 10300,
};

function TrendIcon({ trend }) {
  if (trend === 'up')   return <FaArrowUp style={{ color: 'var(--color-success)' }} />;
  if (trend === 'down') return <FaArrowDown style={{ color: 'var(--color-danger)' }} />;
  return <FaArrowRight style={{ color: 'var(--text-muted)' }} />;
}

function MarketPage() {
  const { prices, loading, lastUpdate, refresh } = useMarketData();
  const [landSize, setLandSize] = useState(1);

  if (loading) return <LoadingSpinner message="Loading market data..." />;

  // Calculate top 5 profits
  const profits = prices.map((p) => {
    const yield_ = YIELD_DB[p.crop] || 20;
    const cost = COST_DB[p.crop] || 15000;
    const revenue = yield_ * landSize * p.priceValue;
    const totalCost = cost * landSize;
    const profit = revenue - totalCost;
    const roi = ((profit / totalCost) * 100).toFixed(1);
    return { ...p, profit, revenue, totalCost, roi, yield: yield_ * landSize };
  }).sort((a, b) => b.profit - a.profit).slice(0, 5);

  const lastUpdateStr = lastUpdate
    ? new Date(lastUpdate).toLocaleTimeString('en-IN', { hour12: false })
    : '--';

  return (
    <div>
      <div className={styles.header}>
        <h1 className="section-title"><FaIndianRupeeSign aria-hidden="true" /> Market &amp; Profit</h1>
        <button className="btn btn-secondary" onClick={refresh} aria-label="Refresh market data">
          <FaSync aria-hidden="true" /> Refresh
        </button>
      </div>
      <p className={styles.lastUpdate}>Last updated: {lastUpdateStr}</p>

      {/* Market Prices */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}><FaIndianRupeeSign aria-hidden="true" /> Live Mandi Rates</h2>
        <div className={styles.pricesGrid}>
          {prices.map((item, i) => (
            <div key={i} className={styles.priceCard}>
              <div className={styles.priceCrop}>{item.crop}</div>
              <div className={styles.priceValue}>{item.price}</div>
              <div className={styles.priceTrend}>
                <TrendIcon trend={item.trend} />
                <span className={styles[`trend_${item.trend}`]}>{item.percentChange}</span>
              </div>
              <div className={styles.priceAdvice}>{item.advice}</div>
              <div className={styles.priceMeta}>
                <span className={`badge badge-${item.demandLevel === 'very-high' ? 'danger' : item.demandLevel === 'high' ? 'warning' : 'info'}`}>
                  {item.demandLevel}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Profit Calculator */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}><FaCoins aria-hidden="true" /> Profit Calculator</h2>
        <div className={styles.calcInput}>
          <label className="form-label">Land Size (acres)</label>
          <input
            type="number"
            className="form-input"
            value={landSize}
            min={0.1}
            step={0.1}
            onChange={(e) => setLandSize(parseFloat(e.target.value) || 1)}
            style={{ maxWidth: 160 }}
          />
        </div>
        <div className={styles.profitGrid}>
          {profits.map((p, i) => (
            <div key={i} className={styles.profitCard}>
              <div className={styles.profitRank}>#{i + 1}</div>
              <div className={styles.profitCrop}>{p.crop}</div>
              <div className={styles.profitAmount} style={{ color: p.profit > 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                ₹{p.profit.toLocaleString()}
              </div>
              <div className={styles.profitRoi}>ROI: {p.roi}%</div>
              <div className={styles.profitDetails}>
                <span>Cost: ₹{p.totalCost.toLocaleString()}</span>
                <span>Revenue: ₹{p.revenue.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default MarketPage;
