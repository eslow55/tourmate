import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./", // Asegura que los archivos se busquen de forma relativa
  build: {
    outDir: "dist", // Confirma que la carpeta de salida sea dist
  },
});
