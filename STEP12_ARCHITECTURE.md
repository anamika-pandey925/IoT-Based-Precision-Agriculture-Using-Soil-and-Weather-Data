# 🏗️ STEP 12: CLOUD SYNC ARCHITECTURE

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Browser)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   UI Layer   │  │  Sync Logic  │  │Local Storage │          │
│  │              │  │              │  │              │          │
│  │ • Indicator  │  │ • Auto-sync  │  │ • Device ID  │          │
│  │ • Panel      │  │ • Manual     │  │ • Backups    │          │
│  │ • Modals     │  │ • Conflicts  │  │ • Settings   │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                   │
│         └──────────────────┼──────────────────┘                   │
│                            │                                       │
│                    ┌───────▼────────┐                            │
│                    │  cloud_sync.js │                            │
│                    │   (18.5 KB)    │                            │
│                    └───────┬────────┘                            │
│                            │                                       │
└────────────────────────────┼───────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   HTTP/HTTPS    │
                    │   (REST API)    │
                    └────────┬────────┘
                             │
┌────────────────────────────▼───────────────────────────────────┐
│                      BACKEND (Flask)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    API Endpoints                          │  │
│  │                                                            │  │
│  │  • GET  /api/cloud/status                                │  │
│  │  • POST /api/cloud/sync                                  │  │
│  │  • POST /api/cloud/backup                                │  │
│  │  • GET  /api/cloud/backup/<id>                           │  │
│  │  • GET  /api/cloud/backups?userId=<id>                   │  │
│  └────────────────────┬─────────────────────────────────────┘  │
│                       │                                          │
│  ┌────────────────────▼─────────────────────────────────────┐  │
│  │              Business Logic Layer                         │  │
│  │                                                            │  │
│  │  • Sync handler                                           │  │
│  │  • Backup handler                                         │  │
│  │  • Conflict detector                                      │  │
│  │  • Data validator                                         │  │
│  └────────────────────┬─────────────────────────────────────┘  │
│                       │                                          │
│  ┌────────────────────▼─────────────────────────────────────┐  │
│  │                Storage Layer                              │  │
│  │                                                            │  │
│  │  ┌──────────────┐         ┌──────────────┐              │  │
│  │  │ cloud_storage│         │backup_storage│              │  │
│  │  │  (In-Memory) │         │  (In-Memory) │              │  │
│  │  │              │         │              │              │  │
│  │  │ • User data  │         │ • Backups    │              │  │
│  │  │ • Sync data  │         │ • Metadata   │              │  │
│  │  └──────────────┘         └──────────────┘              │  │
│  │                                                            │  │
│  │  Production: Replace with PostgreSQL/MongoDB             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
└───────────────────────────────────────────────────────────────┘
```

---

## 🔄 Sync Flow Diagram

```
┌─────────────┐
│   Browser   │
│  (Device A) │
└──────┬──────┘
       │
       │ 1. Collect data
       │    (sensor, motor, alerts, etc.)
       │
       ▼
┌──────────────┐
│ cloud_sync.js│
│              │
│ • Validate   │
│ • Compress   │
│ • Queue      │
└──────┬───────┘
       │
       │ 2. POST /api/cloud/sync
       │    {deviceId, userId, data}
       │
       ▼
┌──────────────┐
│ Flask Backend│
│              │
│ • Receive    │
│ • Validate   │
│ • Store      │
└──────┬───────┘
       │
       │ 3. Check for updates
       │    from other devices
       │
       ▼
┌──────────────┐
│cloud_storage │
│              │
│ • Merge data │
│ • Detect     │
│   conflicts  │
└──────┬───────┘
       │
       │ 4. Return updated data
       │    {success, data, conflicts}
       │
       ▼
┌──────────────┐
│ cloud_sync.js│
│              │
│ • Apply      │
│ • Resolve    │
│ • Update UI  │
└──────┬───────┘
       │
       │ 5. Update local state
       │
       ▼
