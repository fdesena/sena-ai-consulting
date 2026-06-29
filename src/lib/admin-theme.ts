import { useEffect, useState } from "react";

// Light/dark theme for the admin panel only. Stored in localStorage and applied
// by toggling the `.dark` class on <html> from the authenticated shell.
// Default is light (admins found the dark panel too dark).

export type AdminTheme = "light" | "dark";

const KEY = "sena-admin-theme";
const EVENT = "sena-admin-theme-change";

export function getAdminTheme(): AdminTheme {
  if (typeof window === "undefined") return "light";
  return localStorage.getItem(KEY) === "dark" ? "dark" : "light";
}

export function setAdminTheme(theme: AdminTheme) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, theme);
  window.dispatchEvent(new CustomEvent(EVENT));
}

// Reactive accessor. Re-renders when the theme changes anywhere (same tab via the
// custom event, other tabs via the storage event).
export function useAdminTheme(): [AdminTheme, (t: AdminTheme) => void] {
  const [theme, setTheme] = useState<AdminTheme>("light");

  useEffect(() => {
    setTheme(getAdminTheme());
    const sync = () => setTheme(getAdminTheme());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return [theme, setAdminTheme];
}
