"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

/* Tells the support strip whether a duck race is running, so it can hold
   perfectly still while the game is projected in front of a class.

   /duck-race renders the game and the strip as siblings from a server
   component, so the strip cannot take a prop from the game; this context
   sits around both. Outside a provider (the home page, or the game used
   elsewhere) the default says "not busy" and reporting does nothing. */

interface RaceState {
  busy: boolean;
  setBusy: (busy: boolean) => void;
}

const RaceStateContext = createContext<RaceState>({ busy: false, setBusy: () => {} });

export function RaceStateProvider({ children }: { children: ReactNode }) {
  const [busy, setBusy] = useState(false);
  return <RaceStateContext.Provider value={{ busy, setBusy }}>{children}</RaceStateContext.Provider>;
}

export function useRaceBusy(): boolean {
  return useContext(RaceStateContext).busy;
}

export function useReportRaceBusy(busy: boolean): void {
  const { setBusy } = useContext(RaceStateContext);
  useEffect(() => {
    setBusy(busy);
  }, [busy, setBusy]);
  useEffect(() => () => setBusy(false), [setBusy]);
}
