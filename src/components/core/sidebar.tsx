import { useState } from "react";
import { SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SettingsDialog } from "./settings-dialog";
import { TestButton } from "./test-button";

export function Sidebar() {
  const [openSettings, setOpenSettings] = useState(false);

  return (
    <aside className="flex w-64 flex-col border-r border-border bg-background">
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <li>
            <a
              href="#"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
            >
              Dashboard
            </a>
          </li>
          <li>
            <a
              href="#"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <TestButton />
            </a>
          </li>
        </ul>
      </nav>

      <div className="mt-auto border-t border-border p-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open settings"
          onClick={() => setOpenSettings(true)}
        >
          <SettingsIcon className="size-4" />
        </Button>
      </div>

      <SettingsDialog open={openSettings} onOpenChange={setOpenSettings} />
    </aside>
  );
}
