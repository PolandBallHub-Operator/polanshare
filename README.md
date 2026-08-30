# Deni Share PWA（polanshare向け統合版）

このパッケージは、GitHubリポジトリ `PolandBallHub-Operator/polanshare` のプロジェクトサイト配下で使えるように調整したPWAです。リポジトリの既定ブランチは`main`ですが、確認時点ではルートに`LICENSE`のみがあり、GitHub Pagesはまだ有効化されていません。

## 配置

ZIPの中身をリポジトリのルートへ配置してください。想定される公開URLは次のとおりです。

`https://polandballhub-operator.github.io/polanshare/`

`manifest.json`、`sw.js`、画像、`index.html`の参照はすべて相対パスで統一しています。そのため、ユーザーサイトのルートではなく、`/polanshare/`のようなGitHub Pagesプロジェクトサイト配下でも、manifestの`scope`、`start_url`、Web Share Targetの`action`が同じプロジェクトパスに解決されます。Web Share Targetの`action`はGitHub Pages上で405になりにくいよう、実在する`./index.html`へ設定し、Service WorkerがPOSTを先に受信します。`.nojekyll`も同梱しています。

## 構成

HTMLは統合済みの`index.html`だけです。`manifest.json`はPWAのアプリ情報、アイコン、デスクトップ・モバイル用スクリーンショット、ショートカット、Web Share Targetを定義します。`sw.js`は`./index.html`（互換用に`./share-target`も対応）へのPOSTを受け取り、共有ファイルをIndexedDBに保存してから`index.html?shared=1`へ戻します。`index.html`は`shortcut=send`、`shortcut=history`、`shortcut=settings`を読み取り、対応するタブを開きます。

## GitHub Pagesでの有効化

リポジトリの **Settings → Pages** で、デプロイ元を`main`ブランチのルートに設定してください。公開後、HTTPSの公開URLをブラウザで開いてService Workerを登録し、PWAをインストールします。GitHub APIで確認した時点ではPagesは無効（`has_pages: false`）だったため、リポジトリ側での有効化が必要です。

既にインストール済みの旧版がある場合は、アプリを削除してから再インストールしてください。manifestやService Workerの変更を確実に反映できます。
