import { defineConfig, type Plugin, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import type { IncomingMessage, ServerResponse } from 'http';

/*
 * Vite plugin: serves Vercel Serverless Function handlers from the 'api/'
 * directory during local development ('npm run dev').
 *
 * Any request to '/api/**' is matched to the corresponding 'api/**\/*.ts' file,
 * loaded through Vite's SSR module resolver (TypeScript, path aliases, etc.)
 * and called with a thin Vercel Request/Response shim. Server-side env vars
 * (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DPO_*) are read from '.env' /
 * '.env.local' by Vite and are available via 'process.env' at handler runtime.
 */
function vercelApiFunctions(): Plugin {
  return {
    name: 'vite-vercel-api',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        const url = req.url ?? '';
        if (!url.startsWith('/api/')) return next();

        const pathname = url.split('?')[0];
        const handlerFile = path.resolve(process.cwd(), `.${pathname}.ts`);

        // Buffer the request body before handing it to the handler.
        const rawChunks: Buffer[] = [];
        await new Promise<void>((resolve, reject) => {
          req.on('data', (c: Buffer) => rawChunks.push(c));
          req.on('end', resolve);
          req.on('error', reject);
        });
        const rawBody = Buffer.concat(rawChunks).toString('utf-8');
        const ct = String(req.headers['content-type'] ?? '');
        let parsedBody: unknown = rawBody;
        if (ct.includes('application/json') && rawBody) {
          try { parsedBody = JSON.parse(rawBody); } catch { /* keep as string */ }
        }

        // Parse query string into an object.
        const qs = url.includes('?') ? url.slice(url.indexOf('?') + 1) : '';
        const query = Object.fromEntries(new URLSearchParams(qs));

        // Load the handler module via Vite SSR (handles TypeScript + imports).
        let mod: Record<string, unknown>;
        try {
          mod = await server.ssrLoadModule(handlerFile) as Record<string, unknown>;
        } catch {
          return next(); // no matching handler — fall through to Vite/SPA
        }

        const handler = mod?.default;
        if (typeof handler !== 'function') return next();

        // Thin Vercel Request shim.
        const vReq = {
          method: req.method ?? 'GET',
          headers: req.headers,
          url,
          query,
          body: parsedBody,
          cookies: {},
        };

        // Thin Vercel Response shim with chaining support.
        let sent = false;
        const vRes = {
          statusCode: 200,
          status(code: number) { this.statusCode = code; res.statusCode = code; return this; },
          setHeader(key: string, val: string) { res.setHeader(key, val); return this; },
          getHeader(key: string) { return res.getHeader(key); },
          json(data: unknown) {
            if (sent) return this;
            sent = true;
            res.statusCode = this.statusCode;
            if (!res.getHeader('content-type')) res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
            return this;
          },
          send(data: string | Buffer) {
            if (sent) return this;
            sent = true;
            res.statusCode = this.statusCode;
            res.end(data);
            return this;
          },
          end(data?: string | Buffer) {
            if (sent) return this;
            sent = true;
            res.statusCode = this.statusCode;
            res.end(data);
            return this;
          },
        };

        try {
          await (handler as (req: unknown, res: unknown) => Promise<void>)(vReq, vRes);
        } catch (e) {
          console.error(`[vercel-api] ${pathname}:`, e);
          if (!sent) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }));
          }
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), vercelApiFunctions()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    // Optimize images during build
    minify: 'terser',
    rollupOptions: {
      output: {
        // Chunk splitting for better caching
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'supabase': ['@supabase/supabase-js'],
        },
      },
    },
  },
  server: {
    port: 3000,
  },
  publicDir: 'public',
});