┌──────────────┐
│   Browser    │
│  (Device A)  │
│              │
│ ✅ Synced    │
└──────────────┘
```

---

## 💾 Backup Flow Diagram

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       │ 1. Trigger backup
       │    (auto or manual)
       │
       ▼
┌──────────────┐
│ cloud_sync.js│
│              │
│ • Collect    │
│ • Generate ID│
│ • Timestamp  │
└──────┬───────┘
       │
       │ 2. POST /api/cloud/backup
       │    {backupId, data}
       │
       ▼
┌──────────────┐
│ Flask Backend│
│              │
│ • Validate   │
│ • Store      │
│ • Log        │
└──────┬───────┘
       │
       │ 3. Save to storage
       │
       ▼
┌──────────────┐
│backup_storage│
│              │
│ • Add backup │
│ • Update     │
│   metadata   │
└──────┬───────┘
       │
       │ 4. Return confirmation
       │    {success, backupId, size}
       │
       ▼
┌──────────────┐
│ cloud_sync.js│
│              │
│ • Update     │
│   history    │
│ • Show UI    │
└──────┬───────┘
       │
       │ 5. Display in panel
       │
       ▼
┌──────────────┐
│   Browser    │
│              │
│ ✅ Backed up │
└──────────────┘
```

---

## 🔄 Restore Flow Diagram

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       │ 1. User clicks "Restore"
       │    on backup card
       │
       ▼
┌──────────────┐
│ cloud_sync.js│
│              │
│ • Confirm    │
│ • Request    │
└──────┬───────┘
       │
       │ 2. GET /api/cloud/backup/<id>
       │
       ▼
┌──────────────┐
│ Flask Backend│
│              │
│ • Fetch      │
│ • Validate   │
│ • Log        │
└──────┬───────┘
       │
       │ 3. Retrieve from storage
       │
       ▼
┌──────────────┐
│backup_storage│
│              │
│ • Find backup│
│ • Return data│
└──────┬───────┘
       │
       │ 4. Return backup data
       │    {success, data}
       │
       ▼
┌──────────────┐
│ cloud_sync.js│
│              │
│ • Check      │
│   conflicts  │
│ • Apply data │
└──────┬───────┘
       │
       │ 5. Update localStorage
       │    and reload
       │
       ▼
┌──────────────┐
│   Browser    │
│              │
│ ✅ Restored  │
└──────────────┘
```

---

## 🔀 Multi-Device Sync

```
┌──────────────┐         ┌──────────────┐
│  Device A    │         │  Device B    │
│  (Desktop)   │         │  (Mobile)    │
└──────┬───────┘         └──────┬───────┘
       │                        │
       │ 1. Change setting      │
       │    threshold = 30      │
       │                        │
       ▼                        │
┌──────────────┐                │
│ Sync to Cloud│                │
└──────┬───────┘                │
       │                        │
       │ 2. Upload              │
       │                        │
       ▼                        │
┌──────────────┐                │
│ Cloud Storage│                │
│              │                │
│ threshold=30 │                │
└──────┬───────┘                │
       │                        │
       │                        │ 3. Auto-sync
       │                        │    (60s later)
       │                        │
       │                        ▼
       │                 ┌──────────────┐
       │                 │Download from │
       │                 │    Cloud     │
       │                 └──────┬───────┘
       │                        │
       │                        │ 4. Apply update
       │                        │
       │                        ▼
       │                 ┌──────────────┐
       │                 │  Device B    │
       │                 │              │
       │                 │threshold=30  │
       │                 │ ✅ Synced    │
       │                 └──────────────┘
       │
       ▼
┌──────────────┐
│  Device A    │
│              │
│ ✅ Synced    │
└──────────────┘
```

---

## ⚠️ Conflict Resolution Flow

```
┌──────────────┐         ┌──────────────┐
│  Device A    │         │  Device B    │
└──────┬───────┘         └──────┬───────┘
       │                        │
       │ threshold = 30         │ threshold = 50
       │ (offline)              │ (offline)
       │                        │
       ▼                        ▼
┌──────────────┐         ┌──────────────┐
│ Local Storage│         │ Local Storage│
└──────┬───────┘         └──────┬───────┘
       │                        │
       │ Both come online       │
       │                        │
       ▼                        ▼
┌──────────────┐         ┌──────────────┐
│ Sync to Cloud│         │ Sync to Cloud│
└──────┬───────┘         └──────┬───────┘
       │                        │
       └────────┬───────┬───────┘
                │       │
                ▼       ▼
         ┌──────────────────┐
         │  Cloud Storage   │
         │                  │
         │ Conflict Detected│
         │ • Local: 30      │
         │ • Remote: 50     │
         └────────┬─────────┘
                  │
                  │ Return conflict
                  │
                  ▼
         ┌──────────────────┐
         │ Conflict Modal   │
         │                  │
         │ Which to keep?   │
         │ [Local: 30]      │
         │ [Cloud: 50]      │
         └────────┬─────────┘
                  │
                  │ User chooses
                  │
                  ▼
         ┌──────────────────┐
         │ Apply Resolution │
         │                  │
         │ threshold = 50   │
         │ ✅ Resolved      │
         └──────────────────┘
