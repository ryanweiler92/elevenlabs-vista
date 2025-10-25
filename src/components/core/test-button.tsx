import { Button } from "@/components/ui/button";
import { appDataDir } from "@tauri-apps/api/path";
import { loadElevenLabsApiKey } from "@/lib/secure-store2";
import { invoke } from "@tauri-apps/api/core";
import { logUserState } from "@/stores/userStore";

type UserData = {
  first_name: string;
  character_limit: number;
  character_count: number;
  next_character_count_reset_unix: number;
  voice_limit: number;
  voice_slots_used: number;
};

export function TestButton() {
  const consoleTest = async () => {
    logUserState();
  };

  return <Button onClick={consoleTest}>Test Button</Button>;
}
