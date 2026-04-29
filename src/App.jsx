import React, { useState, Suspense, lazy } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { SettingsProvider } from './context/SettingsContext';
import { SensorProvider } from './context/SensorContext';
import { AlertProvider } from './context/AlertContext';
import Navbar from './components/common/Navbar';
import AlertToastContainer from './components/common/AlertToast';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingSpinner from './components/common/LoadingSpinner';
import PlantScanner from './components/ai/PlantScanner';
import DataOrchestrator from './DataOrchestrator';
import './styles/globals.css';
import './styles/animations.css';

// Lazy-load pages for code splitting
const DashboardPage   = lazy(() => import('./pages/DashboardPage'));
const AnalyticsPage   = lazy(() => import('./pages/AnalyticsPage'));
const AIAssistantPage = lazy(() => import('./pages/AIAssistantPage'));
const WeatherPage     = lazy(() => import('./pages/WeatherPage'));
const DetectionPage   = lazy(() => import('./pages/DetectionPage'));
const MarketPage      = lazy(() => import('./pages/MarketPage'));
const MapPage         = lazy(() => import('./pages/MapPage'));
const OverflowPage    = lazy(() => import('./pages/OverflowPage'));
const SettingsPage    = lazy(() => import('./pages/SettingsPage'));

function AppContent() {
  const [scannerOpen, setScannerOpen] = useState(false);

  return (
    <div className="app-layout">
      <Navbar onScanClick={() => setScannerOpen(true)} />
      <AlertToastContainer />
      {scannerOpen && <PlantScanner onClose={() => setScannerOpen(false)} />}

      {/* DataOrchestrator runs global hooks (sensor polling, alert engine) */}
      <DataOrchestrator />

      <main className="page-content">
        <Suspense fallback={<LoadingSpinner message="Loading page..." />}>
          <Routes>
            <Route path="/"          element={<ErrorBoundary><DashboardPage /></ErrorBoundary>} />
            <Route path="/analytics" element={<ErrorBoundary><AnalyticsPage /></ErrorBoundary>} />
            <Route path="/ai"        element={<ErrorBoundary><AIAssistantPage /></ErrorBoundary>} />
            <Route path="/weather"   element={<ErrorBoundary><WeatherPage /></ErrorBoundary>} />
            <Route path="/detection" element={<ErrorBoundary><DetectionPage /></ErrorBoundary>} />
            <Route path="/market"    element={<ErrorBoundary><MarketPage /></ErrorBoundary>} />
            <Route path="/map"       element={<ErrorBoundary><MapPage /></ErrorBoundary>} />
            <Route path="/overflow"  element={<ErrorBoundary><OverflowPage /></ErrorBoundary>} />
            <Route path="/settings"  element={<ErrorBoundary><SettingsPage /></ErrorBoundary>} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

function App() {
  return (
    <HashRouter>
      <ThemeProvider>
        <SettingsProvider>
          <SensorProvider>
            <AlertProvider>
              <AppContent />
            </AlertProvider>
          </SensorProvider>
        </SettingsProvider>
      </ThemeProvider>
    </HashRouter>
  );
}

export default App;
