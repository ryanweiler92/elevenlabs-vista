import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import {
  loadElevenLabsApiKey,
  saveElevenLabsApiKey,
} from "@/lib/secure-store2";

type SettingsDialogProps = {
  open: boolean;
  onOpenChange: (next: boolean) => void;
};

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [apiKey, setApiKey] = useState("");
  const [show, setShow] = useState(false);
  const lastSaved = useRef<string>("");
  const saveTimer = useRef<number | null>(null);

  // Load stored key when dialog opens
  useEffect(() => {
    if (!open) return;
    // Ensure key is hidden each time dialog opens
    setShow(false);
    (async () => {
      try {
        const existing = (await loadElevenLabsApiKey()) ?? "";
        console.log("Loaded existing API key:", existing);
        setApiKey(existing);
        lastSaved.current = existing;
      } catch (e) {
        // ignore; plugin may be unavailable in web preview
      }
    })();
  }, [open]);

  // Auto-save on change (debounced)
  useEffect(() => {
    if (!open) return;
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(async () => {
      try {
        if (apiKey !== lastSaved.current) {
          await saveElevenLabsApiKey(apiKey);
          lastSaved.current = apiKey;
          if (apiKey) {
            toast.success("API key updated", { duration: 1500 });
          } else {
            toast.info("API key cleared", { duration: 1500 });
          }
        }
      } catch (e) {
        toast.error("Failed to update API key", { duration: 2000 });
      }
    }, 400);
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [apiKey, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your application preferences.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="mt-2">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="env">Environment Variables</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="pt-3">
            <p className="text-sm text-muted-foreground">
              General settings will appear here.
            </p>
          </TabsContent>

          <TabsContent value="env" className="pt-3">
            <div className="space-y-2">
              <Label htmlFor="elevenlabs-api-key">ElevenLabs API Key</Label>
              <InputGroup>
                <InputGroupInput
                  id="elevenlabs-api-key"
                  type={show ? "text" : "password"}
                  placeholder="Enter your ElevenLabs API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  autoComplete="off"
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    aria-label={show ? "Hide API key" : "Show API key"}
                    onClick={() => setShow((s) => !s)}
                    size="icon-sm"
                  >
                    {show ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              <p className="text-xs text-muted-foreground">
                Automatically saved securely when changed.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
