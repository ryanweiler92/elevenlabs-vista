"use client";

import { useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";

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

interface VoiceCardProps {
  voice: Voice;
}

export function VoiceCard({ voice }: VoiceCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  return (
    <Card className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <CardHeader className="relative space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-1">
            <CardTitle className="text-xl font-semibold tracking-tight">
              {voice.name}
            </CardTitle>
            <Badge variant="secondary" className="w-fit text-xs font-medium">
              {voice.category}
            </Badge>
          </div>

          <Button
            size="icon"
            variant="outline"
            className="h-12 w-12 shrink-0 rounded-full border-2 transition-all duration-300 hover:scale-105 hover:border-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
            onClick={handlePlayPause}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </Button>
        </div>

        <CardDescription className="line-clamp-2 text-sm leading-relaxed">
          {voice.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="relative space-y-4">
        <div className="flex flex-wrap gap-2">
          {voice.labels.accent && (
            <Badge variant="outline" className="text-xs">
              {voice.labels.accent}
            </Badge>
          )}
          {voice.labels.age && (
            <Badge variant="outline" className="text-xs">
              {voice.labels.age}
            </Badge>
          )}
          {voice.labels.gender && (
            <Badge variant="outline" className="text-xs">
              {voice.labels.gender}
            </Badge>
          )}
        </div>

        {voice.labels.descriptive && (
          <p className="text-xs text-muted-foreground">
            {voice.labels.descriptive}
          </p>
        )}

        {voice.labels.use_case && (
          <div className="rounded-lg bg-muted/50 px-3 py-2">
            <p className="text-xs font-medium text-muted-foreground">
              Best for:{" "}
              <span className="text-foreground">{voice.labels.use_case}</span>
            </p>
          </div>
        )}
      </CardContent>

      <audio
        ref={audioRef}
        src={voice.preview_url}
        onEnded={handleAudioEnded}
        preload="none"
      />
    </Card>
  );
}
