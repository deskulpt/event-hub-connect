import { create } from "zustand";
import { persist } from "zustand/middleware";

interface DemoState {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

export const useDemoStore = create<DemoState>()(
  persist((set) => ({ enabled: false, setEnabled: (enabled) => set({ enabled }) }), { name: "vibely-demo-mode" }),
);
