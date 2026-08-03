# 妙算天机 · 云机一测

公益向 AI 命理文化娱乐站：生辰八字详批、双盘合参、宝宝取名、手相观掌、今日通书/签文、会话历史与统计。

## 架构要点

- **业务库仅 Postgres**（禁止 SQLite / D1 / Turso）
- **本地 / Docker**：Next.js + Postgres + MinIO + worker 轮询 `pending` 任务
- **Cloudflare 生产目标**：OpenNext Workers + Hyperdrive(Postgres) + R2 + KV + Queues（见 `wrangler.toml` 与 `src/adapters/cloudflare`）
- **算法与 I/O 解耦**：`domain/*` 纯函数；`ports` + `adapters/node|cloudflare`
- **LLM**：默认 `LLM_MODE=test` 本地确定性详批（无需 API Key）；可切真实 OpenAI 兼容接口

## 项目路径

```text
/Users/s/Documents/workspace/suan-tianji
```

请在本目录内执行 Docker / 测试命令（不要在 workspace 根目录）。

## 一键 Docker 验收

```bash
cd /Users/s/Documents/workspace/suan-tianji
docker compose up --build -d
# 健康检查
curl -s http://localhost:3000/api/health
# 单测
npm test   # 或: ./node_modules/.bin/vitest run
```

> 本地 Compose 走 **HTTP**，会话 Cookie **不会** 带 `Secure`（见 `COOKIE_SECURE` / `APP_URL`）。  
> 生产 HTTPS 请设 `COOKIE_SECURE=true` 或 `APP_URL=https://...`。

服务：

| 服务 | 端口 |
|---|---|
| web | 3000 |
| postgres | 5432 |
| minio | 9000 / console 9001 |
| worker | （后台消费 pending 报告） |

## 本地开发（可选）

```bash
cd /Users/s/Documents/workspace/suan-tianji
# 仅基础设施
docker compose up -d db minio minio-init
cp .env.example .env
npm install   # 或 pnpm install
npm run db:migrate
npm run dev       # 终端 1
npm run worker    # 终端 2
npm test
```

## 管理员登录（无 RBAC）

- 地址：http://localhost:3000/admin
- **单管理员**：仅密码登录，不设角色/权限分级
- 默认密码：`ADMIN_PASSWORD`（Compose 默认 `admin123`，生产务必修改）
- 能力：仪表盘、全站测算列表/筛选/详情、重试入队、标记失败、删除、卡住任务重排队、会话列表与级联删除、系统信息

## 主要 API

- `POST /api/bazi` — 同步命盘 + 异步详批
- `POST /api/hepan` — 合盘
- `POST /api/naming` — 取名
- `POST /api/palm` — 手相 multipart
- `GET/DELETE /api/history` — 会话历史
- `GET /api/stats` — 访问/测算统计
- `GET /api/almanac` — 通书与签文
- `GET /api/health` — 健康检查
- `POST /api/admin/login|logout` · `GET /api/admin/me|dashboard` · `GET/PATCH/DELETE /api/admin/readings…` · 会话管理

会话 Cookie：`ai_fortune_sid`（HttpOnly）。  
管理 Cookie：`suan_admin_sid`（HttpOnly，HMAC 签名）。

## 免责

仅供文化娱乐参考，不构成医疗、投资、婚恋、法律等专业建议。
