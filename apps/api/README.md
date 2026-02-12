# API仕様

## AI分析

### POST /analysis

AIによる分析を行う。

#### Request

- 認証: 必要
- メソッド: POST
- パス: /analysis
- クエリパラメータ
  - type: string, 必須, "market" | "competitor" | "account" | "insight" | "writing" | "writing-no-image"
- リクエストボディ
  - Content-Type: multipart/form-data

```ts
{
  file: File,
  instruction: string
}
```

例

```http
POST /analysis?type=writing-no-image HTTP/1.1
Accept: */*
Cookie: session=S65QvxlDWuWrzHZaZzfYJQgy0l2qDhiH
Content-Type: multipart/form-data; boundary=---011000010111000001101001
Host: localhost:8787
Content-Length: 124

-----011000010111000001101001
Content-Disposition: form-data; name="instruction"

test
-----011000010111000001101001--
```

#### Response

- ステータスコード: 200
- レスポンスボディ
  - Content-Type: text/plain; charset=UTF-8

## ヘルプ

### GET /helps

各種AI機能の使い方を取得する。

#### Request

- 認証: 必要
- メソッド: GET
- パス: /helps

#### Response

- ステータスコード: 200
- レスポンスボディ
  - Content-Type: application/json; charset=UTF-8

```ts
{
  market: string,
  competitor: string,
  account: string,
  insight: string,
  writing: string,
  writingNoImage: string
}
```

## 履歴

### GET /history

分析履歴を取得する。

#### Request

- 認証: 必要
- メソッド: GET
- パス: /history

#### Response

- ステータスコード: 200
- レスポンスボディ
  - Content-Type: application/json; charset=UTF-8

```ts
{
  id: string,
  projectId: string,
  aiType: "market" | "competitor" | "account" | "insight" | "writing" | "writing-no-image",
  input: {
    instruction: string,
  },
  output: {
    output: string,
  }
  createdAt: number
}[]
```

## ログイン

### POST /login

ログインする。

#### Request

- 認証: 不要
- メソッド: POST
- パス: /login
- リクエストボディ
  - Content-Type: application/json; charset=UTF-8

```ts
{
  id: string,
  password: string
}
```

例

```http
POST /login HTTP/1.1
Accept: */*
Content-Type: application/json
Host: localhost:8787
Content-Length: 47

{
  "id": "SAI0001",
  "password": "Password"
}
```

#### Response

- ステータスコード: 200
- レスポンスボディ
  - Content-Type: application/json; charset=UTF-8
  - Set-Cookie: session=string

```ts
{
  ok: true;
}
```

## ログアウト

### POST /logout

ログアウトする。

#### Request

- 認証: 必要
- メソッド: POST
- パス: /logout

例

```http
POST /logout HTTP/1.1
Accept: */*
Cookie: session=S65QvxlDWuWrzHZaZzfYJQgy0l2qDhiH
Host: localhost:8787
```

#### Response

- ステータスコード: 200
- レスポンスボディ
  - Content-Type: application/json; charset=UTF-8
  - Set-Cookie: session=string

```ts
{
  ok: true;
}
```

## プロジェクト情報

### GET /project-info

プロジェクト情報を取得する。

#### Request

- 認証: 必要
- メソッド: GET
- パス: /project_info

例

```http
GET /project_info HTTP/1.1
Accept: */*
Cookie: session=yi36gnP23MRJu0B9hEzcRaVFx1sKtupG
Host: localhost:8787
```

#### Response

- ステータスコード: 200
- レスポンスボディ
  - Content-Type: application/json; charset=UTF-8

```ts
{
  id: number,
  projectId: string,
  businessType: string,
  address: string,
  nearestStation: string,
  concept: string,
  strength: string,
  targetAge: string,
  targetGender: string,
  targetArea: "東京",
  targetAttribute: string,
  targetConcern: string,
  existingCustomerAnalysis: string
}
```

### PUT /project-info

プロジェクト情報を更新する。

#### Request

- 認証: 必要
- メソッド: PUT
- パス: /project_info
- リクエストボディ
  - Content-Type: application/json; charset=UTF-8

```ts
{
  businessType?: string,
  address?: string,
  nearestStation?: string,
  concept?: string,
  strength?: string,
  targetAge?: string,
  targetGender?: string,
  targetArea?: "東京",
  targetAttribute?: string,
  targetConcern?: string,
  existingCustomerAnalysis?: string
}
```

例

