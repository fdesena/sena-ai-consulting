# CLAUDE.md - Sena Labs Website

## Stack & Tech

- **Framework:** TanStack Start (SSR, not Next.js)
- **Styling:** Tailwind CSS v4 with `md:` breakpoint for responsive
- **Package Manager:** Bun
- **Animation:** Framer-motion + CSS @keyframes
- **Database:** Supabase (blog_posts table for GlobalExperience) — own project, no longer Lovable Cloud
- **Deployment:** Vercel (self-hosted), production domain is `www.senalabs.tech` (migrated from `senaconsulting.app` on 2026-09-09; the old domain 301-redirects to the new one — verify `www.senaconsulting.app` also redirects, it was found still serving live duplicate content). **No longer using Lovable** — GitHub sync + custom domain were disconnected 2026-06-29; GitHub is the sole source of truth (no bidirectional sync to reconcile).
- **Known leftover Lovable coupling:** `@lovable.dev/vite-tanstack-config` is still required for the build (Nitro/Vercel preset, etc). One side effect: images imported via `src/assets/*.asset.json` (`import x from "@/assets/foo.png.asset.json"`, then `x.url`) resolve to `/__l5e/assets-v1/...`, a path only served by that package's dev-only proxy plugin (needs `LOVABLE_PREVIEW_HOST`, which isn't set). **These URLs 404 in production and in local dev.** Don't use the `.asset.json` import pattern for new images — drop a real image file in `src/assets/` and `import img from "@/assets/foo.png"` directly (plain Vite asset import), or put it in `public/` and reference by path.

## Git Workflow & Commit Process

### Before committing:

1. **Always use `/pr-description` skill** to generate PR description from your changes
2. This ensures proper documentation before pushing to GitHub
3. Command: `/pr-description` (skill reads `git diff` and generates structured description)

### Committing strategy:

- Prefer `git revert` over `git reset --hard` for undoing changes
  - **Why:** Safe with Lovable 2-way sync; preserves commit history for debugging
  - Use reset only for uncommitted changes in working directory
- Create descriptive commits with context
- Co-author commits when working with tools/automations

### When syncing from Lovable:

```bash
git fetch origin
git pull origin main  # Bring in Lovable changes
# Then create feature branches for new work
```

### Push & PR flow:

1. Make changes in feature branch
2. Run `/pr-description` skill to generate description
3. Create commit with generated description
4. `git push -u origin <branch-name>`
5. Create PR via `gh pr create` or GitHub UI
6. Merge to main once reviewed

## Key Project Files & Components

### Components

- **`src/components/LandingPage.tsx`** — hero, "A Oportunidade", "Como Posso Ajudar", contact section
- **`src/components/GlobalExperience.tsx`** — marquee carousel with continuous infinite scroll animation
- **`src/components/`** — modular component structure (avoid monolithic files)

### Routes

- **`src/routes/__root.tsx`** — root layout, meta tags, SEO (schema.org JSON-LD)
- **`src/routes/diagnostico.tsx`** — assessment form page (Bussola Digital & IA)
- **`src/routes/sitemap[.]xml.ts`** — dynamic XML sitemap for SEO

### Public Assets

- **`public/robots.txt`** — crawler instructions
- **`public/llms.txt`** — brand description for LLMs
- **`public/`** — static assets (images, icons)

## Development Setup

```bash
cd "sena-ai-consulting"
bun install
bun run dev --port 8080
# Access: http://localhost:8080
```

## Code Conventions

### Responsive Design

- Mobile-first approach with Tailwind
- Use `md:` breakpoint for desktop changes
- Test both mobile and desktop layouts

### Components

- Keep components focused and reusable
- Use Framer-motion for complex animations
- Use CSS @keyframes for simpler, continuous animations (like marquee)
- No unnecessary abstractions — three similar lines is OK

### Commits & Code

- Only add comments when WHY is non-obvious
- Don't reference current task/issue in code (belongs in PR description)
- Delete unused code completely (no `// removed` comments)
- Trust framework/library guarantees; validate only at system boundaries

## Lovable Integration Notes

- Changes from Lovable appear as automatic commits on main
- Always `git fetch` + `git pull` before starting new work
- When Lovable makes changes, they're already in git — just sync locally
- Create feature branches for your enhancements based on latest main
- Use feature branches → PR → merge (keep main as source of truth)

## SEO & Metadata

- All pages must have proper meta tags in route head() function
- Use schema.org JSON-LD for Organization, WebSite, and product metadata
- Update og:url to production domain (www.senalabs.tech)
- Add canonical URLs to prevent duplicate content issues
- Page-specific descriptions improve CTR in search results

## When Things Break

- Server crashes: `bun run dev --port 8080` to restart
- Port in use: Change `--port XXXX` to a different port
- Git conflicts: Check what changed, resolve conflicts, commit with context
- Lovable sync issues: Pull latest changes, check git log for recent commits

## Remember

✅ Always run `/pr-description` before pushing  
✅ Use `git revert` for undoing pushed commits  
✅ Test responsive design (mobile + desktop)  
✅ Sync with Lovable changes regularly  
✅ Keep commits focused and well-described
