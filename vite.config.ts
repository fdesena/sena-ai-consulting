// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  // Self-hosted on Vercel (no longer a Lovable Cloud deploy). Force Nitro on with
  // the Vercel preset — outside a Lovable build the wrapper's default skips Nitro
  // entirely, which would drop SSR + server routes. Pinning "vercel" makes the
  // local `bun run build` produce the same Build Output API (.vercel/output) that
  // Vercel deploys.
  // maxDuration: o agente do JusRadar (OpenAI + DataJud/jurisprudência) pode levar
  // mais que o timeout padrão da Vercel. 300s exige plano Pro; no Hobby o teto é 60s
  // (a Vercel limita automaticamente, sem quebrar o build).
  // `vercel.functions` não é tipado pelo wrapper, mas o Nitro o repassa ao preset
  // (gera maxDuration no .vc-config.json — verificado no build). Spread evita o
  // excess-property-check do TS sem perder o efeito em runtime.
  nitro: { preset: "vercel", ...({ vercel: { functions: { maxDuration: 300 } } } as object) },
});
