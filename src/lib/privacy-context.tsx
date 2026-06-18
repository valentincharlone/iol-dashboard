"use client";

import { createContext, useContext, useState } from "react";

const PrivacyCtx = createContext({ privacy: false, toggle: () => {} });

export function PrivacyProvider({ children }: { children: React.ReactNode }) {
  const [privacy, setPrivacy] = useState(false);
  return (
    <PrivacyCtx.Provider value={{ privacy, toggle: () => setPrivacy(p => !p) }}>
      {children}
    </PrivacyCtx.Provider>
  );
}

export function usePrivacy() {
  return useContext(PrivacyCtx);
}
