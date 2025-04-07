"use client";

import {
  FC,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AUTO_CONNECT_LOCAL_STORAGE_KEY = "AptosWalletAutoConnect";

export interface AutoConnectContextState {
  autoConnect: boolean;
  setAutoConnect(autoConnect: boolean): void;
}

export const AutoConnectContext = createContext<AutoConnectContextState>(
  {} as AutoConnectContextState
);

export function useAutoConnect(): AutoConnectContextState {
  return useContext(AutoConnectContext);
}

export const AutoConnectProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [autoConnect, setAutoConnect] = useState(true);

  useEffect(() => {
    try {
      const isAutoConnect = localStorage.getItem(
        AUTO_CONNECT_LOCAL_STORAGE_KEY
      );
      if (isAutoConnect === "false") {
        setAutoConnect(false);
      } else {
        localStorage.setItem(AUTO_CONNECT_LOCAL_STORAGE_KEY, "true");
      }
    } catch (e) {
      if (typeof window !== "undefined") {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        AUTO_CONNECT_LOCAL_STORAGE_KEY,
        JSON.stringify(autoConnect)
      );
    } catch (error: any) {
      if (typeof window !== "undefined") {
        console.error(error);
      }
    }
  }, [autoConnect]);

  return (
    <AutoConnectContext.Provider value={{ autoConnect, setAutoConnect }}>
      {children}
    </AutoConnectContext.Provider>
  );
};
