"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { SidebarProvider } from "./SidebarContext";

// Define UserContext type
interface UiContext {
  loading: boolean;
  selectedClient: string | null; // null means none is selected yet
  setSelectedClient: (id: string | null) => void;
  selectedQuote: string | null; // null means none is selected yet
  setSelectedQuote: (id: string | null) => void;
  setSelectedLocation: (id: string | null) => void;
  selectedLocation?: string | null;
}

// ✅ Create UserContext
export const UserContext = createContext<UiContext | undefined>(undefined);

export const UiProvider = ({ children }: { children: ReactNode }) => {
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  return (
    <SidebarProvider>
      <UserContext.Provider
        value={{
          loading,
          setSelectedClient,
          selectedClient,
          selectedQuote,
          setSelectedQuote,
          setSelectedLocation,
          selectedLocation,
        }}
      >
        {children}
      </UserContext.Provider>
    </SidebarProvider>
  );
};

// ✅ Custom Hook
export const useUi = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UiProvider");
  }
  return context;
};
