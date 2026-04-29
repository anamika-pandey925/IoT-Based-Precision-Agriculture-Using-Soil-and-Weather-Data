# 🚀 STEP 3: Quick Start Guide

## ⚡ 30-Second Setup

```bash
# 1. Start Backend
cd python
python app.py

# 2. Open Frontend
# Open index.html in browser

# 3. Check Status
# Look for green dot = Connected ✅
# Look for red dot = Disconnected ❌
```

---

## 🎯 What to Expect

### ✅ Sensor Connected (Green Dot)
```
Temperature:  25.3 °C  ← Real data
Humidity:     65.2 %   ← Real data
Soil:         45.8 %   ← Real data (green if optimal)
Motor:        OFF      ← Real status
```

### ❌ Sensor Disconnected (Red Dot)
```
Temperature:  -- °C   ← No data
Humidity:     -- %    ← No data
Soil:         -- %    ← No data
Motor:        Not Connected
```

---

## 🔴 Alert Triggers

| Condition | Alert | Voice |
|-----------|-------|-------|
| Temp > 35°C | "High Temperature: 36.5°C" | ✅ Yes |
| Moisture < 40% | "Low Soil Moisture: 35.2%" | ✅ Yes |
| Moisture > 90% | "Water Overflow! Motor Disabled" | ✅ Yes |
| Sensor Disconnect | "Sensor disconnected. Check wiring" | ✅ Yes |
| Backend Offline | "Backend server offline" | ❌ No |

---

## ⚙️ Settings (Click Settings Button)

```
Moisture Threshold:  [40] %     ← Motor triggers below this
Temp Threshold:      [35] °C    ← Alert triggers above this
Refresh Rate:        [2 sec] ▼  ← How often to check
Voice Alerts:        [✓] ON     ← Toggle voice on/off
```

---

## 🧪 Quick Tests

### Test 1: Backend Offline
```bash
# Don't start Flask
# Open index.html
# Expected: Red dot + "Backend server offline"
```

### Test 2: Sensor Disconnected
```bash
python app.py  # Start Flask
# Don't connect Arduino
# Expected: Red dot + "Sensor not connected"
```

### Test 3: Sensor Connected
```bash
python app.py  # Start Flask
# Connect Arduino
# Expected: Green dot + Real sensor values
```

---

## 📊 Visual Indicators

| Indicator | Meaning |
|-----------|---------|
| 🟢 Green Dot | System online, sensor connected |
| 🔴 Red Dot | Backend offline OR sensor disconnected |
| Green Text | Optimal/Good condition |
| Red Text | Alert/Warning condition |
| Gray Text | Offline/Disconnected/Standby |

---

## 🐛 Common Issues

### Issue: "Backend server offline"
```bash
# Solution:
cd python
python app.py
# Check: http://localhost:5000/data
```

### Issue: "Sensor not connected"
```bash
# Check:
1. Arduino USB connected?
2. Arduino code uploaded?
3. Serial monitor shows JSON?
4. Restart Flask server
```

### Issue: No alerts
```bash
# Check Settings:
1. Click Settings button
2. Ensure "Voice Alerts" is ON
3. Check browser allows audio
```

---

## 📁 Files You Need

```
✅ index.html              (Updated with sensor script)
✅ sensor_integration.js   (NEW - Main sensor logic)
✅ script.js               (Existing - Charts, UI)
✅ python/app.py           (Backend - Already working)
```

---

## 🎨 Color Codes

### Temperature:
- **White**: Normal (< 35°C)
- **Red**: High (≥ 35°C)

### Soil Moisture:
- **Red**: Dry (< 40%) or Overflow (> 90%)
- **Green**: Optimal (40-90%)

### Motor:
- **Green**: ON (irrigating)
- **Gray**: OFF (standby)
- **Red**: FORCED OFF (safety)

---

## ⏱️ Timing

- **Refresh Rate**: 2 seconds (default)
- **Alert Cooldown**: 10-30 seconds
- **Chart Points**: Last 20 readings
- **Voice Speed**: 0.9x (slightly slower for clarity)

---

## 🔧 Advanced

### Change Refresh Rate:
```javascript
// In browser console:
window.sensorIntegration.restartPolling(5000); // 5 seconds
```

### Check Connection State:
```javascript
// In browser console:
const state = window.sensorIntegration.getConnectionState();
console.log(state);
```

### Stop/Start Polling:
```javascript
window.sensorIntegration.stopPolling();
window.sensorIntegration.startPolling();
```

---

## ✅ Success Checklist

- [ ] Flask server running (http://localhost:5000)
- [ ] Arduino connected (if testing with hardware)
- [ ] index.html open in browser
- [ ] Green dot visible (if sensor connected)
- [ ] Real sensor values showing (if connected)
- [ ] Charts updating every 2 seconds
- [ ] Alerts working (test by changing thresholds)
- [ ] Voice alerts playing (check settings)

---

## 🎯 Expected Behavior

### Normal Operation:
```
1. Green dot blinking
2. Real sensor values updating every 2 seconds
3. Charts showing live data
4. No alerts (unless threshold exceeded)
5. Motor OFF (unless moisture < 40%)
```

### Sensor Disconnected:
```
1. Red dot blinking
2. All values show "--"
3. Sub-text: "Sensor not connected"
4. Alert: "Sensor disconnected. Check wiring"
5. Voice: "Warning. Sensor disconnected..."
```

---

## 📞 Need Help?

1. Check `STEP3_TESTING_GUIDE.md` for detailed tests
2. Open `test_sensor_states.html` for visual demo
3. Check browser console for errors (F12)
4. Check Flask console for backend errors

---

**Status:** ✅ STEP 3 COMPLETE  
**Next:** STEP 4 - Motor Control System  
**Type:** `continue` to proceed! 🚀
