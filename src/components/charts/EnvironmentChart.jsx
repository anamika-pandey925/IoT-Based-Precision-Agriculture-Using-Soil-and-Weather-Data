import React, { useEffect, useRef } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { FaChartLine } from 'react-icons/fa6';
import { useSensor } from '../../context/SensorContext';
import styles from './Charts.module.css';

const MAX_POINTS = 20;

function EnvironmentChart() {
  const { state } = useSensor();
  const chartDataRef = useRef([]);

  // Append new reading to rolling buffer
  useEffect(() => {
    if (!state.data || !state.data.sensor_connected) return;
    const { temperature, humidity, timestamp } = state.data;
    const label = new Date(timestamp || Date.now()).toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    });
    chartDataRef.current = [
      ...chartDataRef.current,
      { time: label, temperature: parseFloat(temperature?.toFixed(1)), humidity: parseFloat(humidity?.toFixed(1)) },
    ].slice(-MAX_POINTS);
  }, [state.data]);

  const data = chartDataRef.current;
  const isLive = state.serverStatus === 'online';

  return (
    <div className={styles.chartBox}>
      <div className={styles.chartHeader}>
        <div className={styles.chartTitle}>
          <FaChartLine aria-hidden="true" />
          Environmental Trends
        </div>
        {isLive && (
          <span className={styles.liveBadge} aria-label="Live data">
            <span className={styles.liveDot} aria-hidden="true" /> Live
          </span>
        )}
      </div>
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 8,
                fontSize: 12,
                color: 'var(--text-primary)',
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line
              type="monotone"
              dataKey="temperature"
              stroke="var(--color-temp)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              name="Temp (°C)"
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="humidity"
              stroke="var(--color-hum)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              name="Humidity (%)"
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default EnvironmentChart;
