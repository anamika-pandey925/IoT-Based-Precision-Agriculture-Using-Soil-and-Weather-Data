# AgriSense — React Dashboard

Modern React conversion of the Precision Agriculture System.

---

## Quick Start

### 1. Install dependencies (already done if you ran the setup)
```bash
cd agri-dashboard
npm install
```

### 2. Configure backend URL
The `.env` file is already set to:
```
REACT_APP_API_URL=http://127.0.0.1:5000
```
Change this if your Flask backend runs on a different port.

### 3. Start the React app
```bash
npm start
```
App runs at → **http://localhost:3000**

### 4. Start your Flask backend (in a separate terminal)
```bash
python app.py
# or
flask run
```
Backend runs at → **http://127.0.0.1:5000**

---

## Flask Backend Endpoints Required

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/sensor-data` | GET | Live sensor readings |
| `/ask` | POST | AI chatbot |
| `/predict` | POST | Plant disease scan |
| `/motor/force_off` | POST | Emergency motor stop |
| `/motor/manual` | POST | Manual motor control |
| `/api/detect` | GET | Animal detection |
| `/api/mandi` | GET | Market prices |
| `/buzzer/trigger` | POST | Arduino buzzer |
| `/export_csv` | GET | Download CSV |

---

## Project Structure

```
src/
├── components/
│   ├── common/       # Navbar, SensorCard, AlertToast, StatusBanner
│   ├── charts/       # EnvironmentChart, SoilMoistureChart, AnalyticsCharts
│   ├── motor/        # MotorCard, MotorRunTimer
│   ├── alerts/       # AlertsPanel, AlertItem
│   ├── ai/           # ChatWidget, ChatMessage, PlantScanner
│   ├── weather/      # WeatherCard, ForecastGrid, IrrigationPlan
│   ├── detection/    # DetectionStats, ZoneHeatmap, DetectionWidget
│   └── market/       # MarketPriceCard, ProfitCalculator
├── pages/            # DashboardPage, AnalyticsPage, AIAssistantPage, ...
├── context/          # ThemeContext, SettingsContext, SensorContext, AlertContext
├── hooks/            # useSensorData, useAlerts, useMotorControl, ...
├── services/         # api.js, sensorService, motorService, aiService, ...
├── styles/           # variables.css, globals.css, animations.css
└── utils/            # alertEngine, formatters, csvExport
```

---

## Features

- **Live sensor dashboard** — temperature, humidity, soil moisture, motor status
- **Real-time charts** — environment trends + soil moisture history (Recharts)
- **Alert system** — toast notifications with cooldown, mute, and history
- **AI assistant** — chat with EN/HI language toggle + voice input
- **Plant scanner** — drag-drop image upload → disease diagnosis
- **Weather page** — 7-day forecast + farming advice + crop suggestions
- **Animal detection** — zone heatmap + pattern analysis
- **Market prices** — live Mandi rates + profit calculator
- **Overflow recovery** — status + recovery plan + drainage recommendations
- **Settings** — all thresholds configurable, persisted to localStorage
- **Dark mode** — toggle persists across sessions
- **Responsive** — mobile-first, works from 320px to 2560px

---

## Error States

| Condition | What you see |
|-----------|-------------|
| Flask not running | "Server not connected" on status banner + sensor cards |
| Sensor disconnected | "Sensor not connected" on individual cards |
| AI service down | Error message in chat bubble |
| Market API down | Simulated prices shown automatically |

---

## Build for Production

```bash
npm run build
```
Output in `build/` folder — ready to deploy to Netlify, Vercel, or any static host.
