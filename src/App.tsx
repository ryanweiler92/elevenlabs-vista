import { Routes, Route } from "react-router-dom";
import { BrowserRouter } from "react-router-dom";
import { Layout } from "./components/core/layout";
import { VoiceGallery } from "@/components/voice/voice-gallery";

export default function Page() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Nested routes show up inside <Outlet /> in Layout */}

          <Route path="voices" element={<VoiceGallery />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
