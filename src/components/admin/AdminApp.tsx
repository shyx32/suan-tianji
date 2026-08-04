"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Alert,
  BrandMark,
  Button,
  Card,
  Chip,
  Field,
  Input,
  Select,
} from "../ui";

type Tab = "dashboard" | "readings" | "sessions" | "visits" | "system";

interface Dashboard {
  stats: {
    visits: { today: number; total: number };
    calculated: { today: number; total: number };
  };
  readingsByStatus: Record<string, number>;
  readingsByType: Record<string, number>;
  recentErrors: Array<{
    id: string;
    title: string;
    type: string;
    error_message: string | null;
    created_at: string;
  }>;
  stuckProcessing: number;
  tokens: { in: number; out: number };
  sessions: { total: number; active24h: number };
  system: {
    runtime: string;
    llmMode: string;
    llmModel: string;
    nodeEnv: string;
  };
}

interface ReadingRow {
  id: string;
  sessionId: string;
  type: string;
  status: string;
  title: string;
  errorMessage: string | null;
  model: string | null;
  tokensIn: number | null;
  tokensOut: number | null;
  createdAt: string;
  readyAt: string | null;
  preview: string | null;
}

interface SessionRow {
  id: string;
  createdAt: string;
  lastSeenAt: string;
  readings: number;
  lastIp?: string | null;
  lastUa?: string | null;
  lastPath?: string | null;
  visitCount?: number;
}

interface VisitRow {
  id: string;
  sessionId: string | null;
  createdAt: string;
  ip: string | null;
  userAgent: string | null;
  referer: string | null;
  path: string | null;
  method: string | null;
  acceptLanguage: string | null;
  country: string | null;
}

function uaBrief(ua: string | null | undefined): string {
  if (!ua) return "—";
  if (ua.length <= 48) return ua;
  return `${ua.slice(0, 46)}…`;
}

const STATUS_OPTS = ["all", "pending", "processing", "ready", "error"] as const;
const TYPE_OPTS = ["all", "bazi", "hepan", "naming", "palm"] as const;

