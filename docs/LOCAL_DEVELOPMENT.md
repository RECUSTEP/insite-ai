# InsiteAI ローカル開発ガイド

このドキュメントは、InsiteAI をローカルでセットアップ・確認する手順と、ペアプログラミング時に AI が参照する前提をまとめたものです。

## 構成

- **モノレポ**: pnpm workspace + Turbo。`apps/*`（api / web / management）と `packages/*`（configuration, db, module, typescript-config）。
- **API** (`apps/api`): Hono、Cloudflare Workers + D1 + R2。認証は `ADMIN_USERNAME` / `ADMIN_PASSWORD` で照合。ローカルでは `wrangler.toml` の `[vars]` または `apps/api/.dev.vars` で上書き可能。
- **AdminPage** (`apps/management`): Next.js、ポート **3001**。API は `wrangler.toml` の `[vars].API_URL`（ローカルは `http://localhost:8787`）を `setupDevPlatform` 経由で取得。
- **UserPage** (`apps/web`): Next.js、ポート **3000**。同様に `API_URL = "http://localhost:8787"`。
- **ローカル DB**: Cloudflare D1 **ローカル**（Miniflare）。実体は `apps/api` の drizzle 設定で参照する `.wrangler/state/v3/d1/` 内 SQLite。**リモートの Cloudflare D1 は使わない**。
- **マイグレーション**: `cd apps/api && pnpm migrate` でローカル D1 に適用。定義は `apps/api/migrations` と `packages/db/schema.ts`。

```
[ローカル開発]
  UserPage (:3000) ──┐
                    ├──> API (:8787) ──> D1 Local (SQLite)
  AdminPage (:3001) ─┘
```

## セットアップ手順

1. リポジトリを取得（必要なら）  
   `git clone -b stg <repository-url>`
2. 依存関係のインストール（ルートで）  
   `pnpm i`
3. ローカル DB のマイグレーション  
   `cd apps/api && pnpm migrate`
4. 開発サーバーの起動（ルートで）  
   `pnpm dev`

## ポート一覧

| サービス   | ポート | 説明           |
| ---------- | ------ | -------------- |
| UserPage   | 3000   | ユーザー向け   |
| AdminPage  | 3001   | 管理者向け     |
| API        | 8787   | バックエンド API |

## 認証

- **AdminPage**: API の `ADMIN_USERNAME` / `ADMIN_PASSWORD` でログイン。値は `apps/api/wrangler.toml` の `[vars]` または **`apps/api/.dev.vars`** で設定。本番と揃える場合は `.dev.vars` に記載（`.dev.vars` は .gitignore 済み）。
- **UserPage**: ローカルは初期データが空のため、**先に AdminPage (localhost:3001) でプロジェクト（＝ユーザーアカウント）を作成**し、その projectId / projectPass で UserPage (localhost:3000) にログインする。

## ローカル DB

- D1 Local（Miniflare）を使用。初期状態ではレコードは存在しない。
- Cloudflare のリモート D1 には接続しない。ローカル開発では Cloudflare ダッシュボードやリモートリソースは変更しない。

## 確認手順（AI・人が実行する用）

