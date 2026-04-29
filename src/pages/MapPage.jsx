import React, { useEffect, useRef } from 'react';
import { FaMapLocationDot } from 'react-icons/fa6';
import styles from './MapPage.module.css';

function MapPage() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    // Dynamically load Leaflet to avoid SSR issues
    if (mapInstanceRef.current) return;

    const L = window.L;
    if (!L || !mapRef.current) return;

    const map = L.map(mapRef.current).setView([20.5937, 78.9629], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    // Farm marker
    L.marker([20.5937, 78.9629])
      .addTo(map)
      .bindPopup('<b>🌾 Your Farm</b><br>AgriSense Monitoring Active')
      .openPopup();

    mapInstanceRef.current = map;
    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  return (
    <div>
      <h1 className="section-title"><FaMapLocationDot aria-hidden="true" /> Farm Map</h1>
      <div className={styles.mapCard}>
        <div
          ref={mapRef}
          className={styles.mapWrapper}
          aria-label="Interactive farm map"
          role="application"
        />
        <p className={styles.mapNote}>
          Map shows your farm location. Zoom in to see field boundaries and sensor zones.
        </p>
      </div>
    </div>
  );
}

export default MapPage;
