import React, { createContext, useContext, useReducer } from 'react';

const initialState = {
  data: null,           // latest sensor reading
  history: [],          // rolling buffer of last 20 readings
  serverStatus: 'unknown',  // 'online' | 'offline' | 'unknown'
  sensorConnected: false,
  loading: true,
  lastUpdate: null,
  error: null,
};

function sensorReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_SENSORS': {
      const newReading = {
        ...action.payload,
        timestamp: Date.now(),
      };
      const history = [newReading, ...state.history].slice(0, 20);
      return {
        ...state,
        data: newReading,
        history,
        serverStatus: 'online',
        sensorConnected: action.payload.sensor_connected !== false,
        loading: false,
        lastUpdate: Date.now(),
        error: null,
      };
    }
    case 'SERVER_DOWN':
      return {
        ...state,
        serverStatus: 'offline',
        loading: false,
        error: 'SERVER_DOWN',
      };
    case 'SENSOR_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

const SensorContext = createContext(null);

export function SensorProvider({ children }) {
  const [state, dispatch] = useReducer(sensorReducer, initialState);

  return (
    <SensorContext.Provider value={{ state, dispatch }}>
      {children}
    </SensorContext.Provider>
  );
}

export function useSensor() {
  const ctx = useContext(SensorContext);
  if (!ctx) throw new Error('useSensor must be used within SensorProvider');
  return ctx;
}
