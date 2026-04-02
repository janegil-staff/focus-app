import React, { createContext, useContext, useState, useCallback } from 'react';
import { logsApi } from '../api';

const LogsContext = createContext(null);

export function LogsProvider({ children }) {
  const [logs, setLogs]       = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await logsApi.getLogs(90);
      setLogs(data ?? []);
    } catch {}
    setLoading(false);
  }, []);

  const fetchSummary = useCallback(async (days = 7) => {
    try {
      const data = await logsApi.getSummary(days);
      setSummary(data ?? {});
    } catch {}
  }, []);

  const saveLog = async (log) => {
    const saved = await logsApi.saveLog(log);
    setLogs((prev) => {
      const idx = prev.findIndex((l) => l.date === log.date);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
    return saved;
  };

  const deleteLog = async (date) => {
    await logsApi.deleteLog(date);
    setLogs((prev) => prev.filter((l) => l.date !== date));
  };

  const getLogForDate = (date) => logs.find((l) => l.date === date) ?? null;

  return (
    <LogsContext.Provider value={{
      logs, summary, loading,
      fetchLogs, fetchSummary,
      saveLog, deleteLog, getLogForDate,
    }}>
      {children}
    </LogsContext.Provider>
  );
}

export const useLogs = () => useContext(LogsContext);
