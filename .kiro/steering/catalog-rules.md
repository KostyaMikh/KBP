# KBP Catalog Rules

## Adding New Presentations

When adding a new presentation card to `catalog.html`, always insert it as the **first card** in the `#catalogGrid` div — before all existing cards. Never append it at the end of the list.

## Early Access / Coming Soon Labels

- Use `🔓 Early Access` (amber/gold gradient: `#f59e0b` → `#d97706`) for presentations that are accessible but still being worked on.
- Use `⏳ Wkrótce dostępne` for presentations that are not yet available at all.
- The "preview" button on Early Access cards should be labeled **"Preview Presentation"** (not "Watch me working").

## Homepage Announcement

When a new presentation is added (especially with Early Access status), add a visible announcement banner in `index.html` inside `.home-main`, below the `.stats-row`, linking to the catalog.
