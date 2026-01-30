# Portfolio

A personal portfolio site with featured projects and little projects sections.

## How to add projects

There are two kinds of projects: **featured projects** (flip cards on the main page) and **little projects** (simple link cards). Each type lives in its own folder and index.

---

### Adding a featured project

1. **Create a folder** under `projects/` with a URL-friendly slug (e.g. `my-new-app`).

2. **Add a `project.json`** inside that folder with:

   | Field | Required | Description |
   |-------|----------|-------------|
   | `title` | Yes | Project name |
   | `description` | Yes | Short description (front of card) |
   | `tag` | Yes | Label, e.g. `"Personal Project"` or `"Infrastructure"` |
   | `backTitle` | Yes | Title on the back of the card (can include emoji) |
   | `backDescription` | Yes | Text on the back of the card |
   | `backLabel` | No | Button-style label on the back (default: `"Learn more"`) |
   | `icon` | No | `"box"` or `"lightning"` (default: `"box"`) |

   Example:

   ```json
   {
     "title": "My App",
     "description": "A short summary of what it does.",
     "tag": "Personal Project",
     "backTitle": "🎯 The Goal",
     "backDescription": "More details when the card is flipped.",
     "backLabel": "Find out more",
     "icon": "box"
   }
   ```

3. **Register the project** by adding its **slug** (the folder name) to `data/projects-index.json`:

   ```json
   ["board-game-tracker", "share-car-charging", "my-new-app"]
   ```

   Order in the array is the order projects appear on the page.

---

### Adding a little project

1. **Create a folder** under `little-projects/` with a URL-friendly slug (e.g. `plunder-helper`).

2. **Add a `project.json`** inside that folder with:

   | Field | Required | Description |
   |-------|----------|-------------|
   | `title` | Yes | Project name |
   | `description` | Yes | Short description |
   | `url` | Yes | Full URL to the live site (opens in new tab) |

   Example:

   ```json
   {
     "title": "Plunder Helper",
     "description": "A companion tool for the board game Plunder",
     "url": "https://plunder.joss.ing"
   }
   ```

3. **Register the project** by adding its **slug** to `data/little-projects-index.json`:

   ```json
   ["plunder-helper", "my-little-tool"]
   ```

   Order in the array is the order projects appear on the page.

---

## Summary

| Type | Folder | Index file |
|------|--------|------------|
| Featured project | `projects/{slug}/project.json` | `data/projects-index.json` |
| Little project | `little-projects/{slug}/project.json` | `data/little-projects-index.json` |

Always add the new **slug** (folder name) to the right index file, or the project won’t show up.
