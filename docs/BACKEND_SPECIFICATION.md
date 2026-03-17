# InsiteAI バックエンド仕様・開発ルール

エンジニア向けのバックエンド仕様と、ブランチ・デプロイ・開発ルールをまとめたドキュメントです。

---

## Part 1: バックエンド仕様（API）

API（`apps/api`）のルート・認証・リクエスト/レスポンス・エラーをコードから抽出した一覧。実装の詳細は各ファイルを、HTTP 例は `apps/api/README.md` を参照。

### 構成

- **エントリ**: `apps/api/src/index.ts` — Hono に logger を付け、`/` に routes をマウント。`AppType` を export してフロントの型付きクライアントに利用。
- **環境** (`apps/api/src/env.ts`): **Bindings**: `DB` (D1), `BUCKET` (R2), `ADMIN_USERNAME`, `ADMIN_PASSWORD`。**Variables**: 各 UseCase（auth, project, apiUsage, analysisHistory, projectInfo, adminSession, session, help, prompt, applicationSetting, instructionGuide）。UseCase は `apps/api/src/libs/hono.ts` で D1 を渡して生成。
- **スキーマの集約**: `apps/api/src/schema.ts` が各ルートの Zod スキーマを re-export。フロント・テストから `api/schema` で参照。

### 認証

- **ユーザー** (`apps/api/src/routes/_factory.ts` の `projectGuard`): Cookie `session` でセッション ID を送り、`sessionUseCase.validateSession` で検証。セッションに `projectId` が無い場合は `getByAuthId` の先頭プロジェクトで補完し `updateSession`。
- **管理** (`apps/api/src/routes/admin/_factory.ts` の `adminGuard`): Cookie `admin-session` で検証。
- **未保護**: `factory`（`libs/hono.ts`）のみを使うルートは認証不要: `POST /login`, `POST /admin/login`。

### ルート一覧

| メソッド | パス | ガード | 概要 |
|----------|------|--------|------|
| POST | /login | なし | Body: `{ id, password }`（loginSchema）。auth 照合・セッション作成。Cookie: session。 |
| POST | /logout | projectGuard | セッション Cookie 削除。 |
| GET | /session | projectGuard | 現在セッション `{ id, authId, expiresAt, projectId }` を返す。 |
| PUT | /session | projectGuard | Body: `{ projectId }`。セッションの projectId を更新。 |
| GET | /project | projectGuard | 現在プロジェクト情報（projectId, name, apiUsageLimit, apiUsageCount）。 |
| POST | /project | projectGuard | Body: name, managerName, ownerName, projectId（createProjectSchema）。projectPass は内部で生成。authId はセッションから。apiUsageLimit は 1000 固定。 |
| DELETE | /project/:projectId | projectGuard | 自 auth のプロジェクトのみ削除可。最後の 1 件は削除不可。 |
| GET | /projects | projectGuard | 自 auth に紐づくプロジェクト一覧 `{ projectId, name }[]`。 |
| GET | /project_info | projectGuard | 現在 projectId のプロジェクト情報（businessType, address, concept 等）。 |
| PUT | /project_info | projectGuard | Body: projectInfoSchema（各フィールド optional）。上書き保存。 |
| POST | /analysis | projectGuard | Query: `type`（下記 13 種）。FormData: file(s), instruction（type により必須/任意）。月次利用上限チェック後、ストリーミングで AI 応答。利用回数加算・履歴保存。 |
| POST | /seo-suggest-keywords | projectGuard | プロジェクト情報を基に SEO/AIO 向けキーワードを提案。レスポンス: `{ keywords: string[] }` または `{ suggestions: string }`。api_usage 加算なし。 |
| GET | /history | projectGuard | 現在プロジェクトの分析履歴一覧。 |
| GET | /history/:id | projectGuard | 指定 ID の履歴詳細（analysisHistorySchema）。他プロジェクトは 404。 |
| GET | /helps | projectGuard | 各 aiType のヘルプ文言。 |
| POST | /instruction-guide | projectGuard | Body: `{ formNames: string[] }`。指定フォーム名の生成指示ガイドを返す。 |
| GET | /image/:projectId/:filename | projectGuard | projectId が自セッションと一致する場合のみ R2 から画像返却。304 対応。 |
| POST | /admin/login | なし | Body: `{ id, password }`（adminLoginSchema）。ADMIN_USERNAME/PASSWORD と照合。Cookie: admin-session。 |
| GET | /admin/session | adminGuard | 管理セッション `{ id, expiresAt }`。 |
| GET | /admin/projects | adminGuard | 一覧。Query: offset, limit。 |
| POST | /admin/projects | adminGuard | Body: projectSchema（name, managerName, ownerName, projectId, projectPass, apiUsageLimit, authId）。 |
| GET | /admin/projects/:projectId | adminGuard | 1 件取得。 |
| PATCH | /admin/projects/:projectId | adminGuard | Body: updateProjectSchema。 |
| DELETE | /admin/projects/:projectId | adminGuard | 1 件削除。 |
| GET | /admin/auth | adminGuard | auth 一覧。Query: offset, limit。 |
| POST | /admin/auth | adminGuard | Body: authSchema。作成。 |
| GET | /admin/auth/:authId | adminGuard | 1 件取得。 |
| PATCH | /admin/auth/:authId | adminGuard | Body: updateAuthSchema。 |
| DELETE | /admin/auth/:id | adminGuard | 1 件削除。 |
| GET | /admin/application-settings | adminGuard | OpenAI API キー・ChatGPT モデル。 |
| PUT | /admin/application-settings | adminGuard | Body: applicationSettingSchema。 |
| GET | /admin/helps | adminGuard | 各 aiType のヘルプ文言。 |
| PUT | /admin/helps | adminGuard | Body: helpSchema。 |
| GET | /admin/prompts | adminGuard | 各 aiType の system/user プロンプト。 |
| PUT | /admin/prompts | adminGuard | Body: promptSchema。 |
| GET | /admin/instruction-guide | adminGuard | フォーム名ごとの生成指示ガイド。 |
| PUT | /admin/instruction-guide | adminGuard | Body: saveInstructionGuideSchema。 |

