export type ReadingType = "bazi" | "hepan" | "naming" | "palm";
export type ReadingStatus = "pending" | "processing" | "ready" | "error";

export interface SessionRow {
  id: string;
  created_at: Date;
  last_seen_at: Date;
  ua_hash: string | null;
  ip_hash: string | null;
  last_ip?: string | null;
  last_ua?: string | null;
  last_path?: string | null;
  visit_count?: number;
}

export interface ReadingRow {
  id: string;
  session_id: string;
  type: ReadingType;
  status: ReadingStatus;
  title: string;
  input_json: unknown;
  structure_json: unknown | null;
  result_markdown: string | null;
  image_key: string | null;
  error_message: string | null;
  model: string | null;
  tokens_in: number | null;
  tokens_out: number | null;
  created_at: Date;
  ready_at: Date | null;
}

export interface ReadingSummary {
  id: string;
  type: ReadingType;
  title: string;
  status: ReadingStatus;
  createdAt: string;
  preview: string | null;
  imagePath: string | null;
}

export interface StatsSnapshot {
  visits: { today: number; total: number };
  calculated: { today: number; total: number };
}

export interface CreateReadingInput {
  id: string;
  sessionId: string;
  type: ReadingType;
  title: string;
  input: unknown;
  structure: unknown | null;
  status?: ReadingStatus;
  imageKey?: string | null;
}

export interface LlmGenerateInput {
  kind: ReadingType;
  title: string;
  structure: unknown;
  focus?: string[];
  note?: string;
}

export interface LlmGenerateResult {
  markdown: string;
  model: string;
  tokensIn?: number;
  tokensOut?: number;
}
