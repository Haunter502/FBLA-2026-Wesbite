# Deploy π Numera to Vercel

Follow these steps to put your site on Vercel so anyone can open it with a permanent link.

---

## 1. Push your code to GitHub

If you haven’t already:

```bash
cd /Users/amoghjain/numera-fbla
git add -A
git commit -m "Prepare for Vercel deploy"
git push origin main
```

---

## 2. Deploy with Vercel (one-time setup)

1. **Open:** [https://vercel.com/new](https://vercel.com/new)
2. **Sign in** with GitHub (or create a Vercel account and connect GitHub).
3. **Import your repo**
   - If you see your repo in the list, click **Import** next to it.
   - If not, paste your repo URL, e.g.  
     `https://github.com/amoghjain1/NUMERA_FBLA_NCCC_FINAL`
4. **Project settings** (you can leave most as default):
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** . (leave as is)
   - **Build Command:** `npm run build`
   - **Output Directory:** (leave default)
5. **Environment variables (important)**  
   The app uses a database. For a quick deploy you can leave env vars empty for now; the site will build and you’ll get a URL, but **login and anything that uses the DB will fail** until you add a database (see step 3).
   - If you already have a Postgres or Turso URL, add:
     - `DATABASE_URL` = your database connection URL  
     (Vercel Postgres or Turso; see step 3.)
   - Also add any vars your app needs (e.g. `AUTH_SECRET` for NextAuth).
6. Click **Deploy**. Wait for the build to finish.
7. When it’s done, Vercel will show a link like:  
   `https://numera-fbla-xxxx.vercel.app`  
   That’s your live site.

---

## 3. (Optional) Add a database so login and data work

The app is built to use a database. On Vercel you can’t use a local SQLite file, so you need a hosted database.

### Option A: Vercel Postgres (good if you want everything in Vercel)

1. In the Vercel dashboard, open your project.
2. Go to the **Storage** tab → **Create Database** → **Postgres**.
3. Create the DB and connect it to your project (Vercel will add `POSTGRES_URL` or similar).
4. You’ll need to point the app at Postgres (e.g. set `DATABASE_URL` to the Postgres URL). The codebase has Postgres support in `src/db`; you may need to wire it so production uses that when `DATABASE_URL` is a Postgres URL.

### Option B: Turso (SQLite-compatible, works with current schema)

1. Go to [https://turso.tech](https://turso.tech), sign up, and create a new database.
2. Get your **Database URL** and **Auth Token**.
3. In Vercel: Project → **Settings** → **Environment Variables**:
   - `TURSO_DATABASE_URL` = your Turso database URL  
   - `TURSO_AUTH_TOKEN` = your Turso auth token  
   (The app would need to be updated to use Turso when these are set; see repo docs or ask for help.)

For a first deploy, you can skip the database and just get the site live; add the DB when you’re ready for login and data.

---

## 4. Redeploy after changes

- **If you connected GitHub:** Push to `main` (or your production branch). Vercel will redeploy automatically.
- **From your machine:**  
  ```bash
  npx vercel --prod
  ```  
  (Run this in the project folder after `vercel login` once.)

---

## Quick link (if your repo is public)

**Import this repo into Vercel:**  
[https://vercel.com/new/clone?repository-url=https://github.com/amoghjain1/NUMERA_FBLA_NCCC_FINAL](https://vercel.com/new/clone?repository-url=https://github.com/amoghjain1/NUMERA_FBLA_NCCC_FINAL)

Replace the `repository-url` with your own repo URL if it’s different.
