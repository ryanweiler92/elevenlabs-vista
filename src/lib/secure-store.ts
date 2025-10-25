// Stronghold-backed secure storage for the ElevenLabs API key (Tauri v2).
// Falls back to no-op in web preview (no Tauri runtime).

const VAULT_FILE = "vault.hold";
const CLIENT_NAME = "elevenlabs-vista";
const STORE_NAME = "default"; // Add explicit store name
const KEY = "eleven_labs_api_key";

type StrongholdApi = typeof import("@tauri-apps/plugin-stronghold");

let strongholdPromise: Promise<any> | null = null;
let clientPromise: Promise<any> | null = null;
let storePromise: Promise<any> | null = null; // Cache the store too

async function isTauriRuntime() {
  return Boolean((window as any)?.__TAURI__);
}

async function ensureStronghold() {
  if (typeof window === "undefined") return null;
  if (!(await isTauriRuntime())) return null;

  if (!strongholdPromise) {
    strongholdPromise = (async () => {
      const { Stronghold } = (await import(
        "@tauri-apps/plugin-stronghold"
      )) as StrongholdApi;
      const { appDataDir } = await import("@tauri-apps/api/path");
      const dir = await appDataDir();
      const vaultPath = `${dir}${VAULT_FILE}`;
      // WARNING: For production, derive/store this securely (e.g., OS keychain).
      const vaultPassword = "vault password";
      return await Stronghold.load(vaultPath, vaultPassword);
    })();
  }
  return strongholdPromise;
}

async function ensureClient() {
  const stronghold = await ensureStronghold();
  if (!stronghold) return null;
  if (!clientPromise) {
    clientPromise = (async () => {
      try {
        return await stronghold.loadClient(CLIENT_NAME);
      } catch {
        return await stronghold.createClient(CLIENT_NAME);
      }
    })();
  }
  return clientPromise;
}

async function ensureStore() {
  const client = await ensureClient();
  if (!client) return null;
  if (!storePromise) {
    storePromise = (async () => {
      // Use a named store consistently
      return client.getStore(STORE_NAME);
    })();
  }
  return storePromise;
}

async function getStoreAndStronghold() {
  const stronghold = await ensureStronghold();
  const store = await ensureStore();
  if (!stronghold || !store)
    return { store: null as any, stronghold: null as any };
  return { store, stronghold };
}

export async function saveElevenLabsApiKey(value: string) {
  const { store, stronghold } = await getStoreAndStronghold();
  if (!store || !stronghold) {
    console.log("Secure store not available; cannot save API key");
    throw new Error("Secure store is not available");
  }
  const data = Array.from(new TextEncoder().encode(value));
  console.log("Attempting to save:", { key: KEY, dataLength: data.length });
  await store.insert(KEY, data);
  await stronghold.save();

  // Verify it was saved
  const verify = await store.get(KEY);
  console.log("Verification after save:", verify);
}

export async function getElevenLabsApiKey(): Promise<string | null> {
  const { store } = await getStoreAndStronghold();
  if (!store) return null;
  const data = await store.get(KEY);
  console.log("Retrieved data from stronghold:", data);
  if (!data) return null;
  return new TextDecoder().decode(new Uint8Array(data as number[]));
}

export async function clearElevenLabsApiKey() {
  const { store, stronghold } = await getStoreAndStronghold();
  if (!store || !stronghold) return;
  await store.remove(KEY);
  await stronghold.save();
}

export async function hasSecureStore(): Promise<boolean> {
  const stronghold = await ensureStronghold();
  return Boolean(stronghold);
}
