import { useEffect } from "react";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";
import { fetchAndStoreUserData } from "@stores/userStore";

export function Layout() {
  useEffect(() => {
    fetchAndStoreUserData();
  }, []);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Navbar />
      <main className="flex-1 overflow-auto">
        {" "}
        <div className="p-6">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-2xl font-bold">Welcome to ElevenLabs Vista</h2>
            <p className="mt-2 text-muted-foreground">
              Your application content goes here.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
