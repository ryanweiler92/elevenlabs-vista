import { create } from "zustand";
import { invoke, Channel } from "@tauri-apps/api/core";

interface VoiceSettings {
  use_speaker_boost: boolean;
  stability: number;
  similarity_boost: number;
  style: number;
  speed: number;
}

interface TTSRequest {
  voice_id: string;
  text: string;
  model_id: string;
  seed?: number;
  previous_text?: string;
  previous_request_ids?: string[];
  next_text?: string;
  next_request_ids?: string[];
  download_directory: string;
  voice_settings: VoiceSettings;
}

interface TTSState {
  requestData: TTSRequest | null;
  setRequestData: (data: TTSRequest) => void;
}

export const useTTSStore = create<TTSState>((set) => ({
  requestData: null,
  setRequestData: (data: TTSRequest) => set({ requestData: data }),
}));

const sampleRequestData: TTSRequest = {
  voice_id: "YHTchmypGq9MvgpLhywi",
  text: "This is a test of the emergency broadcast system.",
  model_id: "eleven_flash_v2_5",
  download_directory: "/Users/ryanweiler/Desktop/data",
  voice_settings: {
    use_speaker_boost: true,
    stability: 0.5,
    similarity_boost: 0.7,
    style: 0.0,
    speed: 1.0,
  },
};

export async function sendSampleTTSRequest() {
  const channel = new Channel<number[]>();
  const mediaSource = new MediaSource();
  const audioElement = new Audio();
  audioElement.src = URL.createObjectURL(mediaSource);

  const queue: Uint8Array[] = [];
  let sourceBuffer: SourceBuffer | null = null;
  let streamEnded = false;

  mediaSource.addEventListener("sourceopen", () => {
    console.log("MediaSource opened");
    sourceBuffer = mediaSource.addSourceBuffer("audio/mpeg");

    sourceBuffer.addEventListener("updateend", () => {
      if (queue.length > 0 && !sourceBuffer!.updating) {
        try {
          //@ts-ignore
          sourceBuffer!.appendBuffer(queue.shift()!);
        } catch (e) {
          console.error("Error appending queued chunk:", e);
        }
      } else if (
        queue.length === 0 &&
        streamEnded &&
        mediaSource.readyState === "open"
      ) {
        try {
          mediaSource.endOfStream();
          console.log("Stream ended");
        } catch (e) {
          console.error("Error ending stream:", e);
        }
      }
    });

    sourceBuffer.addEventListener("error", (e) => {
      console.error("SourceBuffer error:", e);
    });
  });

  mediaSource.addEventListener("sourceended", () => {
    console.log("MediaSource ended");
  });

  let chunkCount = 0;
  let totalBytes = 0;

  channel.onmessage = (chunk: number[]) => {
    chunkCount++;
    totalBytes += chunk.length;

    if (chunkCount % 10 === 0) {
      console.log(`Received chunk ${chunkCount}, total bytes: ${totalBytes}`);
    }

    const buf = new Uint8Array(chunk);

    if (!sourceBuffer || sourceBuffer.updating) {
      queue.push(buf);
    } else {
      try {
        sourceBuffer.appendBuffer(buf);
      } catch (e) {
        console.error("Error appending audio chunk:", e);
        console.error("SourceBuffer state:", {
          updating: sourceBuffer.updating,
          buffered: sourceBuffer.buffered.length,
          mediaSourceState: mediaSource.readyState,
        });
      }
    }
  };

  audioElement.onended = () => {
    console.log("Audio playback ended");
    URL.revokeObjectURL(audioElement.src);
  };

  audioElement.onerror = (e) => {
    console.error("Audio element error:", e);
  };

  audioElement.play().catch((e) => {
    console.error("Failed to start audio playback:", e);
  });

  try {
    console.log("Invoking stream_tts...");
    await invoke("stream_tts", {
      request: sampleRequestData,
      sender: channel,
    });
    console.log("stream_tts completed");
    streamEnded = true;

    //@ts-ignore
    if (
      queue.length === 0 &&
      sourceBuffer &&
      // @ts-ignore
      !sourceBuffer.updating &&
      mediaSource.readyState === "open"
    ) {
      mediaSource.endOfStream();
    }
  } catch (error) {
    console.error("Error invoking stream_tts:", error);
    streamEnded = true;
  }
}