export function AdminApp() {
  const [authChecked, setAuthChecked] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const [tab, setTab] = useState<Tab>("dashboard");
  const [dash, setDash] = useState<Dashboard | null>(null);
  const [dashError, setDashError] = useState<string | null>(null);

  const [status, setStatus] = useState<string>("all");
  const [type, setType] = useState<string>("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [readings, setReadings] = useState<ReadingRow[]>([]);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(20);
  const [listError, setListError] = useState<string | null>(null);
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [sessTotal, setSessTotal] = useState(0);
  const [sessPage, setSessPage] = useState(1);

  const [visits, setVisits] = useState<VisitRow[]>([]);
  const [visitTotal, setVisitTotal] = useState(0);
  const [visitPage, setVisitPage] = useState(1);
  const [visitQ, setVisitQ] = useState("");
  const [visitError, setVisitError] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/me", { cache: "no-store" });
      const data = await res.json();
      setAuthed(Boolean(data.authenticated));
    } catch {
      setAuthed(false);
    } finally {
      setAuthChecked(true);
    }
  }, []);

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "登录失败");
      setAuthed(true);
      setPassword("");
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "登录失败");
    } finally {
      setLoggingIn(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
    setDash(null);
    setReadings([]);
    setDetail(null);
  }

  const loadDashboard = useCallback(async () => {
    setDashError(null);
    try {
      const res = await fetch("/api/admin/dashboard", { cache: "no-store" });
      const data = await res.json();
      if (res.status === 401) {
        setAuthed(false);
        return;
      }
      if (!res.ok) throw new Error(data.error || "加载失败");
      setDash(data);
    } catch (err) {
      setDashError(err instanceof Error ? err.message : "加载失败");
    }
  }, []);

  const loadReadings = useCallback(async () => {
    setListError(null);
    try {
      const params = new URLSearchParams({
        status,
        type,
        page: String(page),
        pageSize: String(pageSize),
      });
      if (q.trim()) params.set("q", q.trim());
      const res = await fetch(`/api/admin/readings?${params}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (res.status === 401) {
        setAuthed(false);
        return;
      }
      if (!res.ok) throw new Error(data.error || "加载失败");
      setReadings(data.records || []);
      setTotal(data.total || 0);
    } catch (err) {
      setListError(err instanceof Error ? err.message : "加载失败");
    }
  }, [status, type, page, pageSize, q]);

  const loadSessions = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/admin/sessions?page=${sessPage}&pageSize=20`,
        { cache: "no-store" },
      );
      const data = await res.json();
      if (res.status === 401) {
        setAuthed(false);
        return;
      }
      if (!res.ok) throw new Error(data.error || "加载失败");
      setSessions(data.records || []);
      setSessTotal(data.total || 0);
    } catch {
      /* ignore */
    }
  }, [sessPage]);

  const loadVisits = useCallback(async () => {
    setVisitError(null);
    try {
      const params = new URLSearchParams({
        page: String(visitPage),
        pageSize: "20",
      });
      if (visitQ.trim()) params.set("q", visitQ.trim());
      const res = await fetch(`/api/admin/visits?${params}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (res.status === 401) {
        setAuthed(false);
        return;
      }
      if (!res.ok) throw new Error(data.error || "加载失败");
      setVisits(data.records || []);
      setVisitTotal(data.total || 0);
    } catch (err) {
      setVisitError(err instanceof Error ? err.message : "加载失败");
    }
  }, [visitPage, visitQ]);

  useEffect(() => {
    if (!authed) return;
    if (tab === "dashboard" || tab === "system") void loadDashboard();
    if (tab === "readings") void loadReadings();
    if (tab === "sessions") void loadSessions();
    if (tab === "visits") void loadVisits();
  }, [authed, tab, loadDashboard, loadReadings, loadSessions, loadVisits]);

  async function openDetail(id: string) {
    const res = await fetch(`/api/admin/readings/${id}`, { cache: "no-store" });
    const data = await res.json();
    if (res.ok) setDetail(data.record);
  }

  async function act(id: string, action: string, message?: string) {
    setActionMsg(null);
    const res = await fetch(`/api/admin/readings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, message }),
    });
    const data = await res.json();
    if (!res.ok) {
      setActionMsg(data.error || "操作失败");
      return;
    }
    setActionMsg(
      action === "retry" || action === "requeue" ? "已重新入队" : "已标记失败",
    );
    await loadReadings();
    if (detail && String(detail.id) === id) await openDetail(id);
  }

  async function removeReading(id: string) {
    if (!confirm("确认删除该测算记录？不可恢复。")) return;
    const res = await fetch(`/api/admin/readings/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setActionMsg("删除失败");
      return;
    }
    setDetail(null);
    setActionMsg("已删除");
    await loadReadings();
  }

  async function requeueStuck() {
    const res = await fetch("/api/admin/jobs/requeue-stuck", { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setActionMsg(data.error || "失败");
      return;
    }
    setActionMsg(`已重排队卡住任务 ${data.requeued} 条`);
    await loadDashboard();
    if (tab === "readings") await loadReadings();
  }

  async function removeSession(id: string) {
    if (!confirm("删除会话将级联删除其全部测算记录。确认？")) return;
    const res = await fetch(`/api/admin/sessions/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setActionMsg("删除会话失败");
      return;
    }
    setActionMsg("会话已删除");
    await loadSessions();
  }

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted">
        校验管理员会话…
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-porcelain px-4">
        <Card className="w-full max-w-md">
          <div className="p-6 sm:p-8">
            <div className="mb-1 text-[11px] font-semibold tracking-[0.18em] text-rose">
              管理员
            </div>
            <h1 className="font-song text-xl font-bold text-daiqing">管理员登录</h1>
            <p className="mt-2 text-sm text-muted">
              单管理员账号，无角色分级（无 RBAC）。登录后可管理测算任务与会话。
            </p>
            <form className="mt-6 space-y-4" onSubmit={login}>
              <Field label="管理员密码">
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入 ADMIN_PASSWORD"
                  autoComplete="current-password"
                  autoFocus
                  required
                />
              </Field>
              {loginError ? <Alert>{loginError}</Alert> : null}
              <Button type="submit" className="w-full" disabled={loggingIn}>
                {loggingIn ? "登录中…" : "以管理员身份登录"}
              </Button>
            </form>
            <p className="mt-4 text-center text-xs text-faint">
              <Link href="/" className="font-semibold text-daiqing hover:underline">
                ← 返回前台
              </Link>
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-daiqing/8 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <BrandMark className="h-9 w-9 text-xs">管</BrandMark>
            <div>
              <div className="text-sm font-bold text-daiqing">管理员控制台</div>
              <div className="text-[11px] text-muted">单管理员 · 无 RBAC</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                ["dashboard", "仪表盘"],
                ["readings", "测算任务"],
                ["sessions", "会话"],
                ["visits", "访问记录"],
                ["system", "系统"],
              ] as const
            ).map(([id, label]) => (
              <Chip key={id} active={tab === id} onClick={() => setTab(id)}>
                {label}
              </Chip>
            ))}
            <Link href="/" className="cn-btn-ghost !px-3 !py-2 text-xs">
              前台
            </Link>
            <Button
              type="button"
              variant="secondary"
              className="!px-3 !py-2 text-xs"
              onClick={() => void logout()}
            >
              退出
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {actionMsg ? (
          <div className="mb-4 rounded-xl border border-accent/25 bg-accent/10 px-4 py-2 text-sm text-accent">
            {actionMsg}
          </div>
        ) : null}

        {tab === "dashboard" && (
          <section className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-bold">仪表盘</h2>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" className="!px-3 !py-2 text-xs"
                  onClick={() =>void loadDashboard()}
                >
                  刷新</Button>
                <Button type="button" variant="secondary" className="!px-3 !py-2 text-xs"
                  onClick={() =>void requeueStuck()}
                >
                  重排队卡住任务</Button>
              </div>
            </div>
            {dashError ? (
              <div className="text-sm text-danger">{dashError}</div>
            ) : null}
            {dash ? (
              <>
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <StatCard label="今日访问" value={dash.stats.visits.today} />
                  <StatCard label="总访问" value={dash.stats.visits.total} />
                  <StatCard
                    label="今日测算"
                    value={dash.stats.calculated.today}
                  />
                  <StatCard
                    label="总测算"
                    value={dash.stats.calculated.total}
                  />
                  <StatCard
                    label="排队中"
                    value={dash.readingsByStatus.pending || 0}
                  />
                  <StatCard
                    label="推演中"
                    value={dash.readingsByStatus.processing || 0}
                  />
                  <StatCard
                    label="已完成"
                    value={dash.readingsByStatus.ready || 0}
                  />
                  <StatCard
                    label="失败"
                    value={dash.readingsByStatus.error || 0}
                    danger
                  />
                  <StatCard label="卡住 processing" value={dash.stuckProcessing} />
                  <StatCard label="会话总数" value={dash.sessions.total} />
                  <StatCard label="24h 活跃会话" value={dash.sessions.active24h} />
                  <StatCard
                    label="Token 出"
                    value={dash.tokens.out}
                  />
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="cn-card p-4">
                    <h3 className="text-sm font-bold text-ink">按类型</h3>
                    <ul className="mt-3 space-y-2 text-sm">
                      {Object.entries(dash.readingsByType).map(([k, v]) => (
                        <li
                          key={k}
                          className="flex justify-between border-b border-white/5 py-1.5 text-mist"
                        >
                          <span>{k}</span>
                          <span className="font-mono text-accent">{v}</span>
                        </li>
                      ))}
                      {Object.keys(dash.readingsByType).length === 0 ? (
                        <li className="text-faint">暂无数据</li>
                      ) : null}
                    </ul>
                  </div>
                  <div className="cn-card p-4">
                    <h3 className="text-sm font-bold text-ink">最近失败</h3>
                    <ul className="mt-3 space-y-2">
                      {dash.recentErrors.map((e) => (
                        <li
                          key={e.id}
                          className="rounded-xl border border-danger/15 bg-danger/5 px-3 py-2 text-xs"
                        >
                          <div className="font-semibold text-ink-2">{e.title}</div>
                          <div className="mt-0.5 text-faint">
                            {e.type} · {new Date(e.created_at).toLocaleString()}
                          </div>
                          <div className="mt-1 text-danger">
                            {e.error_message || "—"}
                          </div>
                          <button
                            type="button"
                            className="mt-2 text-accent hover:underline"
                            onClick={() => {
                              setTab("readings");
                              void openDetail(e.id);
                            }}
                          >
                            查看
                          </button>
                        </li>
                      ))}
                      {dash.recentErrors.length === 0 ? (
                        <li className="text-sm text-faint">无失败记录</li>
                      ) : null}
                    </ul>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-mist">加载中…</p>
            )}
          </section>
        )}

        {tab === "readings" && (
          <section className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="text-lg font-bold">测算任务</h2>
              <Button type="button" variant="ghost" className="!px-3 !py-2 text-xs"
                onClick={() =>void loadReadings()}
              >
                刷新</Button>
            </div>
            <Card className="p-0">
            <div className="flex flex-wrap items-end gap-3 p-4">
              <div className="min-w-[9rem]">
                <Field label="状态">
                  <Select
                    value={status}
                    onValueChange={(v) => {
                      setPage(1);
                      setStatus(v);
                    }}
                    options={STATUS_OPTS.map((s) => ({ value: s, label: s }))}
                  />
                </Field>
              </div>
              <div className="min-w-[9rem]">
                <Field label="类型">
                  <Select
                    value={type}
                    onValueChange={(v) => {
                      setPage(1);
                      setType(v);
                    }}
                    options={TYPE_OPTS.map((s) => ({ value: s, label: s }))}
                  />
                </Field>
              </div>
              <div className="min-w-[12rem] flex-1">
                <Field label="搜索">
                  <Input
                    value={q}
                    placeholder="标题 / id / session / 错误"
                    onChange={(e) => setQ(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setPage(1);
                        void loadReadings();
                      }
                    }}
                  />
                </Field>
              </div>
              <Button
                type="button"
                className="!px-4 !py-2.5 text-sm"
                onClick={() => {
                  setPage(1);
                  void loadReadings();
                }}
              >
                查询
              </Button>
            </div>
            </Card>
            {listError ? <Alert>{listError}</Alert> : null}

            <div className="overflow-x-auto rounded-2xl border border-white/8">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-void/60 text-xs text-mist">
                  <tr>
                    <th className="px-3 py-2.5">标题</th>
                    <th className="px-3 py-2.5">类型</th>
                    <th className="px-3 py-2.5">状态</th>
                    <th className="px-3 py-2.5">时间</th>
                    <th className="px-3 py-2.5">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {readings.map((r) => (
                    <tr
                      key={r.id}
                      className="border-t border-white/5 hover:bg-white/[0.02]"
                    >
                      <td className="px-3 py-2.5">
                        <div className="font-medium text-ink-2">{r.title}</div>
                        <div className="font-mono text-[10px] text-faint">
                          {r.id.slice(0, 8)}…
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-mist">{r.type}</td>
                      <td className="px-3 py-2.5">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="px-3 py-2.5 text-xs text-faint">
                        {new Date(r.createdAt).toLocaleString()}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex flex-wrap gap-1">
                          <button
                            type="button"
                            className="text-xs text-accent hover:underline"
                            onClick={() => void openDetail(r.id)}
                          >
                            详情
                          </button>
                          <button
                            type="button"
                            className="text-xs text-star hover:underline"
                            onClick={() => void act(r.id, "retry")}
                          >
                            重试
                          </button>
                          <button
                            type="button"
                            className="text-xs text-danger hover:underline"
                            onClick={() => void removeReading(r.id)}
                          >
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {readings.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-3 py-8 text-center text-faint"
                      >
                        无记录
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between text-sm text-mist">
              <span>
                共 {total} 条 · 第 {page}/{totalPages} 页
              </span>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" className="!px-3 !py-1.5 text-xs"
                  disabled={page <= 1}
                  onClick={() =>setPage((p) => Math.max(1, p - 1))}
                >
                  上一页</Button>
                <Button type="button" variant="ghost" className="!px-3 !py-1.5 text-xs"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  下一页</Button>
              </div>
            </div>

            {detail ? (
              <div className="cn-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="text-[11px] tracking-[0.16em] text-accent">
                      DETAIL
                    </div>
                    <h3 className="text-base font-bold">
                      {String(detail.title)}
                    </h3>
                    <div className="mt-1 font-mono text-[11px] text-faint">
                      {String(detail.id)}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="text-xs text-mist hover:text-ink"
                    onClick={() => setDetail(null)}
                  >
                    关闭
                  </button>
                </div>
                <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                  <Meta k="状态" v={String(detail.status)} />
                  <Meta k="类型" v={String(detail.type)} />
                  <Meta k="会话" v={String(detail.session_id)} />
                  <Meta k="模型" v={String(detail.model || "—")} />
                  <Meta
                    k="错误"
                    v={String(detail.error_message || "—")}
                  />
                  <Meta
                    k="tokens"
                    v={`in ${detail.tokens_in ?? 0} / out ${detail.tokens_out ?? 0}`}
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button type="button" variant="secondary" className="!px-3 !py-2 text-xs"
                    onClick={() =>void act(String(detail.id), "retry")}
                  >
                    重新入队</Button>
                  <Button type="button" variant="ghost" className="!px-3 !py-2 text-xs"
                    onClick={() =>void act(String(detail.id), "error", "管理员标记失败")
                    }
                  >
                    标记失败</Button>
                  <Button type="button" variant="ghost" className="!px-3 !py-2 text-xs text-danger"
                    onClick={() =>void removeReading(String(detail.id))}
                  >
                    删除</Button>
                </div>
                {detail.result_markdown ? (
                  <pre className="mt-4 max-h-80 overflow-auto rounded-xl border border-white/8 bg-void/50 p-3 text-xs leading-relaxed text-mist whitespace-pre-wrap">
                    {String(detail.result_markdown).slice(0, 8000)}
                  </pre>
                ) : null}
                {detail.structure_json ? (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-xs text-accent">
                      查看 structure_json
                    </summary>
                    <pre className="mt-2 max-h-60 overflow-auto rounded-xl border border-white/8 bg-void/50 p-3 text-[11px] text-faint">
                      {JSON.stringify(detail.structure_json, null, 2).slice(
                        0,
                        12000,
                      )}
                    </pre>
                  </details>
                ) : null}
              </div>
            ) : null}
          </section>
        )}

        {tab === "sessions" && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">会话</h2>
              <Button
                type="button"
                variant="ghost"
                className="!px-3 !py-2 text-xs"
                onClick={() => void loadSessions()}
              >
                刷新
              </Button>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-daiqing/10">
              <table className="w-full min-w-[880px] text-left text-sm">
                <thead className="bg-porcelain-muted text-xs text-muted">
                  <tr>
                    <th className="px-3 py-2.5">Session</th>
                    <th className="px-3 py-2.5">IP</th>
                    <th className="px-3 py-2.5">UA</th>
                    <th className="px-3 py-2.5">访问/测算</th>
                    <th className="px-3 py-2.5">最近活跃</th>
                    <th className="px-3 py-2.5">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s) => (
                    <tr key={s.id} className="border-t border-daiqing/8">
                      <td className="px-3 py-2.5 font-mono text-[11px] text-ink-2">
                        <div>{s.id.slice(0, 8)}…</div>
                        <div className="text-faint" title={s.lastPath || ""}>
                          {s.lastPath || "—"}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-xs">
                        {s.lastIp || "—"}
                      </td>
                      <td
                        className="max-w-[14rem] truncate px-3 py-2.5 text-xs text-muted"
                        title={s.lastUa || ""}
                      >
                        {uaBrief(s.lastUa)}
                      </td>
                      <td className="px-3 py-2.5 text-xs">
                        <span className="text-daiqing">{s.visitCount ?? 0}</span>
                        {" / "}
                        <span className="text-accent">{s.readings}</span>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-faint">
                        {new Date(s.lastSeenAt).toLocaleString()}
                      </td>
                      <td className="px-3 py-2.5">
                        <button
                          type="button"
                          className="text-xs text-danger hover:underline"
                          onClick={() => void removeSession(s.id)}
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  ))}
                  {sessions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-8 text-center text-faint">
                        无会话
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between text-sm text-mist">
              <span>共 {sessTotal} 个会话</span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="!px-3 !py-1.5 text-xs"
                  disabled={sessPage <= 1}
                  onClick={() => setSessPage((p) => Math.max(1, p - 1))}
                >
                  上一页
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="!px-3 !py-1.5 text-xs"
                  onClick={() => setSessPage((p) => p + 1)}
                >
                  下一页
                </Button>
              </div>
            </div>
          </section>
        )}

        {tab === "visits" && (
          <section className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">访问记录</h2>
                <p className="mt-0.5 text-xs text-muted">
                  记录 IP、UA、路径、来源、语言、国家等基本信息（前台 ?visit=1 时写入）
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                className="!px-3 !py-2 text-xs"
                onClick={() => void loadVisits()}
              >
                刷新
              </Button>
            </div>

            <Card className="p-0">
              <div className="flex flex-wrap items-end gap-3 p-4">
                <div className="min-w-[14rem] flex-1">
                  <Field label="搜索 IP / UA / 路径 / 来源">
                    <Input
                      value={visitQ}
                      placeholder="例如 127.0.0.1 或 Chrome"
                      onChange={(e) => setVisitQ(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          setVisitPage(1);
                          void loadVisits();
                        }
                      }}
                    />
                  </Field>
                </div>
                <Button
                  type="button"
                  className="!px-4 !py-2.5 text-sm"
                  onClick={() => {
                    setVisitPage(1);
                    void loadVisits();
                  }}
                >
                  查询
                </Button>
              </div>
            </Card>

            {visitError ? <Alert>{visitError}</Alert> : null}

            <div className="overflow-x-auto rounded-2xl border border-daiqing/10">
              <table className="w-full min-w-[960px] text-left text-sm">
                <thead className="bg-porcelain-muted text-xs text-muted">
                  <tr>
                    <th className="px-3 py-2.5">时间</th>
                    <th className="px-3 py-2.5">IP</th>
                    <th className="px-3 py-2.5">国家</th>
                    <th className="px-3 py-2.5">路径</th>
                    <th className="px-3 py-2.5">UA</th>
                    <th className="px-3 py-2.5">来源</th>
                    <th className="px-3 py-2.5">语言</th>
                    <th className="px-3 py-2.5">Session</th>
                  </tr>
                </thead>
                <tbody>
                  {visits.map((v) => (
                    <tr key={v.id} className="border-t border-daiqing/8">
                      <td className="whitespace-nowrap px-3 py-2.5 text-xs text-faint">
                        {new Date(v.createdAt).toLocaleString()}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-xs">
                        {v.ip || "—"}
                      </td>
                      <td className="px-3 py-2.5 text-xs">{v.country || "—"}</td>
                      <td
                        className="max-w-[10rem] truncate px-3 py-2.5 font-mono text-[11px] text-ink-2"
                        title={v.path || ""}
                      >
                        {v.path || "—"}
                      </td>
                      <td
                        className="max-w-[16rem] truncate px-3 py-2.5 text-xs text-muted"
                        title={v.userAgent || ""}
                      >
                        {uaBrief(v.userAgent)}
                      </td>
                      <td
                        className="max-w-[10rem] truncate px-3 py-2.5 text-[11px] text-faint"
                        title={v.referer || ""}
                      >
                        {v.referer || "—"}
                      </td>
                      <td
                        className="max-w-[6rem] truncate px-3 py-2.5 text-[11px] text-faint"
                        title={v.acceptLanguage || ""}
                      >
                        {v.acceptLanguage?.split(",")[0] || "—"}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-[11px] text-faint">
                        {v.sessionId ? `${v.sessionId.slice(0, 8)}…` : "—"}
                      </td>
                    </tr>
                  ))}
                  {visits.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-3 py-8 text-center text-faint">
                        暂无访问记录（打开前台会写入）
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between text-sm text-mist">
              <span>共 {visitTotal} 条</span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="!px-3 !py-1.5 text-xs"
                  disabled={visitPage <= 1}
                  onClick={() => setVisitPage((p) => Math.max(1, p - 1))}
                >
                  上一页
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="!px-3 !py-1.5 text-xs"
                  onClick={() => setVisitPage((p) => p + 1)}
                >
                  下一页
                </Button>
              </div>
            </div>
          </section>
        )}

        {tab === "system" && (
          <section className="space-y-4">
            <h2 className="text-lg font-bold">系统信息</h2>
            {dash ? (
              <div className="cn-card grid gap-3 p-5 sm:grid-cols-2">
                <Meta k="RUNTIME" v={dash.system.runtime} />
                <Meta k="NODE_ENV" v={dash.system.nodeEnv} />
                <Meta k="LLM_MODE" v={dash.system.llmMode} />
                <Meta k="LLM_MODEL" v={dash.system.llmModel || "—"} />
                <Meta k="Tokens in (sum)" v={String(dash.tokens.in)} />
                <Meta k="Tokens out (sum)" v={String(dash.tokens.out)} />
                <div className="sm:col-span-2 mt-2 rounded-xl border border-star/20 bg-star/5 p-3 text-xs leading-relaxed text-mist">
                  <p className="font-semibold text-star">运维说明</p>
                  <ul className="mt-2 list-disc space-y-1 pl-4">
                    <li>
                      管理密码由环境变量 <code className="text-accent">ADMIN_PASSWORD</code>{" "}
                      配置；签名密钥可用 <code className="text-accent">ADMIN_SECRET</code>。
                    </li>
                    <li>
                      「重试」将任务改回 <code>pending</code>，由 worker 再次消费。
                    </li>
                    <li>
                      「卡住 processing」超过 10 分钟可一键重排队。
                    </li>
                    <li>删除会话会级联删除该会话下全部测算（Postgres CASCADE）。</li>
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-mist">加载中…</p>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  danger,
}: {
  label: string;
  value: number;
  danger?: boolean;
}) {
  return (
    <div className="cn-card px-4 py-3">
      <div className="text-[10px] font-semibold tracking-[0.16em] text-faint">
        {label}
      </div>
      <div
        className={`cn-tabular mt-1 text-2xl font-bold ${
          danger ? "text-danger" : "text-accent"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    ready: "border-success/30 bg-success/10 text-success",
    error: "border-danger/30 bg-danger/10 text-danger",
    processing: "border-star/30 bg-star/10 text-star",
    pending: "border-white/10 bg-void/40 text-mist",
  };
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
        map[status] || map.pending
      }`}
    >
      {status}
    </span>
  );
}

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-void/40 px-3 py-2">
      <div className="text-[10px] tracking-[0.12em] text-faint">{k}</div>
      <div className="mt-0.5 break-all text-sm text-ink-2">{v}</div>
    </div>
  );
}
