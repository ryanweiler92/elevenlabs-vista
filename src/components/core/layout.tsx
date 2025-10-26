import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";
import { fetchAndStoreUserData } from "@stores/userStore";
import { fetchAndStoreVoices } from "@/stores/voiceStore";

export function Layout() {
  useEffect(() => {
    fetchAndStoreUserData();
    fetchAndStoreVoices();
  }, []);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Navbar />
      <main className="flex-1 overflow-auto">
        {" "}
        <div className="p-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
