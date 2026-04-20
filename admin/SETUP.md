# TreeHaus Woodworking — Admin Setup Guide

This site uses **Decap CMS** (free, open source) so Danny can edit products and gallery photos through a friendly web UI — no code, no git, no terminal. Changes publish automatically in ~1 minute.

---

## Part 1 — One-time migration from GitHub Pages to Netlify

Netlify is free and gives us two things GitHub Pages can't: (1) a login system for Danny, and (2) automatic deploys when the CMS saves a change.

### Steps

1. **Sign up for Netlify** at https://app.netlify.com (use your GitHub account — 1 click).

2. **Import the repo**
   - Click **Add new site → Import an existing project**
   - Pick **GitHub**, authorize, then select `Game-Trail-Labs/treehause-website`
   - Build settings: leave everything blank (publish directory: `.`), click **Deploy**
   - Netlify will give you a temporary URL like `https://glowing-boards-abc123.netlify.app` — confirm the site loads.

3. **Point the custom domain at Netlify**
   - In Netlify → **Domain management → Add a domain** → type `treehauswoodworking.com`
   - Netlify will tell you which DNS records to set. Go to your domain registrar (wherever you bought `treehauswoodworking.com`) and either:
     - **Option A (easier):** change nameservers to Netlify's (they give you 4)
     - **Option B:** keep current nameservers, add a CNAME + A record per Netlify's instructions
   - Also in Netlify **Domain management**: turn on **HTTPS** (free, auto-provisioned via Let's Encrypt)
   - Wait ~5–30 min for DNS to propagate.

4. **Remove the GitHub Pages setup** (optional but tidy)
   - Go to the repo → **Settings → Pages** → set source to **None**
   - Delete the `CNAME` file if it's no longer needed (Netlify doesn't use it)

---

## Part 2 — Enable the CMS login

1. **Enable Netlify Identity**
   - In your Netlify site → **Integrations → Identity → Enable Identity**
   - Under **Registration preferences**, set to **Invite only** (so random people can't sign up)
   - Under **Git Gateway**, click **Enable Git Gateway** (this lets the CMS commit to GitHub on Danny's behalf without giving him the GitHub password)

2. **Invite Danny**
   - Identity tab → **Invite users** → enter Danny's email
   - He gets an email with a "set password" link → he clicks it → picks a password → done.

3. **Invite yourself too** (so you can help him if needed).

---

## Part 3 — Danny's workflow

Send Danny this message:

> **How to update the website**
>
> 1. Go to **https://treehauswoodworking.com/admin/**
> 2. Log in with your email + password
> 3. Click **Products** to add, edit, delete, or reorder boards
>    - Click a product to edit it, drag to reorder
>    - Upload a new photo by dragging it into the "Photo" field
>    - Hit **Save** (top right) then **Publish → Publish now**
> 4. Click **Gallery** to manage the homepage photo gallery the same way
> 5. Changes go live in about 60 seconds
>
> **Tips:**
> - Don't change a product's **ID** after publishing (it breaks existing cart links)
> - Recommended photo size: 1200×1200 px or larger, square or landscape
> - If something looks wrong, don't panic — Brandon can roll back any change via GitHub history

---

## Part 4 — How it works (for your reference)

- `products.json` and `gallery.json` hold all product/gallery data
- [index.html](../index.html) has empty `<div>` placeholders; [script.js](../script.js) fetches the JSON and renders cards on page load
- `/admin/` is the Decap CMS UI — just two files: [admin/index.html](index.html) and [admin/config.yml](config.yml)
- When Danny hits "Publish", Decap commits the updated JSON (and any new images) to the `main` branch via Git Gateway → Netlify sees the push → rebuilds the site in ~30 seconds
- No database, no server. Everything is git.

---

## Troubleshooting

**"I can't log in"** — Check that Identity is enabled and Danny accepted the invite email.

**"I uploaded a photo but it's not showing"** — Hit Publish, not just Save. Save only drafts the change.

**"I want to undo a change"** — Go to the GitHub repo → Commits → find the CMS commit → revert it. Or ask Brandon.

**"The site is broken after my edit"** — Most likely a malformed field. Open the repo's **Actions/deploy logs** in Netlify to see the error, or roll back to the previous commit.
