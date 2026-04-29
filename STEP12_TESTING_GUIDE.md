# 🧪 STEP 12 TESTING GUIDE: Cloud Sync & Backup

## 📋 Pre-Testing Checklist

- [ ] Backend server running (`python python/app.py`)
- [ ] Browser console open (F12)
- [ ] Network tab open (for monitoring requests)
- [ ] Application loaded (`http://localhost:5000`)

---

## 🧪 Test Suite

### Test 1: Cloud Connection ☁️

**Objective**: Verify cloud backend is accessible

**Steps**:
1. Open browser console
2. Run: `fetch('/api/cloud/status').then(r => r.json()).then(console.log)`
3. Check response

**Expected Result**:
```json
{
  "connected": true,
  "message": "Cloud backend is available",
  "timestamp": 1714320000
}
```

**Status**: ⬜ Pass / ⬜ Fail

---

### Test 2: Cloud Sync Indicator 🔵

**Objective**: Verify sync indicator appears and updates

**Steps**:
1. Look at top-right navbar
2. Find cloud icon with status text
3. Observe color and icon

**Expected Result**:
- Indicator visible
- Shows "Synced" or "Offline"
- Color matches status (green/yellow/red/blue)

**Status**: ⬜ Pass / ⬜ Fail

---

### Test 3: Auto-Sync (Automatic) 🔄

**Objective**: Verify automatic sync every 60 seconds

**Steps**:
1. Wait 60 seconds after page load
2. Watch cloud indicator
3. Check browser console for sync logs
4. Check Network tab for `/api/cloud/sync` request

**Expected Result**:
- Console shows: "🔄 Starting cloud sync..."
- Console shows: "✅ Cloud sync successful"
- Network shows POST to `/api/cloud/sync`
- Indicator briefly shows "Syncing..." then "Synced"

**Status**: ⬜ Pass / ⬜ Fail

---

### Test 4: Manual Sync 👆

**Objective**: Verify manual sync trigger

**Steps**:
1. Click cloud indicator in navbar
2. Sync panel opens
3. Click "Sync Now" button
4. Watch for sync animation

**Expected Result**:
- Panel opens smoothly
- "Sync Now" button triggers sync
- Indicator shows "Syncing..." animation
- Success message appears
- Last sync time updates

**Status**: ⬜ Pass / ⬜ Fail

---

### Test 5: Sync Panel UI 📊

**Objective**: Verify sync panel displays correctly

**Steps**:
1. Click cloud indicator
2. Inspect panel sections

**Expected Result**:
- Panel slides in from right
- Shows 3 sections:
  - Sync Status (connection, last sync, total syncs, success rate)
  - Backup History (list of backups)
  - Data Statistics (uploaded/downloaded)
- All data displays correctly
- Close button works

**Status**: ⬜ Pass / ⬜ Fail

---

### Test 6: Auto-Backup (Automatic) 💾

**Objective**: Verify automatic backup every 5 minutes

**Steps**:
1. Wait 5 minutes after page load
2. Check browser console for backup logs
3. Open sync panel
4. Check backup history

**Expected Result**:
- Console shows: "💾 Creating backup..."
- Console shows: "✅ Backup saved to cloud"
- Backup appears in history
- Backup has ID, timestamp, size

**Status**: ⬜ Pass / ⬜ Fail

---

### Test 7: Manual Backup 💾

**Objective**: Verify manual backup creation

**Steps**:
1. Open sync panel
2. Click "Create Backup Now" button
3. Wait for completion
4. Check backup history

**Expected Result**:
- Backup created immediately
- Success message appears
- New backup appears in history
- Backup card shows:
  - Backup ID
  - Date/time
  - Size (KB)
  - Location (cloud/local)
  - Restore button

**Status**: ⬜ Pass / ⬜ Fail

---

### Test 8: Backup Restore 🔄

**Objective**: Verify backup restore functionality

