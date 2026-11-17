# Marichoo Illustrations – notes for Claude

Static portfolio site for the illustrator Marija Knezić Banožić (Marichoo), built with Astro and hosted on Cloudflare (Workers).
See README.md for commands, deployment and where content lives.

## Who works on this

The owner is not a professional web developer. Explain changes in plain language, and say which files changed and why.

## Workflow rules

- Never commit directly to `main`. Create a branch per task (e.g. `feature/new-project`, `fix/mobile-buttons`),
  then commit, push and open a pull request for the owner to review and merge.
- For anything bigger than a small text or style tweak, explain the plan and the files you'd touch before changing them.
- Keep tasks small and focused.
- Don't add new libraries or services without asking first.
- Before handing over, run `npm run build` and check the change in `npm run preview` (http://localhost:4321).

## Project rules

- The design is "Ink & paper": raspberry `#8e1f45` (Marija's line colour) on warm paper `#fffaf7`, coral `#fc5f84`
  only for large type and details, blush/peach/lilac as soft backgrounds. Gloock for headings, Figtree for text.
  Lots of white space; motion is CSS only and must respect reduced motion. Colours and fonts live at the top of
  `src/styles/global.css`; keep new pages consistent with them.
- Project content and the About text are in `src/data/site.json`; homepage, Services and Contact text is listed at the
  top of their page files. Images go in `src/assets/media/` and are referenced as `/media/<file>`.
- No contact form, cookies or third-party scripts; the Content-Security-Policy in `public/_headers` forbids inline scripts.
  The one exception is Cloudflare Web Analytics (cookie-free, enabled in the Cloudflare dashboard), which the CSP allows.
- SEO matters: every page needs a good title and description (see `pageSeo` in `src/lib/content.ts`).
