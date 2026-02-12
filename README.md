## デプロイ

### 必要ツール

- Node.js

### デプロイ手順

Cloudflareのアカウントをお持ちでなければ、[Sign up](https://dash.cloudflare.com/sign-up)よりアカウントを作成してください。

#### Pagesのプロジェクトの作成

以下のコマンドでプロジェクトを作成します。

```bash
$ npx wrangler pages project create
✔ Enter the name of your new project: … <project_name>
✔ Enter the production branch name: … prd
```

「アプリケーション」と「管理画面」の2つのプロジェクトを作成します。

`the name of your new project` には任意のプロジェクト名を入力します。それぞれのプロジェクト名は異なるものにしてください。

`the production branch name` には`prd`を入力します。

プロジェクト名は、後に使うので覚えておいてください。

#### データベースの作成

以下のコマンドでデータベースを作成します。

```bash
$ npx wrangler d1 create <database_name>
...
[[d1_databases]]
binding = "DB" # i.e. available in your Worker on env.DB
database_name = "<database_name>"
database_id = "<database_id>"
```

「プロダクション環境」と「ステージング環境」の2つのデータベースを作成します。（ステージング環境が必要ない場合は、プロダクション環境のみ作成してください。）

`<database_name>` には任意のデータベース名を入力します。それぞれのデータベース名は異なるものにしてください。

`database_id`は、後に使うので覚えておいてください。

#### ストレージの作成

以下のコマンドでストレージを作成します。

```bash
npx wrangler r2 bucket create <bucket_name>
```

「プロダクション環境」と「ステージング環境」の2つのストレージを作成します。（ステージング環境が必要ない場合は、プロダクション環境のみ作成してください。）

`<bucket_name>` には任意のバケット名を入力します。それぞれのバケット名は異なるものにしてください。

バケット名は、後に使うので覚えておいてください。

#### プロジェクトの設定

`apps/api/wrangler.toml`、`apps/web/wrangler.toml`、`apps/management/wrangler.toml`を編集します。

編集が必要な箇所は`<expression>`の形式で示しています。

##### `apps/api/wrangler.toml`

- `api.name`

「API」のプロジェクト名を入力します。

任意のプロジェクト名を入力してください。先ほど作成したプロジェクト名と異なるものにしてください。

- `api.bucket_name`

「プロダクション環境」のストレージ名を入力してください。

- `api.database_id`

「プロダクション環境」のデータベースIDを入力してください。

- `api.preview.bucket_name`

「ステージング環境」のストレージ名を入力してください。

作成していない場合は、プロダクション環境のストレージ名を入力してください。

- `api.preview.database_id`

「ステージング環境」のデータベースIDを入力してください。

作成していない場合は、プロダクション環境のデータベースIDを入力してください。

##### `apps/web/wrangler.toml`

- `web.name`

「アプリケーション」のプロジェクト名を入力します。

- `<API_URL>`

「プロダクション環境」の「API」のURLを入力します。

あとで設定するので、ここには何も入力しないでください。

- `<PREVIEW_API_URL>`

「ステージング環境」の「API」のURLを入力します。

あとで設定するので、ここには何も入力しないでください。

- `api.name`

「API」のプロジェクト名を入力します。

`apps/api/wrangler.toml`で入力したAPIのプロジェクト名を入力してください。

##### `apps/management/wrangler.toml`

- `management.name`

「管理画面」のプロジェクト名を入力します。

- `<API_URL>`

「プロダクション環境」の「API」のURLを入力します。

あとで設定するので、ここには何も入力しないでください。

- `<PREVIEW_API_URL>`

「ステージング環境」の「API」のURLを入力します。

あとで設定するので、ここには何も入力しないでください。

- `api.name`

「API」のプロジェクト名を入力します。

`apps/api/wrangler.toml`で入力したAPIのプロジェクト名を入力してください。

#### APIキーの取得

[APIトークン](https://dash.cloudflare.com/profile/api-tokens) > トークンを作成する > Cloudflare Workers を編集する

の順で進み、テンプレートに加えて以下の権限を付与します。

- アカウント / D1 / 編集

また、「アカウント リソース」と「ゾーン リソース」を設定します。

作成したトークンをコピーしておいてください。

#### GitHub Actionsの設定

GitHub Actionsのsecretsに以下の値を設定します。

- `CLOUDFLARE_API_TOKEN`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

`CLOUDFLARE_API_TOKEN`には、先ほど取得したAPIキーを入力します。

`ADMIN_USERNAME`と`ADMIN_PASSWORD`には、管理画面のログイン情報を入力します。

#### プロジェクトのデプロイ

`prd`ブランチと`stg`ブランチにpushすることで、プロジェクトがデプロイされます。

#### 環境変数の設定

[Dashboard](https://dash.cloudflare.com/) > Workers & Pages

に先ほど設定したプロジェクト名が表示されていることを確認し、それぞれのプロジェクトを選択します。

##### API

`<api.name>`と`<api.name>-preview`の2つが表示されていることを確認し、それぞれのURLをコピーします。

`wrangler.toml`の`<API_URL>`と`<PREVIEW_API_URL>`にそれぞれのURLを入力します。

##### Web

`<web.name>`が表示されていることを確認します。

設定 > 環境変数 > プレビュー > 変数を編集する

から以下の環境変数を設定します。

- `BASIC_USERNAME`
- `BASIC_PASSWORD`

ステージング環境にログインするためのユーザー名とパスワードを入力します。

##### Management

`<management.name>`が表示されていることを確認します。

設定 > 環境変数 > プレビュー > 変数を編集する

から以下の環境変数を設定します。

- `BASIC_USERNAME`
- `BASIC_PASSWORD`

ステージング環境にログインするためのユーザー名とパスワードを入力します。

#### プロジェクトのデプロイ

変更を反映するために、`prd`ブランチと`stg`ブランチにpushします。

### ローカルでの開発

#### 必要ツール

- Node.js
- pnpm

#### 開発手順

以下のコマンドで依存関係をインストールします。

```bash
pnpm i
```

以下のコマンドでデータベースのマイグレーションを実行します。

```bash
cd apps/api
pnpm run migrate
```

以下のコマンドで開発サーバーを起動します。

```bash
pnpm dev
```

### お知らせ機能

`apps/web/src/app/announce/announce.md`にお知らせの内容を記述します。

### 設定

`packages/configuration/configuration.json`に設定を記述します。

#### `file_upload`

| 項目                | 説明                                         |
| ------------------- | -------------------------------------------- |
| `max_file_size_mb`  | アップロード可能なファイルの最大サイズ（MB） |
| `accept_extensions` | アップロード可能な拡張子                     |