```http
PUT /project_info HTTP/1.1
Accept: */*
Cookie: session=yi36gnP23MRJu0B9hEzcRaVFx1sKtupG
Content-Type: application/json
Host: localhost:8787
Content-Length: 394

{
  "id": 1,
  "projectId": "SAI0001",
  "businessType": "飲食店",
  "address": "東京都",
  "nearestStation": "赤坂",
  "concept": "ラグジュアリーな空間で地中海料理を楽しむ",
  "strength": "地中海のような店内とミシュランシェフの本格料理",
  "targetAge": "30代",
  "targetGender": "女性",
  "targetArea": "東京",
  "targetAttribute": "おしゃれな場所でランチを食べたい",
  "targetConcern": "おしゃれな場所で美味しいランチを食べられる場所がない",
  "existingCustomerAnalysis": "おしゃれが好きな30代のOL"
}
```

#### Response

- ステータスコード: 200
- レスポンスボディ
  - Content-Type: application/json; charset=UTF-8

```ts
{
  businessType?: string,
  address?: string,
  nearestStation?: string,
  concept?: string,
  strength?: string,
  targetAge?: string,
  targetGender?: string,
  targetArea?: "東京",
  targetAttribute?: string,
  targetConcern?: string,
  existingCustomerAnalysis?: string
}
```

## セッション

### GET /session

セッション情報を取得する。

#### Request

- 認証: 必要
- メソッド: GET
- パス: /session

例

```http
GET /session HTTP/1.1
Accept: */*
Cookie: session=yi36gnP23MRJu0B9hEzcRaVFx1sKtupG
Host: localhost:8787
```

#### Response

- ステータスコード: 200
- レスポンスボディ
  - Content-Type: application/json; charset=UTF-8

```ts
{
  id: string,
  projectId: string,
  expiresAt: number
}
```

## アプリケーション設定

### GET /admin/application-settings

アプリケーション設定を取得する。

#### Request

- 認証: 必要
- メソッド: GET
- パス: /admin/application-settings

例

```http
GET /admin/application-settings HTTP/1.1
Accept: */*
Cookie: admin-session=wR3jeH2TLHg0fMwI5oOb4ocJWtSggrqM
Host: localhost:8787
```

#### Response

- ステータスコード: 200
- レスポンスボディ
  - Content-Type: application/json; charset=UTF-8

```ts
{
  openAiApiKey: string,
  chatGptModel: string,
}
```

### PUT /admin/application-settings

アプリケーション設定を更新する。

#### Request

- 認証: 必要
- メソッド: PUT
- パス: /admin/application-settings
- リクエストボディ
  - Content-Type: application/json; charset=UTF-8

```ts
{
  openAiApiKey: string,
  chatGptModel: string,
}
```

例

```http
PUT /admin/application-settings HTTP/1.1
Accept: */*
Cookie: admin-session=wR3jeH2TLHg0fMwI5oOb4ocJWtSggrqM
Content-Type: application/json
Host: localhost:8787
Content-Length: 108

{
  "openAiApiKey": "sk-",
  "chatGptModel": "gpt-4o-mini"
}
```

#### Response

- ステータスコード: 200
- レスポンスボディ
  - Content-Type: application/json; charset=UTF-8

```ts
{
  openAiApiKey: string,
  chatGptModel: string,
}
```

## ヘルプ設定

### GET /admin/helps

ヘルプ設定を取得する。

#### Request

- 認証: 必要
- メソッド: GET
- パス: /admin/helps

例

```http
GET /admin/helps HTTP/1.1
Accept: */*
Cookie: admin-session=wR3jeH2TLHg0fMwI5oOb4ocJWtSggrqM
Host: localhost:8787
```

#### Response

- ステータスコード: 200
- レスポンスボディ
  - Content-Type: application/json; charset=UTF-8

```ts
{
  market: string,
  competitor: string,
  account: string,
  insight: string,
  writing: string,
  "writing-no-image": string
}
```

### PUT /admin/helps

ヘルプ設定を更新する。

#### Request

- 認証: 必要
- メソッド: PUT
- パス: /admin/helps
- リクエストボディ
  - Content-Type: application/json; charset=UTF-8

```ts
{
  market: string,
  competitor: string,
  account: string,
  insight: string,
  writing: string,
  "writing-no-image": string
}
```

例

```http
PUT /admin/helps HTTP/1.1
Accept: */*
Cookie: admin-session=wR3jeH2TLHg0fMwI5oOb4ocJWtSggrqM
Content-Type: application/json
Host: localhost:8787

{
  "market": "市場分析の使い方",
  "competitor": "競合分析の使い方",
  "account": "アカウント分析の使い方",
  "insight": "インサイト分析の使い方",
  "writing": "ライティングの使い方",
  "writing-no-image": "ライティングの使い方（画像なし）"
}
```

