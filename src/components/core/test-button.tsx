import { Button } from "@/components/ui/button";
import { appDataDir } from "@tauri-apps/api/path";
import { loadElevenLabsApiKey } from "@/lib/secure-store2";
import { invoke } from "@tauri-apps/api/core";
import { logUserState } from "@/stores/userStore";
import { logVoices } from "@/stores/voiceStore";
import { sendSampleTTSRequest } from "@/stores/ttsStore";

export function TestButton() {
  const consoleTest = async () => {
    await sendSampleTTSRequest();
  };

  return <Button onClick={consoleTest}>Test Button</Button>;
}
