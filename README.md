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

## High scores (Catch the Targets game)

The site has an easter-egg mini game (“Catch the Targets”). It keeps a **top 10** high score list.

### How high scores work

- **Where they appear**  
  When you open the game modal, the “High Scores” list is shown (rank, name, score). It loads when you open the game and updates after you submit a score.

- **When a score is saved**  
  When the round ends (timer hits 0), if your score is in the top 10 (or there are fewer than 10 scores), you get a prompt to enter your name. That score is then added to the list; the list is kept sorted by score and trimmed to the top 10.

- **Where scores are stored**  
  - **No config:** scores are stored in the browser only (**localStorage**). Each device/browser has its own list.  
  - **With Supabase config:** scores are stored in Supabase. All visitors see the same global top 10, and the list is shared across devices.

So: high scores always work out of the box (local list). To have one shared global list for everyone, set up the optional Supabase leaderboard below.

### Setting up the global leaderboard (optional)

To show the **same** top 10 to all visitors, use [Supabase](https://supabase.com) (free tier).

#### 1. Create a Supabase project

1. Sign up at [supabase.com](https://supabase.com) and create a new project.
2. In the dashboard go to **SQL Editor** and run:

```sql
create table if not exists catch_targets_scores (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Player',
  score integer not null check (score >= 0),
  created_at timestamptz default now()
);

alter table catch_targets_scores enable row level security;

create policy "Anyone can read scores"
  on catch_targets_scores for select
  using (true);

create policy "Anyone can insert a score"
  on catch_targets_scores for insert
  with check (true);
```

3. Go to **Settings → API** and copy:
   - **Project URL** (e.g. `https://xxxxxxxx.supabase.co`)
   - **anon public** key

#### 2. Wire it into the site

In `index.html`, set your config (near the bottom, before the other scripts):

```html
<script>
window.LEADERBOARD_CONFIG = {
    supabaseUrl: 'https://YOUR_PROJECT_REF.supabase.co',
    supabaseAnonKey: 'YOUR_ANON_KEY'
};
</script>
```

Replace `YOUR_PROJECT_REF` and `YOUR_ANON_KEY` with the values from the Supabase dashboard. The anon key is safe to use in the browser.

If `LEADERBOARD_CONFIG` is left empty, the game falls back to **localStorage** (scores only on that device/browser).

---

## Summary

| Type | Folder | Index file |
|------|--------|------------|
| Featured project | `projects/{slug}/project.json` | `data/projects-index.json` |
| Little project | `little-projects/{slug}/project.json` | `data/little-projects-index.json` |

Always add the new **slug** (folder name) to the right index file, or the project won’t show up.
