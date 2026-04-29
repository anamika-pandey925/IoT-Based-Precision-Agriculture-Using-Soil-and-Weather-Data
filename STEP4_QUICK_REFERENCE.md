# 🚀 STEP 4: Quick Reference Card

## ⚡ What's New

### ⭐ Auto-Off Timer
```
Motor runs for 5 minutes → Auto stops
Prevents overwatering & pump damage
Configurable: 1-30 minutes
```

### ⭐ Run Time Display
```
Running Time: 2m 34s / 5m max
[████████░░░░░░░░░░] 51%
```

### ⭐ Smart Warnings
```
At 4 min → "Motor will auto-off in 60 seconds"
At 5 min → Motor force stops automatically
```

---

## 🎮 Quick Commands

### Check Motor Status
```javascript
window.motorControl.getState()
```

### Get Statistics
```javascript
window.motorControl.getStatistics()
// Returns: totalRuns, avgRunTime, overflowStops, etc.
```

### Manual Control
```javascript
window.motorControl.manualControl('on');  // Turn ON
window.motorControl.manualControl('off'); // Turn OFF
```

### Change Settings
```javascript
window.motorControl.updateSettings({
  maxContinuousRunTime: 600000, // 10 minutes
  autoOffEnabled: true
});
```

---

## 🔴 Alert Timeline

| Time | Event | Alert | Voice |
|------|-------|-------|-------|
| 0:00 | Motor ON | "Motor Activated" | ✅ Yes |
| 4:00 | Warning | "Will auto-off in 60s" | ✅ Yes |
| 5:00 | Auto-Off | "Motor Auto-OFF" | ✅ Yes |

---

## 🎨 Visual States

### Motor OFF
```
Color: Gray
Text: "OFF"
Sub: "Standby mode"
Timer: Hidden
```

### Motor ON (Normal)
```
Color: Green
Text: "ON"
Sub: "✓ Irrigation in progress"
Timer: "2m 34s / 5m max"
Bar: Green (< 70%)
```

### Motor ON (Warning)
```
Color: Green
Text: "ON"
Sub: "✓ Irrigation in progress"
Timer: "4m 15s / 5m max"
Bar: Orange (70-90%)
```

### Motor ON (Critical)
```
Color: Green
Text: "ON"
Sub: "✓ Irrigation in progress"
Timer: "4m 55s / 5m max"
Bar: Red (> 90%)
```

### Motor FORCED OFF
```
Color: Red
Text: "FORCED OFF (OVERFLOW)"
Sub: "⚠️ Safety cutoff activated"
Card: Pulsing red glow
```

---

## ⚙️ Settings Location

```
1. Click Settings button (⚙️)
2. Scroll to "Motor Control Settings"
3. Adjust:
   - Maximum Continuous Run Time: [5] minutes
   - Enable Auto-Off Timer: [✓] ON
4. Click "Save Configuration"
```

---

## 🧪 Quick Tests

### Test Auto-Off (1 minute)
```
1. Settings → Max Run Time = 1 minute
2. Save
3. Trigger motor ON (moisture < 40%)
4. Wait 1 minute
5. Motor auto-stops ✅
```

### Test Manual Control
```
F12 Console:
> window.motorControl.manualControl('on')
> window.motorControl.manualControl('off')
```

### Test Statistics
```
F12 Console:
> window.motorControl.getStatistics()
```

---

## 📊 Progress Bar Colors

| Percentage | Color | Meaning |
|------------|-------|---------|
| 0-70% | 🟢 Green | Safe |
| 70-90% | 🟠 Orange | Warning |
| 90-100% | 🔴 Red | Critical |

---

## 🔧 Default Settings

```javascript
Max Run Time: 5 minutes
Warning Time: 1 minute before
Auto-Off: Enabled
Overflow: > 90% moisture
Dry Soil: < 40% moisture
```

---

## 📁 New Files

```
✅ motor_control.js    - Motor logic
✅ motor_control.css   - Motor styles
✅ Backend endpoints   - /motor/force_off, /motor/manual
```

---

## ✅ Checklist

- [ ] Backend running (python app.py)
- [ ] Arduino connected (optional)
- [ ] Open index.html
- [ ] Trigger motor ON (moisture < 40%)
- [ ] See run time display
- [ ] Wait for auto-off (or change to 1 min)
- [ ] Verify motor stops automatically
- [ ] Check statistics in console

---

## 🎯 Success Indicators

✅ Run time display visible when motor ON  
✅ Progress bar updates every second  
✅ Warning at 4 minutes  
✅ Auto-off at 5 minutes  
✅ Settings persist after refresh  
✅ Manual control works  
✅ Statistics tracking works  

---

**Status:** ✅ STEP 4 COMPLETE  
**Next:** STEP 5 - Alert System  
**Type:** `continue` 🚀
