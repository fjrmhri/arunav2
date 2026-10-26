// ============================================================
// API ROUTE — POST /api/sync-obsidian
// Server-side: GitHub token tidak expose ke client
// ============================================================

import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { generateDailyNote, generateProgressDashboard } from "@/lib/markdownFormatter";
import { validateSyncPayload } from "@/lib/syncValidation";

// ── GitHub API helpers ─────────────────────────────────────

const GH_TOKEN  = process.env.GITHUB_TOKEN        ?? "";
const GH_REPO   = process.env.GITHUB_OBSIDIAN_REPO ?? ""; // "username/obsidian-vault"
const GH_BRANCH = process.env.GITHUB_OBSIDIAN_BRANCH ?? "main";
const GH_BASE   = `https://api.github.com/repos/${GH_REPO}/contents`;
const SYNC_SECRET    = process.env.SYNC_SECRET ?? "";
const MAX_BODY_BYTES = 256 * 1024;

interface GithubFileResponse {
  sha:  string;
  content: string;
}

async function getFileSha(filePath: string): Promise<string | null> {
  const url = `${GH_BASE}/${filePath}?ref=${GH_BRANCH}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${GH_TOKEN}`,
      Accept:        "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub getFile failed: ${res.status}`);
  const data: GithubFileResponse = await res.json();
  return data.sha;
}

async function putFile(filePath: string, content: string, sha: string | null): Promise<void> {
  const url  = `${GH_BASE}/${filePath}`;
  const body = {
    message: sha
      ? `chore: update ${filePath} [arunav2-sync]`
      : `feat: add ${filePath} [arunav2-sync]`,
    content: Buffer.from(content, "utf-8").toString("base64"),
    branch:  GH_BRANCH,
    ...(sha ? { sha } : {}),
  };

  const res = await fetch(url, {
    method:  "PUT",
    headers: {
      Authorization: `Bearer ${GH_TOKEN}`,
      Accept:        "application/vnd.github+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`GitHub PUT failed [${res.status}]: ${detail}`);
  }
}

async function upsertFile(filePath: string, content: string): Promise<void> {
  const sha = await getFileSha(filePath);
  await putFile(filePath, content, sha);
}

// ── Auth ───────────────────────────────────────────────────

function isAuthorized(req: NextRequest): boolean {
  const header = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${SYNC_SECRET}`;
  const a = Buffer.from(header, "utf-8");
  const b = Buffer.from(expected, "utf-8");
  return a.length === b.length && timingSafeEqual(a, b);
}

// ── Handler ────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Fail closed: tanpa SYNC_SECRET, endpoint tidak bisa dipakai siapa pun
  if (!SYNC_SECRET) {
    return NextResponse.json(
      { error: "Sync dinonaktifkan: SYNC_SECRET belum diset di server." },
      { status: 503 },
    );
  }

  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!GH_TOKEN || !GH_REPO) {
    return NextResponse.json(
      { error: "GITHUB_TOKEN atau GITHUB_OBSIDIAN_REPO belum dikonfigurasi." },
      { status: 503 },
    );
  }

  const contentLength = Number(req.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload terlalu besar" }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const result = validateSyncPayload(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const { logs, progressData, prefs } = result.payload;
  if (logs.length === 0 && !progressData) {
    return NextResponse.json({ synced: 0 });
  }

  const errors: string[] = [];
  let syncedCount = 0;

  // 1. Daily notes
  for (const log of logs) {
    try {
      const note = generateDailyNote(log, prefs);
      await upsertFile(note.filePath, note.content);
      syncedCount++;
    } catch (err) {
      // Detail error GitHub hanya di log server, tidak dikirim ke klien
      console.error(`[sync-obsidian] daily/${log.dateKey}:`, err);
      errors.push(`daily/${log.dateKey}`);
    }
  }

  // 2. Dashboard progress.md
  if (progressData) {
    try {
      const dashboard = generateProgressDashboard(progressData);
      await upsertFile(dashboard.filePath, dashboard.content);
    } catch (err) {
      console.error("[sync-obsidian] dashboard/progress.md:", err);
      errors.push("dashboard/progress.md");
    }
  }

  if (errors.length > 0) {
    const totalTargets = logs.length + (progressData ? 1 : 0);
    return NextResponse.json(
      { synced: syncedCount, failed: errors },
      { status: errors.length === totalTargets ? 502 : 207 },
    );
  }

  return NextResponse.json({ synced: syncedCount });
}
