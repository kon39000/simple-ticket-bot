# シンプルチケットBot

Discordサーバー用のシンプルなチケット管理Botです。ボタンをクリックするだけで、プライベートなスレッドを作成し、お問い合わせを管理できます。

## 🚀 セットアップ手順

### 1. Discord Developer PortalでBotを作成

1. [Discord Developer Portal](https://discord.com/developers/applications) にアクセス
2. 「New Application」をクリックして、アプリケーション名を入力（例：Simple Ticket Bot）
3. 左メニューの「Bot」をクリック
4. 「Reset Token」をクリックしてトークンをコピー（**重要：このトークンは他人に教えないでください**）

### 2. Botの権限設定

1. 左メニューの「OAuth2」→「URL Generator」をクリック
2. **SCOPES**で以下をチェック：
   - `bot`
   - `applications.commands`
3. **BOT PERMISSIONS**で以下をチェック：
   - `Send Messages`
   - `Send Messages in Threads`
   - `Create Public Threads`
   - `Create Private Threads`
   - `Manage Threads`
   - `Embed Links`
   - `Read Message History`
   - `View Channels`
   - `Use Slash Commands`
4. 生成されたURLをコピー

### 3. BotをDiscordサーバーに追加

1. 上記でコピーしたURLをブラウザで開く
2. 追加したいサーバーを選択
3. 権限を確認して「認証」をクリック

### 4. Discordでの準備

1. **開発者モードを有効化**：
   - Discord設定 → 詳細設定 → 開発者モードをON
2. **サポートロールのIDを取得**：
   - サーバー設定 → ロール → サポート用ロールを右クリック → IDをコピー
3. **チケットチャンネルのIDを取得**：
   - チケット作成ボタンを設置したいチャンネルを右クリック → IDをコピー

### 5. Botのセットアップ

1. **必要なファイルをダウンロード**
   ```bash
   # このフォルダに移動
   cd 0711_tickettool
   ```

2. **依存関係をインストール**
   ```bash
   npm install
   ```

3. **環境変数を設定**
   - `.env.example` を `.env` にコピー
   ```bash
   cp .env.example .env
   ```
   - `.env` ファイルを編集：
   ```
   BOT_TOKEN=ここにBotトークンを貼り付け
   SUPPORT_ROLE_ID=ここにサポートロールIDを貼り付け
   TICKET_CHANNEL_ID=ここにチケットチャンネルIDを貼り付け
   ```

4. **Botを起動**
   ```bash
   npm start
   ```

## 📱 使い方

1. 指定したチャンネルに「チケットを作成」ボタンが表示されます
2. ユーザーがボタンをクリックすると、プライベートスレッドが作成されます
3. スレッドには以下の人のみアクセス可能：
   - チケットを作成したユーザー
   - サポートロールを持つスタッフ
4. 問題が解決したら「チケットを閉じる」ボタンでスレッドをアーカイブ

## 🔧 トラブルシューティング

### Botがオンラインにならない
- トークンが正しくコピーされているか確認
- `.env` ファイルが正しい場所にあるか確認

### チケットが作成できない
- BotがMESSAGE CONTENTの権限を持っているか確認
- チャンネルIDが正しいか確認
- Botがそのチャンネルにアクセスできるか確認

### サポートスタッフがスレッドに追加されない
- サポートロールIDが正しいか確認
- Botがメンバーを管理する権限を持っているか確認

## 🚀 デプロイ方法（24時間稼働）

### 無料オプション
1. **Replit**：
   - [Replit](https://replit.com) でアカウント作成
   - 新しいNode.jsプロジェクトを作成
   - ファイルをアップロード
   - Secretsに環境変数を設定

2. **Railway**：
   - [Railway](https://railway.app) でアカウント作成
   - GitHubと連携
   - 環境変数を設定
   - デプロイ

### 有料オプション
- VPS（Virtual Private Server）
- Heroku
- AWS EC2

## 📝 カスタマイズ

- メッセージの内容は `index.js` 内のEmbedBuilderで変更可能
- ボタンの色やラベルも同様に変更可能
- 自動アーカイブ時間は `autoArchiveDuration` で調整可能（分単位）