### 分析 API の type 一覧（analysisQuerySchema）

`market` | `competitor` | `account` | `insight` | `improvement` | `improvement-no-image` | `feed-post` | `reel-and-stories` | `profile` | `google-map` | `google-map-no-image` | `seo-article`。

各 type ごとの FormData 要件（画像必須/任意、instruction 必須/任意）は `apps/api/src/routes/analysis.ts` の `analysisSchemaByType` で定義。

### エラー・ステータス

- **401**: 未認証（Cookie なし or セッション無効）。
- **403**: 月次 API 利用上限超過（analysis）など。
- **404**: project_info なし、履歴なし、他プロジェクトの履歴、画像なしなど。
- **400**: バリデーションエラー、UseCase エラー（ProjectAlreadyExists 等）。エラー body は `{ error: string }` または Zod/UseCase の値。

### 参照

- リクエスト/レスポンスの型: `apps/api/src/schema.ts` および各ルートの Zod スキーマ名。
- HTTP リクエスト例: `apps/api/README.md`。

---

## Part 2: ブランチ・環境（stg / prd）

### ブランチの役割

| ブランチ | 役割 | デプロイ先 |
|----------|------|------------|
| **prd** | 本番用 | 本番環境（Cloudflare Pages / Workers） |
| **stg** | ステージング用 | ステージング環境（Cloudflare Pages / Workers） |

### デプロイの仕組み

- **prd** または **stg** ブランチへ push すると、GitHub Actions が自動でデプロイを実行する。
- **API** (`apps/api`): `prd` → 本番 D1/R2、`stg` → ステージング D1/R2（`wrangler.toml` の `[env.preview]`）。
- **Web** (`apps/web`): Cloudflare Pages の `prd` / `stg` ブランチにデプロイ。
- **Management** (`apps/management`): 同上。

### 本番とステージングの違い

- **本番（prd）**: 実際のユーザーが利用する環境。D1・R2・環境変数は本番用。
- **ステージング（stg）**: 動作確認・検証用。D1・R2 は本番と別インスタンス。BASIC 認証で保護されている場合あり。

---

## Part 3: 開発ルール（新規エンジニア向け）

別会社のエンジニアが参加する場合も含め、以下のルールを共有・遵守する。

### 1. 作業は必ずブランチを作成して行う

- **直接 `stg` や `prd` で作業しない。**
- 作業開始時は `stg` から feature ブランチを作成する。

```bash
git fetch origin
git checkout stg
git pull origin stg
git checkout -b feature/作業内容の簡潔な名前
```

### 2. 変更完了後は stg へ push する

- コード変更を完了したら、**必ず stg ブランチへ反映**する。
- ステージング環境で動作確認してから、本番（prd）への反映を検討する。

```bash
# 例: feature ブランチで作業後、stg にマージして push
git add .
git commit -m "feat: 変更内容の説明"
git checkout stg
git merge feature/作業内容の簡潔な名前
git push origin stg
```

または、feature ブランチを push したうえで PR を作成し、stg にマージする運用でも可。

### 3. 本番（prd）への反映

- 本番デプロイは慎重に行う。
- stg で十分に検証したうえで、必要に応じて `prd` へマージ・push する。

```bash
git checkout prd
git pull origin prd
git merge stg   # または該当コミットを cherry-pick
git push origin prd
```

### 4. Cloudflare の設定は変更しない

- **Cloudflare ダッシュボード**、リモート D1/R2、本番・ステージングの環境変数・バインド、**GitHub の Cloudflare 用 Secrets** は変更・提案しない。
- ローカル用の `wrangler.toml` の `[vars]` や `apps/api/.dev.vars` の説明・編集は可。

### 5. ローカル開発の前提

- 作業前に `docs/LOCAL_DEVELOPMENT.md` を読む。構成・ポート・認証・DB の前提を把握する。
- バックエンド（API）の仕様変更・確認時は `docs/BACKEND_SPEC.md` または本ドキュメントを参照する。
- 機能追加・仕様変更時は `docs/LOCAL_DEVELOPMENT.md` の「システムの全機能」で影響範囲を把握する。

### 6. クローン時のブランチ

- 初回クローン時は `stg` をベースにすることを推奨。

```bash
git clone -b stg <repository-url>
```

---

## 関連ドキュメント

- `docs/LOCAL_DEVELOPMENT.md` — ローカル開発のセットアップ・確認手順、システムの全機能
- `docs/BACKEND_SPEC.md` — バックエンド仕様の簡易版（本ドキュメントと重複あり）
- `apps/api/README.md` — API の HTTP リクエスト例
- `README.md` — デプロイ手順、Cloudflare の初期設定
