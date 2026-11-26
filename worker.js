/* TempMail proxy — Cloudflare Worker (free tier) — OPTIONAL BACKUP
   =====================================================
   2026-11-26: Worker ab zaroori NAHI raha. Site Vercel par hosted hai
   aur repo mein vercel.json /temptf/* ko https://temp.tf/api/* par
   proxy karta hai (same-origin, CORS bypass) — kuch deploy nahi karna
   parta. Ye Worker sirf backup hai agar site kabhi Vercel ke bajaye
   kahin aur host ho (jahan vercel.json kaam na kare): tab isko deploy
   karke uska URL index.html mein TMP_WORKER_URL mein daalo.
   WHY THIS EXISTS:
   temp.tf aur tempmail.plus ki APIs asli hain aur kaam karti hain,
   lekin wo browser ko CORS headers nahi deti — is liye koi bhi static
   website (GitHub Pages / tumhara domain) unko direct call nahi kar
   sakta. Public CORS proxies bhi unreliable hain (allorigins ne test
   mein 522 / 500 diye). Ye chhota sa Worker beech mein baith kar dono
   APIs ko server-side call karta hai aur CORS * ke saath jawab wapas
   deta hai — phir tumhari site se har call chal jati hai.

   Ye Worker koi mail STORE nahi karta, koi password/key nahi mangta,
   sirf APIs ko forward karta hai. Cloudflare free tier par chalta hai
   (100,000 requests/day free).

   DEPLOY — 2 minute:
   1. https://dash.cloudflare.com kholo — free account banao agar nahi hai.
   2. Left menu: Workers & Pages -> Create -> Create Worker.
   3. Ye poora file copy karke code editor mein paste karo -> Deploy.
   4. Worker ka URL copy karo, jo kuch is tarah hoga:
        https://tempmail-plus-proxy.TUMHARA-NAME.workers.dev
   5. index.html mein TMP_WORKER_URL mein wo URL daalo, GitHub push karo.
      Bas — temp.tf (aur TempMail Plus) live ho jayega. URL khaali ho to
      provider khud skip ho jata hai.

   ENDPOINTS (site yehi call karti hai):
   temp.tf (site: provider 'temp.tf'):
   GET  /temptf/account?dot=1&plus=1       -> {"email": "name+tag@gmail.com"}
   POST /temptf/check  {"email": "..."}    -> {"data": [mails], "totalReceived": N}
   GET  /temptf/attachment?email=...&messageId=...&attachmentId=...
   TempMail Plus (site: provider 'tempmail.plus'):
   GET  /mails?email=a@fexpost.com        -> inbox list
   GET  /mails/<id>?email=a@fexpost.com   -> ek mail ka poora text/html
   DELETE /mails/<id>?email=...           -> mail delete (site use nahi karti) */

const PLUS_UPSTREAM = 'https://tempmail.plus/api';
const TEMPTF_UPSTREAM = 'https://temp.tf/api';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With',
};

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }
    const url = new URL(request.url);
    let upstream, path;
    if (url.pathname.startsWith('/mails')) {
      upstream = PLUS_UPSTREAM;
      path = url.pathname; // /mails, /mails/<id>
    } else if (url.pathname.startsWith('/temptf/')) {
      upstream = TEMPTF_UPSTREAM;
      path = url.pathname.replace(/^\/temptf/, ''); // /temptf/account -> /account
    } else {
      return new Response(JSON.stringify({ error: 'not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...CORS },
      });
    }
    const init = { method: request.method, headers: { Accept: 'application/json' } };
    if (request.method === 'POST') {
      init.headers['Content-Type'] = 'application/json';
      init.body = await request.text();
    }
    const res = await fetch(upstream + path + url.search, init);
    const body = await res.text();
    return new Response(body, {
      status: res.status,
      headers: { 'Content-Type': 'application/json', ...CORS },
    });
  },
};
