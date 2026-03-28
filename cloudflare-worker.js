/**
 * ALONE CODE STUDIO v12 — Anthropic CORS Proxy
 * Deploy this as a Cloudflare Worker at: https://workers.cloudflare.com/
 *
 * Step-by-step deploy:
 *   1. Go to https://workers.cloudflare.com/ → Create Worker
 *   2. Paste this entire file, click Deploy
 *   3. Copy your Worker URL (e.g. https://acs-proxy.YOUR-NAME.workers.dev)
 *   4. In app.js, replace ANTHROPIC_URL with your Worker URL (see below)
 */

const ANTHROPIC_ORIGIN = "https://api.anthropic.com";

export default {
  async fetch(request, env) {
    // Handle CORS preflight (OPTIONS)
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(),
      });
    }

    // Only proxy POST requests
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    try {
      const body = await request.text();

      // Forward to Anthropic, injecting the API key from Worker secret (optional)
      const upstreamHeaders = new Headers(request.headers);
      upstreamHeaders.set("Content-Type", "application/json");

      // If you stored your key as a Worker Secret named ANTHROPIC_API_KEY,
      // uncomment the line below — then users don't need to paste a key in-app.
      // upstreamHeaders.set("x-api-key", env.ANTHROPIC_API_KEY);

      const upstream = await fetch(`${ANTHROPIC_ORIGIN}/v1/messages`, {
        method: "POST",
        headers: upstreamHeaders,
        body,
      });

      // Stream the response back with CORS headers
      const response = new Response(upstream.body, {
        status: upstream.status,
        statusText: upstream.statusText,
        headers: {
          ...Object.fromEntries(upstream.headers),
          ...corsHeaders(),
        },
      });

      return response;
    } catch (err) {
      return new Response(JSON.stringify({ error: { message: err.message } }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders() },
      });
    }
  },
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, x-api-key, anthropic-version, anthropic-beta",
  };
}
