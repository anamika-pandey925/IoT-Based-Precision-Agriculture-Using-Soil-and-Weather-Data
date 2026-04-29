import React, { useEffect, useRef } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { FaWater } from 'react-icons/fa6';
import { useSensor } from '../../context/SensorContext';
import styles from './Charts.module.css';

const MAX_POINTS = 20;

function SoilMoistureChart() {
  const { state } = useSensor();
  const chartDataRef = useRef([]);

  useEffect(() => {
    if (!state.data || !state.data.sensor_connected) return;
    const { moisture, timestamp } = state.data;
    const label = new Date(timestamp || Date.now()).toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    });
    chartDataRef.current = [
      ...chartDataRef.current,
      { time: label, moisture: parseFloat(moisture?.toFixed(1)) },
    ].slice(-MAX_POINTS);
  }, [state.data]);

  const data = chartDataRef.current;
  const isLive = state.serverStatus === 'online';

  return (
    <div className={styles.chartBox}>
      <div className={styles.chartHeader}>
        <div className={styles.chartTitle}>
          <FaWater aria-hidden="true" />
          Soil Moisture History
        </div>
        {isLive && (
          <span className={styles.liveBadge} aria-label="Live data">
            <span className={styles.liveDot} aria-hidden="true" /> Live
          </span>
        )}
      </div>
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="soilGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="var(--color-soil)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-soil)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 8,
                fontSize: 12,
                color: 'var(--text-primary)',
              }}
              formatter={(v) => [`${v}%`, 'Moisture']}
            />
            <Area
              type="monotone"
              dataKey="moisture"
              stroke="var(--color-soil)"
              strokeWidth={2}
              fill="url(#soilGradient)"
              dot={false}
              activeDot={{ r: 4 }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default SoilMoistureChart;