1. `pnpm dev` で 3 サービスを起動する。
2. AdminPage (http://localhost:3001) にログインする。
3. プロジェクトを 1 件作成する。
4. UserPage (http://localhost:3000) で、その projectId / projectPass でログインする。
5. 必要なら API (http://localhost:8787) のエンドポイント（例: GET /session）で動作確認する。

## システムの全機能

このシステムでできることを、UserPage・AdminPage・API ごとにまとめる。実装・仕様変更時はここを参照して影響範囲を把握する。

### UserPage（ユーザー向け・ポート 3000）

| 機能 | パス・概要 |
|------|-------------|
| **ログイン・ログアウト** | `/login` で projectId / projectPass でログイン。ログアウトでセッション解除。 |
| **プロジェクト設定** | `/` プロジェクト情報（業種・住所・最寄り駅・コンセプト・強み・ターゲットなど）の閲覧・編集。プロジェクト切り替え。 |
| **プロジェクト新規作成** | `/new` ログイン中の認証（auth）に紐づく新規プロジェクトを作成。名前・担当者・オーナー・projectId を入力。 |
| **プロジェクト削除** | プロジェクト設定画面から削除可能（最後の 1 件は削除不可）。 |
| **分析AI** | `/competitor-analysis` 画像＋指示で AI 分析。タブ: **市場分析**（market）・**競合分析**（competitor）・**自社アカウント分析**（account）・**インサイト分析**（insight）。 |
| **AI店舗運営** | `/improvement-proposal` 画像あり/画像なしで店舗運営の改善提案（improvement / improvement-no-image）。 |
| **ライティングAI（Instagram）** | `/writing` **フィード投稿**（feed-post）・**リール・ストーリーズ**（reel-and-stories）・**プロフィール**（profile）。画像＋指示で文案生成。 |
| **ライティングAI（Google Map）** | `/google-map` 画像あり/画像なしで Google Map 用文案（google-map / google-map-no-image）。 |
| **SEO・AIO記事** | `/seo-articles` キーワード入力で SEO・AIO 向け記事を生成（seo-article）。キーワード提案機能あり。 |
| **履歴** | `/history` 分析履歴一覧。`/history/[id]` で詳細（AI 種別・入力・出力・日時）。 |
| **お知らせ** | `/announce` `apps/web/src/app/announce/announce.md` の Markdown を表示。 |

- 各 AI 機能は **月間 API 利用回数**（プロジェクトごとの `apiUsageLimit`）の範囲内で利用可能。利用回数は Admin がプロジェクト作成・編集で設定。
- 分析結果はストリーミング表示され、同時に分析履歴として保存される。

### AdminPage（管理者向け・ポート 3001）

| 機能 | パス・概要 |
|------|-------------|
| **ログイン** | `/login` Admin 用 ID/パスワード（API の `ADMIN_USERNAME` / `ADMIN_PASSWORD`）でログイン。 |
| **プロジェクト管理** | `/` プロジェクト一覧（検索・ページング）。新規作成（`/new`）・編集（`/projects/[id]`）・削除。projectId / projectPass / 名前・担当者・オーナー・**API 使用可能回数**を管理。 |
| **アカウント管理** | `/auth` 認証（auth）一覧。新規作成（`/new-auth`）・編集・削除。UserPage のログインは「auth に紐づくプロジェクト」の projectId / projectPass で行う。 |
| **アプリケーション設定** | `/application-setting` OpenAI API キー・ChatGPT モデル（例: gpt-4o-mini）の設定。全 AI 機能で共通利用。 |
| **プロンプト設定** | `/prompt` 各 AI 種別（market / competitor / account / insight / writing / writing-no-image）の **システムプロンプト**・**ユーザープロンプト**の編集。 |
| **ヘルプ設定** | `/help` 各 AI 種別の「使い方」テキスト。UserPage の各画面のヘルプポップオーバーに表示。 |
| **生成指示ガイド設定** | `/instruction-guide` 各フォーム（improvement / improvement-no-image / feed-post / reel-and-stories / profile / google-map / google-map-no-image）用の**生成指示ガイド**テキスト。UserPage のフォームで参照。 |

### API（ポート 8787）― 主なエンドポイント

- **認証・セッション（ユーザー）**: `POST /login`（ログイン）、`POST /logout`（ログアウト）、`GET /session`（セッション取得）。
- **プロジェクト・プロジェクト情報（ユーザー）**: `GET /project`（現在プロジェクト）、`POST /project`（プロジェクト作成）、`DELETE /project/:projectId`（削除）、`GET /projects`（一覧）、`GET /project_info`（プロジェクト情報取得）、`PUT /project_info`（プロジェクト情報更新）。
- **AI 分析**: `POST /analysis?type=<type>` でストリーミング分析。`type` は `market` / `competitor` / `account` / `insight` / `improvement` / `improvement-no-image` / `feed-post` / `reel-and-stories` / `profile` / `google-map` / `google-map-no-image` / `seo-article`。
- **SEO キーワード提案**: `POST /seo-suggest-keywords` でプロジェクト情報を基にキーワードを提案（api_usage 加算なし）。
- **履歴・ヘルプ・ガイド**: `GET /history`（分析履歴一覧）、`GET /helps`（ヘルプ文言）、`POST /instruction-guide`（生成指示ガイド取得）。
- **画像**: `GET /image` でアップロード済み画像の取得（R2）。
- **管理（Admin）**: `POST /admin/login`、`GET /admin/session`、`GET/POST/PATCH/DELETE /admin/projects`、`GET/POST/PATCH/DELETE /admin/auth`、`GET/PUT /admin/application-settings`、`GET/PUT /admin/helps`、`GET/PUT /admin/prompts`、`GET/PUT /admin/instruction-guide`。

詳細な API 仕様は `apps/api/README.md` を参照。バックエンドの仕様一覧（ルート・認証・型）は `docs/BACKEND_SPEC.md` を参照。

## Cloudflare について

- **ローカル開発では** Cloudflare ダッシュボードやリモート D1/R2/Pages/Workers は変更しない。デプロイ・本番・ステージングの設定は既存 README と CI に任せる。
- **触ってよいもの**: ローカル用の `wrangler.toml` の `[vars]`、`apps/api/.dev.vars` の作成・編集、およびこのドキュメントや README の追記。
