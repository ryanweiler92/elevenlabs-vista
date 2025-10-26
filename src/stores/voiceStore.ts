import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";

interface VoiceLabels {
  accent: string;
  age: string;
  gender: string;
  descriptive: string;
  use_case: string;
}

interface Voice {
  voice_id: string;
  name: string;
  description: string;
  preview_url: string;
  category: string;
  labels: VoiceLabels;
}

interface VoiceState {
  voices: Voice[];
  setVoices: (voices: Voice[]) => void;
}

export const useVoiceStore = create<VoiceState>((set) => ({
  voices: [],
  setVoices: (voices: Voice[]) => set({ voices }),
}));

export async function fetchAndStoreVoices() {
  try {
    const voices: Voice[] = await invoke("get_voices");
    useVoiceStore.getState().setVoices(voices);
  } catch (error) {
    console.error("Error fetching voices:", error);
  }
}

export const logVoices = () => {
  const voices = useVoiceStore.getState().voices;
  console.log("Current voices in store:", voices);
};
