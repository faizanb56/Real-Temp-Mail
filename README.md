# Real-Temp-Mail
GENERATE TEMP MAIL FOR VERIFICATION

## Fixed version — same `index.html`, same look, updated in place

Old problem: the old `index.html` used only `api.mail.tm`, kept the account/token
in JS memory only (lost on refresh), and used a fixed password. Mails disappeared
on refresh and there was no login, save, OTP copy, custom address, or themes.

What this update fixes (all inside the same `index.html`, same dark `#050505`
Outfit / sky-glow look, same `REAL TEMP MAIL` header):
- **Real multi-API with auto-fallback:** Mail.tm → GuerrillaMail → TempMail Plus
  (needs Worker URL, see below) → 1SecMail → Mail.gw last (currently down).
  If one provider fails, the next one is tried automatically. Provider name and
  last-check time are shown under the email box.
- **Session save:** mailboxes, messages and saved emails are saved in the browser
  (localStorage, per logged-in user), so refresh keeps your inbox. Auto-refresh
  every 5 seconds, plus a manual Refresh button.
- **Login / Register (first screen):** glass-card UI with animated gradient orbs.
  Login: Email/Username + Password + math captcha. Register: Name, Email,
  Username, Password + math captcha — after registering, the login page shows.
  Passwords are stored hashed (SHA-256). **7-day auto-login**, then re-login.
  Logout button in the top bar.
- **Copy / New / Custom:** copy the address, make a new mailbox, or type a custom
  local part.
- **Copy OTP:** 4–8 digit OTPs are auto-detected in mails and shown with a
  Copy OTP button in the mail view.
- **Saved + Recents:** Saved emails button (favorite addresses), and Recents shows your last 5 mailboxes
  with provider and date — Open / Copy from there.
- **6 themes:** Sky Blue, Emerald, Crimson Red, Violet, Amber Gold, Rose Pink.
  Theme choice is saved.

## Fixed 2026-11-05 — Refresh fail + Custom domain selection
- **Refresh fix:** two real bugs were found. (1) On reload, saved messages were
  loaded into the mailbox object but never into the inbox list, so the inbox
  looked empty. (2) Mail.tm / Mail.gw tokens expire, and a 401 used to fail
  Refresh silently forever. Now saved messages are restored on load, and on
  401 the app re-authenticates with the saved address+password and retries
  once. Failed refreshes now show the real reason in the status line and keep
  your saved mails visible instead of wiping them. All API calls now have a
  12-second timeout.
- **Custom domain selection:** the Custom button now opens a box with a name
  field and a domain dropdown. Domains are loaded live from Mail.tm and
  Mail.gw, plus 1SecMail and GuerrillaMail domains, each labelled with its
  provider, with a live `name@domain` preview. 1SecMail addresses are used
  directly; GuerrillaMail supports custom names via `set_email_user`.
Open `index.html` in a browser (or host it on GitHub Pages / your domain).
Register once, log in, then create a mailbox.

## Added 2026-11-19 — TempMail Plus (tempmail.plus) via Cloudflare Worker
- **5th provider — TempMail Plus:** 9 domains (mailto.plus, fexpost.com,
  fexbox.org, mailbox.in.ua, rover.info, chitthi.in, fextemp.com, any.pink,
  merepost.com). Real inbox + read-mail, same as the other providers.
  No account creation needed on tempmail.plus — the address itself works.
- **Why a Worker:** tempmail.plus sends NO CORS headers (preflight returns
  405), so a browser page cannot call it directly, and public CORS proxies
  are unreliable (allorigins returned 522/500 in testing). The included
  `worker.js` is a ~30-line Cloudflare Worker (free tier) that forwards
  `tempmail.plus/api/mails` with `Access-Control-Allow-Origin: *`. Deploy it
  once (2 minutes — steps in the `worker.js` header), paste its URL into
  `TMP_WORKER_URL` in `index.html`, and TempMail Plus goes live. Until the
  URL is set, the provider is skipped automatically — the other 4 providers
  keep working, and its domains stay hidden from the Custom dropdown.
- **GuerrillaMail (mehmetkahya0/temp-mail repo):** already in the site —
  real mail + inbox, custom names supported via `set_email_user`. That
  repo's domain-guard code was NOT copied (it blanks the page on any host
  other than its own GitHub Pages).
