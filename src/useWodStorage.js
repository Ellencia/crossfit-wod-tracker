import { useState, useCallback } from 'react';

const STORAGE_KEY = 'wod-calendar';

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
}

// date key format: "YYYY-MM-DD"
export function toDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function useWodStorage() {
  const [records, setRecords] = useState(load);

  const saveRecord = useCallback((dateKey, data) => {
    setRecords(prev => {
      const updated = { ...prev, [dateKey]: { ...data, savedAt: new Date().toISOString() } };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteRecord = useCallback((dateKey) => {
    setRecords(prev => {
      const updated = { ...prev };
      delete updated[dateKey];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { records, saveRecord, deleteRecord };
}
