import React from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { FaChartBar, FaChartPie, FaChartArea } from 'react-icons/fa6';
import styles from './Charts.module.css';

const MOISTURE_DIST = [
  { range: '0-20%', count: 5 },
  { range: '20-40%', count: 15 },
  { range: '40-60%', count: 45 },
  { range: '60-80%', count: 25 },
  { range: '80-100%', count: 10 },
];
const DIST_COLORS = ['#ef5350', '#ffa94d', '#ffd43b', '#94d82d', '#37b24d'];

const MOTOR_DATA = [
  { name: 'Running', value: 30, color: '#66BB6A' },
  { name: 'Idle',    value: 20, color: '#ffa94d' },
  { name: 'Off',     value: 50, color: '#868e96' },
];

function generateAlertData() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      alerts: Math.floor(Math.random() * 12) + 1,
    };
  });
}

export function MoistureDistChart() {
  return (
    <div className={styles.chartBox}>
      <div className={styles.chartHeader}>
        <div className={styles.chartTitle}><FaChartBar aria-hidden="true" /> Moisture Distribution</div>
      </div>
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={MOISTURE_DIST} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis dataKey="range" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {MOISTURE_DIST.map((_, i) => <Cell key={i} fill={DIST_COLORS[i]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function MotorUsageChart() {
  return (
    <div className={styles.chartBox}>
      <div className={styles.chartHeader}>
        <div className={styles.chartTitle}><FaChartPie aria-hidden="true" /> Motor Usage</div>
      </div>
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={MOTOR_DATA} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
              {MOTOR_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Pie>
            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function AlertFrequencyChart() {
  const data = React.useMemo(generateAlertData, []);
  return (
    <div className={styles.chartBox}>
      <div className={styles.chartHeader}>
        <div className={styles.chartTitle}><FaChartArea aria-hidden="true" /> Alert Frequency (7 Days)</div>
      </div>
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="alertGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="var(--color-danger)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-danger)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: 12 }} />
            <Area type="monotone" dataKey="alerts" stroke="var(--color-danger)" strokeWidth={2} fill="url(#alertGrad)" dot={false} name="Alerts" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