#### Response

- ステータスコード: 200
- レスポンスボディ
  - Content-Type: application/json; charset=UTF-8

```ts
{
  market: string,
  competitor: string,
  account: string,
  insight: string,
  writing: string,
  "writing-no-image": string
}
```

## ログイン

### POST /admin/login

ログインする。

#### Request

- 認証: 不要
- メソッド: POST
- パス: /admin/login
- リクエストボディ
  - Content-Type: application/json; charset=UTF-8

```ts
{
  id: string,
  password: string
}
```

例

```http
POST /admin/login HTTP/1.1
Accept: */*
Content-Type: application/json
Host: localhost:8787

{
  "id": "admin",
  "password": "1234"
}
```

#### Response

- ステータスコード: 200
- レスポンスボディ
  - Content-Type: application/json; charset=UTF-8
  - Set-Cookie: admin-session=string

```ts
{
  ok: true;
}
```

## プロジェクト管理

### GET /admin/projects

プロジェクト一覧を取得する。

#### Request

- 認証: 必要
- メソッド: GET
- パス: /admin/projects
- クエリパラメータ
  - offset: number, 必須
  - limit: number, 必須

例

```http
GET /admin/projects?offset=0&limit=20 HTTP/1.1
Accept: */*
Cookie: admin-session=wR3jeH2TLHg0fMwI5oOb4ocJWtSggrqM
Host: localhost:8787
```

#### Response

- ステータスコード: 200
- レスポンスボディ
  - Content-Type: application/json; charset=UTF-8

```ts
{
  projects: {
    id: number,
    name: string,
    managerName: string,
    ownerName: string,
    projectId: string,
    projectPass: string,
    apiUsageLimit: number,
  }[],
  hasNext: boolean
}
```

### GET /admin/projects/:projectId

プロジェクト情報を取得する。

#### Request

- 認証: 必要
- メソッド: GET
- パス: /admin/projects/:projectId
- パスパラメータ
  - projectId: string, 必須

例

```http
GET /admin/projects/SAI0001 HTTP/1.1
Accept: */*
Cookie: admin-session=wR3jeH2TLHg0fMwI5oOb4ocJWtSggrqM
Host: localhost:8787
```

#### Response

- ステータスコード: 200
- レスポンスボディ
  - Content-Type: application/json; charset=UTF-8

```ts
{
  id: number,
  name: string,
  managerName: string,
  ownerName: string,
  projectId: string,
  projectPass: string,
  apiUsageLimit: number,
}
```

### POST /admin/projects

プロジェクトを作成する。

#### Request

- 認証: 必要
- メソッド: POST
- パス: /admin/projects
- リクエストボディ
  - Content-Type: application/json; charset=UTF-8

```ts
{
  name: string,
  managerName: string,
  ownerName: string,
  projectId: string,
  projectPass: string,
  apiUsageLimit: number,
}
```

例

```http
POST /admin/projects HTTP/1.1
Accept: */*
Cookie: admin-session=wR3jeH2TLHg0fMwI5oOb4ocJWtSggrqM
Content-Type: application/json

{
  "name": "プロジェクト1",
  "managerName": "管理者1",
  "ownerName": "オーナー1",
  "projectId": "SAI0001",
  "projectPass": "password",
  "apiUsageLimit": 100
}
```

#### Response

- ステータスコード: 200
- レスポンスボディ
  - Content-Type: application/json; charset=UTF-8

```ts
{
  id: number,
  name: string,
  managerName: string,
  ownerName: string,
  projectId: string,
  projectPass: string,
  apiUsageLimit: number,
}
```

### PATCH /admin/projects/:projectId

プロジェクト情報を更新する。

#### Request

- 認証: 必要
- メソッド: PATCH
- パス: /admin/projects/:projectId
- パスパラメータ
  - projectId: string, 必須
- リクエストボディ
  - Content-Type: application/json; charset=UTF-8

```ts
{
  name?: string,
  managerName?: string,
  ownerName?: string,
  projectId: string,
  projectPass?: string,
  apiUsageLimit?: number,
}
```

例

```http
PATCH /admin/projects/SAI0002 HTTP/1.1
Accept: */*
Cookie: admin-session=wR3jeH2TLHg0fMwI5oOb4ocJWtSggrqM
Content-Type: application/json
Host: localhost:8787
Content-Length: 158

{
  "name": "プロジェクト2",
  "managerName": "管理者1",
  "ownerName": "オーナー1",
  "projectId": "SAI0002",
  "projectPass": "password",
  "apiUsageLimit": 100
}
```

