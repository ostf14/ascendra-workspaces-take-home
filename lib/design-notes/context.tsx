"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "ascendra:design-notes:on";

type Ctx = { enabled: boolean; toggle: () => void };

const DesignNotesContext = createContext<Ctx>({
  enabled: false,
  toggle: () => {},
});

export function DesignNotesProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);

  // Read persisted state once on mount. Client-only, so SSR renders overlay
  // off by default and the toggle updates after hydration.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (window.localStorage.getItem(STORAGE_KEY) === "true") {
        setEnabled(true);
      }
    } catch {
      // Storage disabled — overlay stays off, which is the safe default.
    }
  }, []);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? "true" : "false");
      } catch {
        // Storage disabled — the toggle still works in-session.
      }
      return next;
    });
  }, []);

  return (
    <DesignNotesContext.Provider value={{ enabled, toggle }}>
      {children}
    </DesignNotesContext.Provider>
  );
}

export function useDesignNotes(): Ctx {
  return useContext(DesignNotesContext);
}
