// ============================================================
// API ROUTE — POST /api/sync-obsidian
// Server-side: GitHub token tidak expose ke client
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import type { CompletionLog, UserPreferences } from "@/types";
import { generateDailyNote, generateProgressDashboard } from "@/lib/markdownFormatter";
import type { ProgressData } from "@/lib/markdownFormatter";

// ── GitHub API helpers ─────────────────────────────────────

const GH_TOKEN  = process.env.GITHUB_TOKEN        ?? "";
const GH_REPO   = process.env.GITHUB_OBSIDIAN_REPO ?? ""; // "username/obsidian-vault"
const GH_BRANCH = process.env.GITHUB_OBSIDIAN_BRANCH ?? "main";
const GH_BASE   = `https://api.github.com/repos/${GH_REPO}/contents`;

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

// ── Request body type ──────────────────────────────────────

interface SyncPayload {
  logs:         CompletionLog[];
  progressData: ProgressData;
  prefs:        UserPreferences;
}

// ── Handler ────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Validasi config
  if (!GH_TOKEN || !GH_REPO) {
    return NextResponse.json(
      { error: "GITHUB_TOKEN atau GITHUB_OBSIDIAN_REPO belum dikonfigurasi." },
      { status: 500 },
    );
  }

  let payload: SyncPayload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { logs, progressData, prefs } = payload;
  if (!logs?.length && !progressData) {
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
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`daily/${log.dateKey}: ${msg}`);
    }
  }

  // 2. Dashboard progress.md
  if (progressData && progressData.last7 && progressData.last30) {
    try {
      const dashboard = generateProgressDashboard(progressData);
      await upsertFile(dashboard.filePath, dashboard.content);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`dashboard/progress.md: ${msg}`);
    }
  }

  if (errors.length > 0) {
    return NextResponse.json(
      { synced: syncedCount, errors },
      { status: errors.length === logs.length ? 500 : 207 },
    );
  }

  return NextResponse.json({ synced: syncedCount });
}
