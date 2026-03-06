# Deploy π Numera to Vercel

Follow these steps to put your site on Vercel so anyone can open it with a permanent link.

---

## 1. Push your code to GitHub

If you haven’t already:

```bash
cd /Users/amoghjain/numera-fbla
git add -A
git commit -m "Prepare for Vercel deploy"
git push Numera main
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
5. **Environment variables**  
   In Vercel: **Project → Settings → Environment Variables**.

   **You only need one variable to deploy:**

   | Variable        | Required to deploy? | Value |
   |-----------------|---------------------|--------|
   | **AUTH_SECRET** | **Yes**             | Random secret (min 32 chars). Generate: `openssl rand -base64 32` or use [generate-secret.vercel.app/32](https://generate-secret.vercel.app/32). |
   | **DATABASE_URL** | No                  | Not required for the build. If you **don’t** set it, the site will deploy and load, but **login and any page that uses the database will error** (the app will try to use a local SQLite file, which doesn’t work on Vercel). To get login and data working, add a database and set this (see step 3). |

   - **AUTH_URL** is optional (the app infers the URL on Vercel).
   - Apply variables to **Production** (and **Preview** if you want them on preview URLs).
6. Click **Deploy**. Wait for the build to finish.
7. When it’s done, Vercel will show a link like:  
   `https://numera-fbla-xxxx.vercel.app`  
   That’s your live site.

---

## 3. (Optional) Add a database so login and data work

If you didn’t set **DATABASE_URL**, the site is live but login and DB-backed pages will error. To fix that, you need a hosted database and to set **DATABASE_URL** in Vercel.

### Get a free DATABASE_URL (Neon – about 2 minutes)

1. Go to **[neon.tech](https://neon.tech)** and sign up (free).
2. Create a new project (name it e.g. `numera`).
3. On the project dashboard, copy the **connection string** (looks like `postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`).
4. In Vercel: **Project → Settings → Environment Variables** → add:
   - **Name:** `DATABASE_URL`
   - **Value:** paste the Neon connection string
   - **Environment:** Production (and Preview if you want)
5. Redeploy (e.g. push a commit or click **Redeploy** in Vercel).

**Note:** This app is currently set up for SQLite. Using Neon (Postgres) as above requires the app to be wired to use Postgres when `DATABASE_URL` is a Postgres URL. If that isn’t done yet, the deploy will still succeed but DB features may fail until Postgres support is added. For “deploy and see the site,” you only need **AUTH_SECRET**; add **DATABASE_URL** when you want login and data.

### Option B: Vercel Postgres

1. In the Vercel dashboard, open your project → **Storage** tab → **Create Database** → **Postgres**.
2. Create and connect it to the project (Vercel may add `POSTGRES_URL`).
3. In **Environment Variables**, set **DATABASE_URL** to the same Postgres connection string (copy from the Storage → your DB → connection string). Same “Postgres wiring” note as above applies.

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
