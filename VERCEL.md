# Deploy Trip Ship to Vercel (from your phone)

Every push to GitHub auto-deploys a live preview URL. Edit on mobile → push → refresh the site.

## One-time setup (~2 min)

### 1. Open Vercel on your phone

Go to **[vercel.com/new](https://vercel.com/new)** and sign in with **GitHub**.

### 2. Import the repo

- Tap **Import** next to `Programmusic/tripship`
- If you don't see it, tap **Adjust GitHub App Permissions** and grant access to the repo

### 3. Confirm settings (should auto-fill)

| Setting | Value |
|---------|-------|
| Framework Preset | **Vite** |
| Root Directory | `./` (repo root) |
| Install Command | `npm install --prefix frontend --include=dev` |
| Build Command | `npm run build --prefix frontend` |
| Output Directory | `frontend/dist` |

**Important:** The `--include=dev` flag is required — Vercel sets `NODE_ENV=production` which skips Vite otherwise. Do NOT run `npm install` at repo root.

### 4. Deploy

Tap **Deploy**. First build takes ~1–2 minutes.

You'll get a live URL like `tripship-xxx.vercel.app`.

### 5. Set your working branch (if not on `master`)

In the Vercel project:

1. **Settings → Git**
2. Set **Production Branch** to `cursor/tripship-vue-terraform-807a` (or merge to `master` first)

Every push to that branch redeploys production.

---

## Daily workflow from your phone

1. Edit files in the GitHub mobile app (or Codespaces / Cursor cloud)
2. Commit & push to your branch
3. Vercel builds automatically — check the **Deployments** tab for the new URL
4. Open the live site on your phone to review changes

Preview deployments are also created for other branches and PRs.

---

## What runs live right now

- Full Trip Ship UI with **demo/mock data** (memories, mixes, logged-in DJ)
- No database needed yet — backend (Cloud Functions + Firestore) comes later
- Banner at top says "Design preview"

---

## Troubleshooting

**Build failed?**  
Open the deployment log in Vercel. Most issues are wrong root directory or output path — use values from step 3 above.

**Old version showing?**  
Hard-refresh the browser or open the latest deployment URL from the Vercel dashboard.

**Want a custom domain?**  
Settings → Domains → add your domain (e.g. `tripship.com`).
