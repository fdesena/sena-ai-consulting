import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://www.senalabs.tech";

// Apenas URLs canônicas que devem ser indexadas — Google ignora priority/changefreq
// (https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap),
// então o sitemap lista só <loc>. Páginas noindex (termos, privacidade, auth,
// exclusão de dados) ficam de fora de propósito.
const PATHS = [
  "/",
  "/diagnostico",
  "/blog",
  "/blog/automatizar",
  "/blog/agentes",
  "/blog/software",
  "/blog/gap-adocao-ia",
  "/blog/marca-sena-labs",
  "/blog/diagnostico",
  "/ferramentas",
  "/ferramentas/roleta",
  "/ferramentas/temporizador",
  "/ferramentas/gerador-de-documentos",
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const urls = PATHS.map((path) => `  <url>\n    <loc>${BASE_URL}${path}</loc>\n  </url>`);

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
