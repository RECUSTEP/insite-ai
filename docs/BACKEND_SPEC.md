# バックエンド仕様（コードベース準拠）

API（`apps/api`）のルート・認証・リクエスト/レスポンス・エラーをコードから抽出した一覧。実装の詳細は各ファイルを、HTTP 例は `apps/api/README.md` を参照。

## 構成

- **エントリ**: `apps/api/src/index.ts` — Hono に logger を付け、`/` に routes をマウント。`AppType` を export してフロントの型付きクライアントに利用。
- **環境** (`apps/api/src/env.ts`): **Bindings**: `DB` (D1), `BUCKET` (R2), `ADMIN_USERNAME`, `ADMIN_PASSWORD`。**Variables**: 各 UseCase（auth, project, apiUsage, analysisHistory, projectInfo, adminSession, session, help, prompt, applicationSetting, instructionGuide）。UseCase は `apps/api/src/libs/hono.ts` で D1 を渡して生成。
- **スキーマの集約**: `apps/api/src/schema.ts` が各ルートの Zod スキーマを re-export。フロント・テストから `api/schema` で参照。

## 認証

- **ユーザー** (`apps/api/src/routes/_factory.ts` の `projectGuard`): Cookie `session` でセッション ID を送り、`sessionUseCase.validateSession` で検証。セッションに `projectId` が無い場合は `getByAuthId` の先頭プロジェクトで補完し `updateSession`。
- **管理** (`apps/api/src/routes/admin/_factory.ts` の `adminGuard`): Cookie `admin-session` で検証。
- **未保護**: `factory`（`libs/hono.ts`）のみを使うルートは認証不要: `POST /login`, `POST /admin/login`。

## ルート一覧

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

## 分析 API の type 一覧（analysisQuerySchema）

`market` | `competitor` | `account` | `insight` | `improvement` | `improvement-no-image` | `feed-post` | `reel-and-stories` | `profile` | `google-map` | `google-map-no-image` | `seo-article`。

各 type ごとの FormData 要件（画像必須/任意、instruction 必須/任意）は `apps/api/src/routes/analysis.ts` の `analysisSchemaByType` で定義。

## エラー・ステータス

- **401**: 未認証（Cookie なし or セッション無効）。
- **403**: 月次 API 利用上限超過（analysis）など。
- **404**: project_info なし、履歴なし、他プロジェクトの履歴、画像なしなど。
- **400**: バリデーションエラー、UseCase エラー（ProjectAlreadyExists 等）。エラー body は `{ error: string }` または Zod/UseCase の値。

## 参照

- リクエスト/レスポンスの型: `apps/api/src/schema.ts` および各ルートの Zod スキーマ名。
- HTTP リクエスト例: `apps/api/README.md`。
