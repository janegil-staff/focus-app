import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../api/client";

const AdviceContext = createContext(null);

export function AdviceProvider({ children }) {
  const [totalCount, setTotalCount]     = useState(0);
  const [viewed, setViewed]             = useState(new Set());
  const [userRelevant, setUserRelevant] = useState(new Set());

  // Fetch total advice count once on mount so the badge is correct
  // without requiring AdviceScreen to have been opened
  useEffect(() => {
    api.get("/api/advice")
      .then((res) => setTotalCount(res.data.data.length))
      .catch(() => {}); // silent — badge just shows 0 if it fails
  }, []);

  const markViewed = useCallback((id) => {
    setViewed((prev) => new Set([...prev, id]));
  }, []);

  const toggleRelevant = useCallback((id) => {
    setUserRelevant((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const unreadCount = Math.max(0, totalCount - viewed.size);

  return (
    <AdviceContext.Provider value={{ viewed, userRelevant, markViewed, toggleRelevant, unreadCount }}>
      {children}
    </AdviceContext.Provider>
  );
}

export function useAdvice() {
  const ctx = useContext(AdviceContext);
  if (!ctx) throw new Error("useAdvice must be used inside AdviceProvider");
  return ctx;
}