**Steps**:
1. Create a backup (if none exist)
2. Change a setting (e.g., moisture threshold)
3. Open sync panel
4. Click "Restore" on a backup
5. Confirm restore
6. Wait for page reload

**Expected Result**:
- Restore confirmation appears
- Success message shows
- Page reloads automatically
- Settings restored to backup values

**Status**: ⬜ Pass / ⬜ Fail

---

### Test 9: Offline Mode 📴

**Objective**: Verify offline sync behavior

**Steps**:
1. Open browser DevTools
2. Go to Network tab
3. Enable "Offline" mode
4. Trigger manual sync
5. Check console and UI

**Expected Result**:
- Console shows: "💾 Data saved to local storage"
- Indicator shows "Offline" (yellow)
- Data saved to localStorage
- No errors thrown

**Status**: ⬜ Pass / ⬜ Fail

---

### Test 10: Online Recovery 🔌

**Objective**: Verify sync resumes when back online

**Steps**:
1. Start in offline mode
2. Make changes (e.g., change settings)
3. Disable offline mode
4. Wait for auto-sync or trigger manual sync

**Expected Result**:
- Indicator changes to "Synced" (green)
- Local data syncs to cloud
- Success message appears
- Sync statistics update

**Status**: ⬜ Pass / ⬜ Fail

---

### Test 11: Sync Statistics 📊

**Objective**: Verify sync statistics tracking

**Steps**:
1. Perform multiple syncs (3-5 times)
2. Open sync panel
3. Check "Sync Status" section
4. Check "Data Statistics" section

**Expected Result**:
- Total syncs count increases
- Success rate shows percentage
- Uploaded data size increases
- Downloaded data size increases
- Last sync time updates

**Status**: ⬜ Pass / ⬜ Fail

---

### Test 12: Toggle Auto-Sync ⚙️

**Objective**: Verify auto-sync can be disabled/enabled

**Steps**:
1. Open sync panel
2. Click "Auto-Sync: ON" button
3. Verify it changes to "Auto-Sync: OFF"
4. Wait 60 seconds
5. Verify no auto-sync occurs
6. Click button again to re-enable

**Expected Result**:
- Button toggles state
- Success message appears
- Auto-sync stops when disabled
- Auto-sync resumes when enabled
- Setting persists after page reload

**Status**: ⬜ Pass / ⬜ Fail

---

### Test 13: Device ID Generation 📱

**Objective**: Verify unique device ID is generated

**Steps**:
1. Open browser console
2. Run: `localStorage.getItem('agrisense_device_id')`
3. Check value

**Expected Result**:
- Device ID exists
- Format: `device_[timestamp]_[random]`
- Same ID persists across page reloads
- Different ID on different browsers/devices

**Status**: ⬜ Pass / ⬜ Fail

---

### Test 14: Data Sync Content 📦

**Objective**: Verify correct data is synced

**Steps**:
1. Open browser console
2. Run: `window.getCloudSyncState()`
3. Trigger manual sync
4. Check Network tab → Request payload

**Expected Result**:
Payload contains:
- `deviceId`
- `userId`
- `timestamp`
- `data` object with:
  - `sensorData`
  - `motorHistory`
  - `alertHistory`
  - `detectionHistory`
  - `weatherData`
  - `marketData`
  - `overflowHistory`
  - `settings`

**Status**: ⬜ Pass / ⬜ Fail

---

### Test 15: Conflict Detection ⚠️

**Objective**: Verify conflict detection (advanced)

**Steps**:
1. Open app on Device A
2. Change moisture threshold to 30
3. Sync
4. Open app on Device B (or new browser)
5. Change moisture threshold to 50
6. Sync
7. Check for conflict modal

**Expected Result**:
- Conflict detected
- Modal appears
- Shows both values (30 vs 50)
- Options: "Keep Local" or "Use Cloud"
- Resolution applies chosen value

**Status**: ⬜ Pass / ⬜ Fail

---

### Test 16: Backup History Limit 📚

**Objective**: Verify backup history limit (10 local, 50 cloud)