```

---

## 📊 Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                    Data Collection                       │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Sensor Data ──┐                                        │
│  Motor History ┼──► collectSyncData() ──► Sync Payload │
│  Alert History ┼──►                                     │
│  Detections    ┼──►                                     │
│  Weather       ┼──►                                     │
│  Market        ┼──►                                     │
│  Overflow      ┼──►                                     │
│  Settings      ┘                                        │
│                                                           │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    Data Validation                       │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  • Check required fields                                 │
│  • Validate data types                                   │
│  • Sanitize inputs                                       │
│  • Check data size                                       │
│                                                           │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    Data Transmission                     │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  • Compress (optional)                                   │
│  • Encrypt (production)                                  │
│  • Send via HTTP POST                                    │
│  • Handle errors                                         │
│                                                           │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    Backend Processing                    │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  • Receive request                                       │
│  • Validate payload                                      │
│  • Check authentication (production)                     │
│  • Store in database                                     │
│  • Detect conflicts                                      │
│  • Merge data                                            │
│  • Return response                                       │
│                                                           │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    Data Application                      │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  • Receive response                                      │
│  • Check for conflicts                                   │
│  • Apply updates                                         │
│  • Update UI                                             │
│  • Update statistics                                     │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 Security Architecture (Production)

```
┌─────────────────────────────────────────────────────────┐
│                    Client Layer                          │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐                                       │
│  │ User Login   │                                       │
│  │              │                                       │
│  │ • Username   │                                       │
│  │ • Password   │                                       │
│  └──────┬───────┘                                       │
│         │                                                │
│         ▼                                                │
│  ┌──────────────┐                                       │
│  │ JWT Token    │                                       │
│  │              │                                       │
│  │ • Store      │                                       │
│  │ • Attach     │                                       │
│  └──────┬───────┘                                       │
│         │                                                │
└─────────┼────────────────────────────────────────────┘
          │
          │ HTTPS (TLS/SSL)
          │
┌─────────▼────────────────────────────────────────────┐
│                    API Gateway                         │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  • Rate limiting                                         │
│  • Request validation                                    │
│  • Token verification                                    │
│  • CORS handling                                         │
│                                                           │
└─────────┬───────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────┐
│                    Backend Layer                         │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐                                       │
│  │ Auth Service │                                       │
│  │              │                                       │
│  │ • Verify JWT │                                       │
│  │ • Check perms│                                       │
│  └──────┬───────┘                                       │
│         │                                                │
│         ▼                                                │
│  ┌──────────────┐                                       │
│  │ Data Service │                                       │
│  │              │                                       │
│  │ • Validate   │                                       │
│  │ • Sanitize   │                                       │
│  │ • Process    │                                       │
│  └──────┬───────┘                                       │
│         │                                                │
└─────────┼────────────────────────────────────────────┘
          │
          │ Encrypted connection
          │
┌─────────▼────────────────────────────────────────────┐
│                    Database Layer                      │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  • Encrypted at rest                                     │
│  • Access control                                        │
│  • Audit logging                                         │
│  • Backup encryption                                     │
│                                                           │
└───────────────────────────────────────────────────────┘
```

---

## 📈 Scalability Architecture (Production)

```
┌─────────────────────────────────────────────────────────┐
│                    Load Balancer                         │
│                    (NGINX/HAProxy)                       │
└─────────┬───────────────────────────────────┬───────────┘
          │                                   │
          ▼                                   ▼
┌──────────────────┐              ┌──────────────────┐
│  Backend Server  │              │  Backend Server  │
│     (Node 1)     │              │     (Node 2)     │
└────────┬─────────┘              └────────┬─────────┘
         │                                  │
         └──────────────┬───────────────────┘
                        │
                        ▼
         ┌──────────────────────────┐
         │    Redis Cache Layer     │
         │                          │
         │  • Session storage       │
         │  • Sync queue            │
         │  • Rate limiting         │
         └──────────┬───────────────┘
                    │
                    ▼
         ┌──────────────────────────┐
         │  Database Cluster        │
         │                          │
         │  ┌────────┐  ┌────────┐ │
         │  │ Master │  │ Slave  │ │
         │  │  (RW)  │  │  (R)   │ │
         │  └────────┘  └────────┘ │
         └──────────────────────────┘
```

---

**End of Architecture Documentation**
