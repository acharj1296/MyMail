"use client";

import { useEffect } from "react";
import { Toaster } from "sonner";
import { useDemoStore } from "@/stores/demo-store";

function StoreHydrator() {
  useEffect(() => {
    void useDemoStore.persist.rehydrate();
  }, []);
  return null;
}

function ThemeController() {
  const theme = useDemoStore((state) => state.preferences.theme);
  const density = useDemoStore((state) => state.preferences.density);
  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = theme === "dark" || (theme === "system" && media.matches);
      root.classList.toggle("dark", dark);
      root.dataset.theme = dark ? "dark" : "light";
      root.classList.toggle("compact-density", density === "compact");
    };
    apply();
    if (theme === "system") {
      media.addEventListener("change", apply);
      return () => media.removeEventListener("change", apply);
    }
  }, [theme, density]);
  return null;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StoreHydrator />
      <ThemeController />
      {children}
      <Toaster position="top-right" richColors closeButton duration={3600} />
    </>
  );
}
