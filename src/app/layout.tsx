import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/components/app-providers";

export const metadata: Metadata = {
  title: "CodeRunway — From a coding issue to proof",
  description: "A calm, visible path for turning one small coding issue into a change you can read, test, and explain.",
};

const themeBootstrap = `(() => {
  try {
    const saved = window.localStorage.getItem("coderunway-theme");
    const theme = saved === "dark" || saved === "light"
      ? saved
      : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch {}
})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeBootstrap }} /></head>
      <body><AppProviders>{children}</AppProviders></body>
    </html>
  );
}