- **BotolMehedi/Tempmail-Cloudflare (AHCM Mail):** not an API — a full
  self-hosted system (Cloudflare Pages + Workers + D1 + Email Routing +
  your own domain). It cannot be "added" to this static file; deploying it
  is a separate project (own Cloudflare account, own domain with Email
  Routing, D1 database). If you want your own mail-receiving backend with
  your own domains, that repo is the way — ask and it can be set up.

## Added 2026-11-26 — temp.tf (6th provider, ONLY active one for now)
- **temp.tf — ONLY provider (TEMPTF_ONLY = true in `index.html`):** all other
  providers (Mail.tm, GuerrillaMail, 1SecMail, Mail.gw, TempMail Plus) are
  TEMPORARILY disabled — their code is untouched, only the creation chain
  and the Custom domain dropdown skip them. Set `TEMPTF_ONLY = false` to
  bring them all back.
- **How temp.tf works:** `GET /account` gives a random address, `POST /check`
  returns the inbox with full body. Addresses are NOT `@temp.tf` — they are
  Gmail/Outlook/Hotmail plus/dot aliases (e.g. `name+tag@gmail.com`) or random
  `@high.edu.pl` addresses. OTPs arrive on that alias. Custom names are not
  supported — New and Custom both create a random address. API validated live
  via curl (account + empty-inbox check both 200; service reports 8M+ mails).
- **Same Worker, extended:** `worker.js` now also forwards `/temptf/*` to
  `https://temp.tf/api/*` (temp.tf sends NO CORS headers either — preflight
  204 without `Access-Control-Allow-Origin`). Same day superseded by the
  Vercel rewrite below (no Worker deployment needed anymore); the Worker
  stays in the repo as a backup only.

## Added 2026-11-26 (same day) — Vercel proxy: Worker ki zaroorat khatam
- **CORS bypass without any deployment:** dono domains (tempmail.faizansuper1.tech
  aur realtempmail.vercel.app) Vercel par hosted hain — GitHub Pages par nahi.
  Repo mein `vercel.json` add kar diya: `/temptf/*` → `https://temp.tf/api/*`
  (Vercel edge rewrite, server-side). Site temp.tf ko apne hi origin se call
  karti hai, is liye browser ko CORS ka sawal hi nahi aata. Faizan ko kuch
  deploy nahi karna — GitHub push karte hi Vercel khud redeploy kar deta hai.
- **`tmpBase()`:** `TMP_WORKER_URL` set ho to Worker use hota hai (backup),
  warna `''` (same-origin Vercel rewrite). TempMail Plus ab bhi Worker-only
  hai (uske liye koi rewrite nahi) — wo `TEMPTF_ONLY` ki wajah se waise bhi
  band hai.
- **Live verified:** push ke baad dono domains par `/temptf/account` aur
  `/temptf/check` curl se test kiye — random address bana aur inbox check
  hua. Note: `/check` sirf temp.tf se issue hui address par 200 deta hai;
  kisi random/unissued address par 404, aur fake `@temp.tf` address par 403
  aata hai — is liye site hamesha `tfCreate()` se issue hui address hi use
  karti hai. Purani saved mailbox agar temp.tf bhool jaye to Refresh par
  `Mail HTTP 404` aayega — tab New dabana hoga. (2026-11-26 update: proxy
  path `/temptf/*` se `/api/*` rename kar diya — neeche dekho.)

## Added 2026-11-26 (same day) — Custom domain + style, delete, save, provider hidden
- **Custom mein domain selection:** Custom modal mein ab 4 domains select
  hoti hain — Gmail, Outlook, Hotmail, high.edu.pl. Gmail select karne par
  ek "Address style" dropdown bhi poochta hai: Plus alias (name+tag@),
  Dot variant (n.a.m.e@) ya Random. Outlook/Hotmail/edu sirf plus-alias
  dete hain, is liye un par style nahi poochta. Custom name temp.tf par
  nahi chalta — address hamesha random banta hai, is liye name field
  temp.tf ke liye chhupa diya gaya hai. (API combos curl se verify kiye:
  gmail dot-only → dotted address, plus-only → +tag, outlook/hotmail →
  +tag, edu → random local.)
- **Delete option:** Saved Emails mein har saved email row par ✕ button
  (sirf favorites list se hatata hai). Recents mein har mailbox row par
  Delete button; current mailbox delete ho to agle recent par switch hota
  hai, koi mailbox na bache to khali state ("No mailbox — New dabao").
