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

  const exportData = useCallback(() => {
    const json = JSON.stringify(records, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wod-records-${toDateKey()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [records]);

  const importData = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          if (typeof imported !== 'object' || Array.isArray(imported)) {
            throw new Error('올바른 형식이 아닙니다.');
          }
          const merged = { ...records, ...imported };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          setRecords(merged);
          resolve(Object.keys(imported).length);
        } catch (err) {
          reject(err);
        }
      };
      reader.readAsText(file);
    });
  }, [records]);

  return { records, saveRecord, deleteRecord, exportData, importData };
}
