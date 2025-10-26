import { useVoiceStore } from "@/stores/voiceStore";
import { VoiceCard } from "@/components/voice/voice-card";

export function VoiceGallery() {
  const voices = useVoiceStore((state) => state.voices);

  if (voices.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center space-y-3">
          <div className="mx-auto h-12 w-12 rounded-full bg-muted animate-pulse" />
          <p className="text-sm text-muted-foreground">Loading voices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-balance">
          Voice Library
        </h2>
        <p className="text-muted-foreground text-balance">
          Browse and preview your collection of voices
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {voices.map((voice) => (
          <VoiceCard key={voice.voice_id} voice={voice} />
        ))}
      </div>
    </div>
  );
}
