# Real-Temp-Mail
GENERATE TEMP MAIL FOR VERIFICATION

## Fixed version — same `index.html`, same look, updated in place

Old problem: the old `index.html` used only `api.mail.tm`, kept the account/token
in JS memory only (lost on refresh), and used a fixed password. Mails disappeared
on refresh and there was no login, save, OTP copy, custom address, or themes.

What this update fixes (all inside the same `index.html`, same dark `#050505`
Outfit / sky-glow look, same `REAL TEMP MAIL` header):
- **Real multi-API with auto-fallback:** Mail.tm → Mail.gw → GuerrillaMail → 1SecMail.
  If one provider fails, the next one is tried automatically. Provider name and
  last-check time are shown under the email box.
- **Session save:** mailboxes, messages and saved mails are saved in the browser
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
- **Saved + Recents:** Saved mails button, and Recents shows your last 5 mailboxes
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
  directly; GuerrillaMail does not support custom names, so it makes a random
  address instead (the box says so).
Open `index.html` in a browser (or host it on GitHub Pages / your domain).
Register once, log in, then create a mailbox.

## Honest limit
This is a static single-file site, so login data and saved mails live in that
browser only. The same username/password on another mobile will show the saved
mails only if that mobile opens the server version of this app (the full-stack
TempMail PRO build). For true cross-device sync, run the server-backed version.