#### Response

- ステータスコード: 200
- レスポンスボディ
  - Content-Type: application/json; charset=UTF-8

```ts
{
  id: number,
  name: string,
  managerName: string,
  ownerName: string,
  projectId: string,
  projectPass: string,
  apiUsageLimit: number,
}
```

### DELETE /admin/projects/:projectId

プロジェクトを削除する。

#### Request

- 認証: 必要
- メソッド: DELETE
- パス: /admin/projects/:projectId
- パスパラメータ
  - projectId: string, 必須

例

```http
DELETE /admin/projects/SAI0001 HTTP/1.1
Accept: */*
Cookie: admin-session=wR3jeH2TLHg0fMwI5oOb4ocJWtSggrqM
Host: localhost:8787
```

#### Response

- ステータスコード: 200
- レスポンスボディ
  - Content-Type: application/json; charset=UTF-8

```ts
{
  id: number,
  name: string,
  managerName: string,
  ownerName: string,
  projectId: string,
  projectPass: string,
  apiUsageLimit: number,
}
```

## プロンプト設定

### GET /admin/prompts

プロンプト設定を取得する。

#### Request

- 認証: 必要
- メソッド: GET
- パス: /admin/prompts

例

```http
GET /admin/prompts HTTP/1.1
Accept: */*
Cookie: admin-session=wR3jeH2TLHg0fMwI5oOb4ocJWtSggrqM
Host: localhost:8787
```

#### Response

- ステータスコード: 200
- レスポンスボディ
  - Content-Type: application/json; charset=UTF-8

```ts
{
  market: {
    system: string;
    user: string;
  };
  competitor: {
    system: string;
    user: string;
  };
  account: {
    system: string;
    user: string;
  };
  insight: {
    system: string;
    user: string;
  };
  writing: {
    system: string;
    user: string;
  };
  "writing-no-image": {
    system: string;
    user: string;
  };
}
```

### PUT /admin/prompts

プロンプト設定を更新する。

#### Request

- 認証: 必要
- メソッド: PUT
- パス: /admin/prompts
- リクエストボディ
  - Content-Type: application/json; charset=UTF-8

```ts
{
  market: {
    system: string;
    user: string;
  };
  competitor: {
    system: string;
    user: string;
  };
  account: {
    system: string;
    user: string;
  };
  insight: {
    system: string;
    user: string;
  };
  writing: {
    system: string;
    user: string;
  };
  "writing-no-image": {
    system: string;
    user: string;
  };
}
```

例

```http
PUT /admin/prompts HTTP/1.1
Accept: */*
Cookie: admin-session=wR3jeH2TLHg0fMwI5oOb4ocJWtSggrqM
Content-Type: application/json

{
  "market": {
    "system": "市場分析のプロンプト（システム）",
    "user": "市場分析のプロンプト（ユーザー）"
  },
  "competitor": {
    "system": "競合分析のプロンプト（システム）",
    "user": "競合分析のプロンプト（ユーザー）"
  },
  "account": {
    "system": "アカウント分析のプロンプト（システム）",
    "user": "アカウント分析のプロンプト（ユーザー）"
  },
  "insight": {
    "system": "インサイト分析のプロンプト（システム）",
    "user": "インサイト分析のプロンプト（ユーザー）"
  },
  "writing": {
    "system": "ライティングのプロンプト（システム）",
    "user": "ライティングのプロンプト（ユーザー）"
  },
  "writing-no-image": {
    "system": "ライティングのプロンプト（システム）",
    "user": "ライティングのプロンプト（ユーザー）"
  }
}
```

#### Response

- ステータスコード: 200
- レスポンスボディ
  - Content-Type: application/json; charset=UTF-8

```ts
{
  market: {
    system: string;
    user: string;
  };
  competitor: {
    system: string;
    user: string;
  };
  account: {
    system: string;
    user: string;
  };
  insight: {
    system: string;
    user: string;
  };
  writing: {
    system: string;
    user: string;
  };
  "writing-no-image": {
    system: string;
    user: string;
  };
}
```

## セッション

### GET /admin/session

セッション情報を取得する。

#### Request

- 認証: 必要
- メソッド: GET
- パス: /admin/session

例

```http
GET /admin/session HTTP/1.1
Accept: */*
Cookie: admin-session=wR3jeH2TLHg0fMwI5oOb4ocJWtSggrqM
Host: localhost:8787
```

#### Response

- ステータスコード: 200
- レスポンスボディ
  - Content-Type: application/json; charset=UTF-8

```ts
{
  id: string,
  expiresAt: number
}
```
