import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MOCK_DATA } from "./src/data/mockData.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, "dist");

loadDotEnv();

const PORT = Number.parseInt(process.env.PORT || "3001", 10);
const SUPABASE_URL = (process.env.SUPABASE_URL || "").trim();
const SUPABASE_KEY = (process.env.SUPABASE_KEY || "").trim();
const SUPABASE_TABLE = (process.env.SUPABASE_TABLE || "").trim();
const SUPABASE_SCHEMA = (process.env.SUPABASE_SCHEMA || "public").trim();
const SUPABASE_LIMIT = Number.parseInt(process.env.SUPABASE_LIMIT || "500", 10);
const USE_DEMO_DATA = (process.env.USE_DEMO_DATA || "false").toLowerCase() === "true";

const isConfigured =
  hasRealValue(SUPABASE_URL, ["your-project.supabase.co"]) &&
  hasRealValue(SUPABASE_KEY, ["your-supabase-service-role-or-anon-key"]) &&
  Boolean(SUPABASE_TABLE);

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".png": "image/png",
};

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);

    if (request.method === "GET" && (url.pathname === "/health" || url.pathname === "/api/health")) {
      return sendJson(response, 200, getHealthPayload());
    }

    if (request.method === "GET" && url.pathname === "/api/brand-summaries") {
      const payload = await getBrandSummaries();
      return sendJson(response, 200, payload);
    }

    if (request.method !== "GET") {
      return sendJson(response, 405, { error: "Method not allowed." });
    }

    return serveStaticAsset(url.pathname, response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error.";
    return sendJson(response, 500, { error: message });
  }
});

server.listen(PORT, () => {
  console.log(`Brand Summary Dashboard server running on http://localhost:${PORT}`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
  });
}

async function getBrandSummaries() {
  if (USE_DEMO_DATA) {
    return {
      records: normalizeRecords(MOCK_DATA),
      config: {
        configured: isConfigured,
        source: "demo",
        table: SUPABASE_TABLE || "brand_summaries",
      },
      fetchedAt: new Date().toISOString(),
    };
  }

  if (!isConfigured) {
    return {
      records: [],
      config: {
        configured: false,
        source: "supabase",
        table: SUPABASE_TABLE || "",
      },
      fetchedAt: new Date().toISOString(),
    };
  }

  const endpoint = new URL(`${SUPABASE_URL.replace(/\/$/u, "")}/rest/v1/${SUPABASE_TABLE}`);
  endpoint.searchParams.set("select", "*");
  endpoint.searchParams.set("limit", String(SUPABASE_LIMIT));

  const supabaseResponse = await fetch(endpoint, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Accept-Profile": SUPABASE_SCHEMA,
      "Content-Profile": SUPABASE_SCHEMA,
    },
  });

  if (!supabaseResponse.ok) {
    const errorText = await safeReadText(supabaseResponse);
    throw new Error(`Supabase request failed (${supabaseResponse.status}): ${errorText}`);
  }

  const rows = await supabaseResponse.json();

  if (!Array.isArray(rows)) {
    throw new Error("Supabase returned an unexpected payload.");
  }

  return {
    records: normalizeRecords(rows),
    config: {
      configured: true,
      source: "supabase",
      table: SUPABASE_TABLE,
    },
    fetchedAt: new Date().toISOString(),
  };
}

function normalizeRecords(rows) {
  return rows.map((row, index) => ({
    ...row,
    id: row.id ?? row.ID ?? `row-${index + 1}`,
    Brand: row.Brand ?? row.brand ?? row.brand_name ?? row.name ?? `Brand ${index + 1}`,
    group_id: row.group_id ?? row.groupId ?? row.group ?? "",
    week: row.week ?? row.week_range ?? row.weekRange ?? "Unknown week",
    summary: row.summary ?? row.summaries ?? row.daily_summaries ?? row.dailySummaries ?? [],
  }));
}

async function serveStaticAsset(requestPath, response) {
  const normalizedPath = requestPath === "/" ? "/index.html" : requestPath;
  const safePath = path
    .normalize(normalizedPath)
    .replace(/^(\.\.[/\\])+/, "")
    .replace(/^[/\\]+/, "");
  const filePath = path.join(distDir, safePath);

  try {
    const fileStat = await stat(filePath);
    if (fileStat.isDirectory()) {
      return serveFile(path.join(filePath, "index.html"), response);
    }
    return serveFile(filePath, response);
  } catch {
    if (path.extname(safePath)) {
      return sendJson(response, 404, { error: "Static asset not found." });
    }

    const fallbackPath = path.join(distDir, "index.html");
    return serveFile(fallbackPath, response);
  }
}

async function serveFile(filePath, response) {
  try {
    const file = await readFile(filePath);
    const extension = path.extname(filePath).toLowerCase();
    response.writeHead(200, {
      "Content-Type": MIME_TYPES[extension] || "application/octet-stream",
      "Cache-Control": extension === ".html" ? "no-cache" : "public, max-age=31536000, immutable",
    });
    response.end(file);
  } catch {
    sendJson(response, 404, { error: "Build output not found. Run `npm run build` first." });
  }
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(payload));
}

function getHealthPayload() {
  return {
    ok: true,
    configured: isConfigured,
    source: USE_DEMO_DATA ? "demo" : "supabase",
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  };
}

async function safeReadText(response) {
  try {
    return (await response.text()).trim() || response.statusText;
  } catch {
    return response.statusText;
  }
}

function loadDotEnv() {
  const envPath = path.join(__dirname, ".env");

  try {
    const raw = readFileSync(envPath, "utf8");
    const lines = raw.split(/\r?\n/u);

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex === -1) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/gu, "");

      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  } catch {
    // Missing .env is fine. The app will show setup instructions instead.
  }
}

function hasRealValue(value, placeholders = []) {
  if (!value) {
    return false;
  }

  const normalized = value.trim().toLowerCase();
  return !placeholders.some((placeholder) => normalized === placeholder.toLowerCase());
}
