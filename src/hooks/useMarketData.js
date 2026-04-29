import { useState, useEffect } from 'react';
import marketService from '../services/marketService';
import useInterval from './useInterval';

const MARKET_REFRESH = 10 * 60 * 1000; // 10 minutes

function useMarketData() {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchPrices = async () => {
    try {
      const data = await marketService.getMandi();
      setPrices(data);
      setLastUpdate(Date.now());
    } catch {
      // Fallback already handled in marketService
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPrices(); }, []);
  useInterval(fetchPrices, MARKET_REFRESH);

  return { prices, loading, lastUpdate, refresh: fetchPrices };
}

export default useMarketData;
