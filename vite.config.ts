import { crx, defineManifest } from "@crxjs/vite-plugin";
import { defineConfig } from "vite";

const manifest = defineManifest({
  manifest_version: 3,
  name: "Tab Memorizer",
  description: "This extension memorizes your tabs and returns them immediately.",
  icons: {
    128: "icons/icon-128.png",
  },
  version: "1.0.0",

  permissions: ["storage", "tabs", "history", "scripting"],

  action: {
    default_icon: "icons/icon-128.png",
    default_title: "Tab Memorizer",
    default_popup: "src/popup/index.html",
  },

  options_ui: {
    page: "src/page/index.html",
    open_in_tab: true,
  },

  background: {
    service_worker: "src/background/script.ts",
  },
});

export default defineConfig({
  plugins: [crx({ manifest })],
});
