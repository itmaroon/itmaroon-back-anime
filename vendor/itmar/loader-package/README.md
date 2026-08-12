
# Itmar Loader Package

**WordPress プラグインに最適な、クラス定義を使わない軽量 PSR-4 オートローダー**

このパッケージは `vendor/autoload.php` に依存せず、Composer が生成する `autoload_psr4.php` だけを利用して、  
WordPress 環境下でも **クラス競合なく安全にオートロードと翻訳ファイルの読み込みを実現**します。

---

## 🎯 変更履歴
= 1.2.1 = 
二重読みこみ防止のための
define(__NAMESPACE__ . '\_ITMAR_SAFE_AUTOLOADER_LOADED', true);
を
define('ITMAR_SAFE_AUTOLOADER_LOADED', true);
に修正
 
### 問題の概要

- これまでのローダーは **`vendor/composer/autoload_psr4.php`（PSR-4）** と **`autoload_classmap.php`（classmap）** のみを参照。
- Composer にはクラス以外（関数 / polyfill 初期化 等）をロードする仕組みとして **`vendor/composer/autoload_files.php`（files オートロード）** がある。
- 例：AWS SDK は `Aws\\manifest()` を **`src/functions.php`** に定義し、`autoload_files.php` 経由で読み込ませる前提。  
  PSR-4/classmap だけではこのファイルが読み込まれず、**`Call to undefined function Aws\\manifest()`** が発生。

#### 代表的なエラーログ
```
PHP Fatal error: Uncaught Error: Call to undefined function Aws\manifest()
```

---

### 修正ポイント

1. **`autoload_files.php` に列挙されたファイルを `require_once`** で読み込む処理を追加  
   - これにより、関数定義や polyfill 等、**クラス以外の初期化コードも確実に実行**される。
2. （任意）**`autoload_classmap.php` も併用**  
   - PSR-4 に乗らないクラスを補完でき、解決精度が上がる。
3. **読み込み順を「files → classmap → PSR-4」** に統一  
   - 依存コードの初期化を先に済ませ、クラス解決時の安定性を高める。
4. **再入防止ガード**（同ファイル多重読込防止）を追加  
   - `spl_autoload_register` の多重登録や、files の多重実行を防ぐ。


---

## 🎯 特徴

- ✅ `spl_autoload_register()` により PSR-4 クラスの自動読み込みを実現
- ✅ `Loader` クラス定義などは一切不要。**グローバル関数も定義しません**
- ✅ `.mo` ファイル（翻訳）も自動でロードされるため、多言語対応も安心
- ✅ 複数プラグインで共存してもクラス・関数の衝突が発生しません

---

## 📦 インストール

```bash
composer require itmar/loader-package
```

---

## 🚀 使用方法（WordPress プラグイン）

### プラグイン構成例

```
your-plugin/
├── plugin.php
├── composer.json
├── vendor/
│   └── itmar/
│       └── loader-package/
│           └── register_autoloader.php
│   └── composer/
│       └── autoload_psr4.php
```

### plugin.php の先頭で呼び出すだけ

```php
require_once __DIR__ . '/vendor/itmar/loader-package/register_autoloader.php';
```

- ✅ PSR-4 にマッピングされたクラスが自動で読み込まれます
- ✅ 対応する `.mo` 翻訳ファイルも自動ロードされます

---

## 🌐 翻訳ファイルの自動ロード

各 PSR-4 名前空間ごとに自動で以下を探します：

- パス：`{パッケージ}/languages/`
- ファイル名：`{textdomain}-{locale}.mo`（例：`my-plugin-ja.mo`）
- テキストドメインは名前空間から自動生成されます

### 例

```
vendor/itmar/block-class-package/languages/block-class-package-ja.mo
```

名前空間が `Itmar\BlockClassPackage\` の場合、テキストドメインは `block-class-package` になります。

---

## ⚙ 技術的仕様

- `debug_backtrace()` で呼び出し元から `vendor/composer/autoload_psr4.php` を特定
- すべての PSR-4 マッピングに対して `spl_autoload_register()` を登録
- `.mo` ファイルを `load_textdomain()` で即時読み込み（WordPress の i18n対応）

---

## ✅ なぜ `vendor/autoload.php` を使わないのか？

WordPress では複数のプラグインが独自に Composer を使うことが多く、  
`vendor/autoload.php` を読み込むと `ComposerAutoloaderInitXXXX` クラスの競合が発生し、  
**`Fatal error` によってサイト全体が停止することがあります。**

このパッケージは `autoload_psr4.php` のみを使用することで、**安全かつ衝突のないクラスローディングを可能にします。**

---

## 📄 ライセンス

MIT License

---

## 👤 作者

**Itmaroon**  
<master@itmaroon.net>  
https://itmaroon.net