- **Save email (favorites):** Action row ka **Save email** button current
  email address ko Saved Emails mein save karta hai (max 10, dobara dabao
  to unsave, label "Saved ✓" ho jata hai). Saved Emails se user jab chahe
  wahi address dobara khol sakta hai (Open button — Recents mein ho to
  switch, warna naya mailbox entry bana kar inbox check hota hai), Copy
  kar sakta hai, ya ✕ se delete kar sakta hai. Mail MESSAGES save nahi
  hote — sirf email address save hota hai (user favorite email).
- **Provider naam hidden (private):** screen par kahin bhi "temp.tf" nahi
  dikhta — provider label, Custom dropdown, notes, alerts, status errors
  aur Recents mein address ka domain dikhta hai (gmail.com waghera).
  Internal provider value `temp.tf` hi hai (fetch logic ke liye), aur
  network path bhi neutral kar diya: `/temptf/*` → `/api/*` (vercel.json
  rewrite + worker.js dono). Code comments aur server config (vercel.json
  destination, worker.js upstream) mein naam rehta hai — browser ko call
  ke liye asal address chahiye hota hai, is liye source se poori tarah
  hatana mumkin nahi.

## Added 2026-11-26 (same day) — Saved emails max 10 + disclaimer ticker
- **Saved emails max 10:** Saved Emails mein sirf 10 email addresses save
  ho sakte hain (counter "Saved (n/10)" dikhta hai). 11th save karne par
  alert aata hai — pehle koi saved email delete karo. Saved emails tab tak
  rehte hain jab tak user khud delete na kare (localStorage mein save hote
  hain, per logged-in user; delete ✕ button Saved Emails view mein hai).
  (2026-11-27 correction: pehle Saved mein mail MESSAGES save hote the —
  ab sirf email ADDRESSES save hote hain, kyunki user ko favorite email
  chahiye tha, mail nahi. Purani saved messages load par drop ho jati
  hain.)
- **Disclaimer ticker:** site ka slogan "Temp mail. Zero spam. Full privacy."
  (header mein title ke neeche, "Developed By ~~ Faizan Bashir 056" line ki
  jagah) aur uske neeche ek red scrolling line (marquee) chalti hai — 👑 کنگ فیضان بشیر (Noto
  Nastaliq Urdu font) + "King Faizan Bashir" + "Developer Mr Faizan Bashir" +
  ڈیویلپر مسٹر فیضان بشیر (Urdu mein bhi). Disclaimer hata diya gaya hai.
  Hover karne par ticker ruk jata hai.

## Added 2026-11-27 — Save email button, random domain, back ✕
- **Save email button (action row):** Email box ke neeche wale buttons
  (Custom / Refresh / Saved / Recents) mein **Save email** button hai —
  current email address ko Saved Emails (favorites) mein daal deta hai
  (max 10, delete karne tak rehta hai). Dobara dabao to unsave; label
  'Saved ✓' ho jata hai jab current email saved ho. Saved Emails se Open
  dabao to wahi address dobara khul jata hai. (Mail messages save nahi
  hote — card aur modal wale Save buttons hata diye gaye.)
- **New = random domain:** New dabane par Gmail / Outlook / Hotmail /
  high.edu.pl mein se EK provider random pick hota hai (dot sirf Gmail
  ke liye, baaki plus-only). Pehle provider param nahi bheja jata tha,
  ab ek random provider select hota hai.
- **1SecMail band:** temp.tf-only mode mein 1SecMail pehle se band hai —
  creation chain mein sirf temp.tf hai, Custom dropdown mein sirf 4
  temp.tf domains hain. Is ke liye koi code change nahi chahiye tha.
- **Back / close ✕:** Saved Emails view mein title ke paas ✕ button hai —
  dabao to Inbox wapas aa jata hai (pehle wapas jaane ka koi rasta nahi
  tha). Recents list ke header mein ✕ hai — dabao to list band ho jati
  hai. Custom modal mein neeche **← Back** button bhi hai (aur upar wala ✕
  ab zyada saaf dikhta hai). Mail modal mein ✕ pehle se tha.
- **Copy button (New se opar):** Email address copy karne ke liye New
  button ke upar ek bara **Copy** button bhi hai (input ke andar wala
  chhota copy icon bhi waisa ka waisa hai).

## Honest limit
This is a static single-file site, so login data and saved mails live in that
browser only. The same username/password on another mobile will show the saved
mails only if that mobile opens the server version of this app (the full-stack
TempMail PRO build). For true cross-device sync, run the server-backed version.
