import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { invoke } from "@tauri-apps/api/core";

interface RustUserData {
  first_name: string;
  character_limit: number;
  character_count: number;
  next_character_count_reset_unix: number;
  voice_limit: number;
  voice_slots_used: number;
}

interface UserData {
  first_name: string;
  character_limit: number;
  character_count: number;
  character_reset_date: string;
  voice_limit: number;
  voice_slots_used: number;
}

const defaultUser: UserData = {
  first_name: "User",
  character_limit: 0,
  character_count: 0,
  character_reset_date: "01/07/1992",
  voice_limit: 0,
  voice_slots_used: 0,
};

interface UserState {
  userData: UserData;
  setUserData: (data: UserData) => void;
}

export const useUserStore = create<UserState>()(
  devtools(
    (set) => ({
      userData: defaultUser,
      setUserData: (data) => set({ userData: data }, false, "setUserData"),
    }),
    { name: "UserStore" }
  )
);

function mapRustUserData(data: RustUserData): UserData {
  return {
    first_name: data.first_name,
    character_limit: data.character_limit,
    character_count: data.character_count,
    character_reset_date: new Date(
      data.next_character_count_reset_unix * 1000
    ).toLocaleString(),
    voice_limit: data.voice_limit,
    voice_slots_used: data.voice_slots_used,
  };
}

export async function fetchAndStoreUserData() {
  try {
    const result = await invoke<RustUserData>("get_user_data");
    useUserStore.getState().setUserData(mapRustUserData(result));
    console.log("User data fetched and stored:", result);
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
}

export const logUserState = () => {
  const state = useUserStore.getState();
  console.log("Current User State:", state.userData);
};