**Steps**:
1. Create 15 backups manually
2. Check backup history
3. Check localStorage

**Expected Result**:
- Only last 10 backups in localStorage
- All backups visible in cloud panel
- Oldest backups removed automatically

**Status**: ⬜ Pass / ⬜ Fail

---

### Test 17: Error Handling ❌

**Objective**: Verify error handling for failed sync

**Steps**:
1. Stop backend server
2. Trigger manual sync
3. Check console and UI

**Expected Result**:
- Console shows error message
- Indicator shows "Error" (red)
- Error message displayed to user
- Sync stats show failed sync count
- No app crash

**Status**: ⬜ Pass / ⬜ Fail

---

### Test 18: Responsive Design 📱

**Objective**: Verify UI works on mobile

**Steps**:
1. Open DevTools
2. Toggle device toolbar (mobile view)
3. Click cloud indicator
4. Test all panel features

**Expected Result**:
- Panel takes full width on mobile
- All buttons accessible
- Text readable
- Scrolling works
- Close button visible

**Status**: ⬜ Pass / ⬜ Fail

---

### Test 19: Performance ⚡

**Objective**: Verify sync performance

**Steps**:
1. Open Network tab
2. Trigger manual sync
3. Measure time from request to completion

**Expected Result**:
- Sync completes in < 2 seconds
- Backup completes in < 3 seconds
- Restore completes in < 5 seconds
- No UI freezing
- Smooth animations

**Status**: ⬜ Pass / ⬜ Fail

---

### Test 20: Data Persistence 💾

**Objective**: Verify data persists after page reload

**Steps**:
1. Perform sync
2. Create backup
3. Note last sync time
4. Reload page
5. Check sync panel

**Expected Result**:
- Last sync time persists
- Backup history persists
- Sync statistics persist
- Auto-sync setting persists
- Device ID persists

**Status**: ⬜ Pass / ⬜ Fail

---

## 🎯 Test Results Summary

| Test | Status | Notes |
|------|--------|-------|
| 1. Cloud Connection | ⬜ | |
| 2. Sync Indicator | ⬜ | |
| 3. Auto-Sync | ⬜ | |
| 4. Manual Sync | ⬜ | |
| 5. Sync Panel UI | ⬜ | |
| 6. Auto-Backup | ⬜ | |
| 7. Manual Backup | ⬜ | |
| 8. Backup Restore | ⬜ | |
| 9. Offline Mode | ⬜ | |
| 10. Online Recovery | ⬜ | |
| 11. Sync Statistics | ⬜ | |
| 12. Toggle Auto-Sync | ⬜ | |
| 13. Device ID | ⬜ | |
| 14. Data Content | ⬜ | |
| 15. Conflict Detection | ⬜ | |
| 16. Backup Limit | ⬜ | |
| 17. Error Handling | ⬜ | |
| 18. Responsive Design | ⬜ | |
| 19. Performance | ⬜ | |
| 20. Data Persistence | ⬜ | |

**Total Passed**: _____ / 20
**Pass Rate**: _____ %

---

## 🐛 Common Issues & Solutions

### Issue: Sync indicator not visible
**Solution**: Check if `cloud_sync.css` is loaded

### Issue: Auto-sync not working
**Solution**: Check if auto-sync is enabled in settings

### Issue: Backup not created
**Solution**: Check browser console for errors, verify storage space

### Issue: Restore not working
**Solution**: Verify backup exists, check data integrity

### Issue: Offline mode not detected
**Solution**: Use browser DevTools offline mode, not system network

---

## 📝 Testing Notes

- Test in multiple browsers (Chrome, Firefox, Safari, Edge)
- Test on different devices (Desktop, Tablet, Mobile)
- Test with different network speeds (Fast 3G, Slow 3G, Offline)
- Test with large datasets (100+ sensor readings)
- Test concurrent syncs from multiple devices

---

**Testing Date**: __________
**Tester Name**: __________
**Browser**: __________
**Device**: __________

---

**End of Testing Guide**
