import { create } from "zustand";

interface AgentCreationState {
  name: string;
  personality: string;
  setAgentDetails: (name: string, personality: string) => void;
  clearAgentDetails: () => void;
}

export const useAgentStore = create<AgentCreationState>((set) => ({
  name: "",
  personality: "",
  setAgentDetails: (name, personality) => set({ name, personality }),
  clearAgentDetails: () => set({ name: "", personality: "" }),
}));
