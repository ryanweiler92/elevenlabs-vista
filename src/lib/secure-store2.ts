import { type Client, Stronghold } from "@tauri-apps/plugin-stronghold";
import { appDataDir } from "@tauri-apps/api/path";

const STORE_NAME = "main"; // Use a consistent store name

const initStronghold = async () => {
  // Return cached instance if it exists

  const vaultPath = `${await appDataDir()}/vault.hold`;
  const vaultPassword = "my-strong-vault-password";
  console.log("Loading stronghold from:", vaultPath);
  const stronghold = await Stronghold.load(vaultPath, vaultPassword);
  console.log("Stronghold loaded!");

  let client;
  const clientName = "elevenlabs-vista-client";
  try {
    console.log("Attempting to load existing client...");
    client = await stronghold.loadClient(clientName);
    console.log("Loaded existing client");
  } catch (e) {
    console.log("Creating new client...");
    client = await stronghold.createClient(clientName);
    console.log("Created new client");
  }

  return { stronghold, client };
};

async function insertRecord(store: any, key: string, value: string) {
  const data = Array.from(new TextEncoder().encode(value));
  await store.insert(key, data);
}

async function getRecord(store: any, key: string): Promise<string | null> {
  try {
    const data = await store.get(key);
    if (!data) {
      console.log(`No data found for key: ${key}`);
      return null;
    }
    return new TextDecoder().decode(new Uint8Array(data));
  } catch (error) {
    console.error(`Error getting record for key ${key}:`, error);
    return null;
  }
}

export async function saveElevenLabsApiKey(value: string) {
  try {
    console.log("Starting saveElevenLabsApiKey...");
    const { stronghold, client } = await initStronghold();
    const store = client.getStore(STORE_NAME); // Use named store!
    await insertRecord(store, "elevenlabs-api-key", value);

    const storedValue = await getRecord(store, "elevenlabs-api-key");
    console.log(`Saved API key: ${storedValue}`);

    await stronghold.save();
    console.log("Stronghold saved successfully");
  } catch (error) {
    console.error("Error in saveElevenLabsApiKey:", error);
    throw error;
  }
}

export async function loadElevenLabsApiKey(): Promise<string | null> {
  try {
    console.log("Starting loadElevenLabsApiKey...");
    const { stronghold, client } = await initStronghold();
    const store = client.getStore(STORE_NAME); // Use the SAME named store!
    console.log("Got store, attempting to get record...");
    const value = await getRecord(store, "elevenlabs-api-key");
    console.log(
      "Loaded API key:",
      value ? `${value.substring(0, 10)}...` : "null"
    );
    return value;
  } catch (error) {
    console.error("Error in loadElevenLabsApiKey:", error);
    return null;
  }
}
