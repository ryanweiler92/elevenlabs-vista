import { Button } from "@/components/ui/button";
import { useThemeContext } from "./theme-provider";
import { Moon, Sun } from "lucide-react";

export function Header() {
  const { theme, toggle } = useThemeContext();
  const isDark = theme === "dark";

  return (
    <header className="border-b border-border bg-background">
      <div className="flex h-14 items-center px-6">
        <h1 className="text-lg font-semibold">ElevenLabs Vista</h1>
        <div className="ml-auto">
          <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={toggle}>
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
