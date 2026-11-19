/* TempMail Plus proxy — Cloudflare Worker (free tier)
   =====================================================
   WHY THIS EXISTS:
   tempmail.plus ki API asli hai aur kaam karti hai, lekin wo browser ko
   CORS headers nahi deti (OPTIONS preflight par 405) — is liye koi bhi
   static website (GitHub Pages / tumhara domain) usko direct call nahi
   kar sakta. Public CORS proxies bhi unreliable hain (allorigins ne
   test mein 522 / 500 diye). Ye chhota sa Worker beech mein baith kar
   tempmail.plus ko server-side call karta hai aur CORS * ke saath
   jawab wapas deta hai — phir tumhari site se har call chal jati hai.

   Ye Worker koi mail STORE nahi karta, koi password/key nahi mangta,
   sirf tempmail.plus ko forward karta hai. Cloudflare free tier par
   chalta hai (100,000 requests/day free).

   DEPLOY — 2 minute:
   1. https://dash.cloudflare.com kholo — free account banao agar nahi hai.
   2. Left menu: Workers & Pages -> Create -> Create Worker.
   3. Ye poora file copy karke code editor mein paste karo -> Deploy.
   4. Worker ka URL copy karo, jo kuch is tarah hoga:
        https://tempmail-plus-proxy.TUMHARA-NAME.workers.dev
   5. index.html mein TMP_WORKER_URL mein wo URL daalo, GitHub push karo.
      Bas — TempMail Plus provider live ho jayega (inbox + mail read +
      custom domains). URL khaali ho to provider khud skip ho jata hai.

   ENDPOINTS (site yehi call karti hai):
   GET  /mails?email=a@fexpost.com        -> inbox list
   GET  /mails/<id>?email=a@fexpost.com   -> ek mail ka poora text/html
   DELETE /mails/<id>?email=...           -> mail delete (site use nahi karti) */

const UPSTREAM = 'https://tempmail.plus/api';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With',
};

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/mails')) {
      return new Response(JSON.stringify({ error: 'not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...CORS },
      });
    }
    const res = await fetch(UPSTREAM + url.pathname + url.search, {
      method: request.method,
      headers: { Accept: 'application/json' },
    });
    const body = await res.text();
    return new Response(body, {
      status: res.status,
      headers: { 'Content-Type': 'application/json', ...CORS },
    });
  },
};
