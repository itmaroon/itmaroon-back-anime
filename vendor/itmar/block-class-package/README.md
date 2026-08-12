# block-class-package

## 概要
Gutenbergのブロック登録に関連して、必要なPHPの関数をcomposerで読み込むためのファイルをパッケージにまとめました。
## インストール
コマンドプロンプト等から次のように入力してください。
```
composer require itmar/block-class-package
```
## 収納されているネームスペース・クラス
namespace Itmar\BlockClassPackage;  
namespace Itmar\ClassPakage;  
class ItmarEntryClass  
class ItmarAccessClass  
class ProgressOverlay  

## 変更履歴
= 1.4.2 =  
アクセスカウンターのためのItmarAccessClassを確実性の高いカウント方式に修正

= 1.4.0 =  
オートロードの仕組みをWordPressのプラグインの様に複数のオートロードが実行されても問題ないように変更。パッケージ内に翻訳ファイルを持ち、独自のテキストドメインで翻訳できるように仕様を変更
  
= 1.3.0 =  
汎用的に利用できるプログレスバーの表示と進行管理を行う機能を提供するProgressOverlayクラスを追加。これに伴いネームスペースもItmar\ClassPakageを追加した。

= 1.2.0 =  
アクセスカウンターの実装のため、meta情報としてview_counterというキーを登録する関数をもつItmarAccessClassを追加

= 1.1.1 =  
enqueueCommonStylesメソッドに渡すファイルパスをプラグインのルートフォルダより上位のフォルダ内のファイルパスを渡すことができるように修正

= 1.1.0 =  
enqueueCommonStylesメソッドを追加

= 1.0.4 =
- 登録するブロックが単数の場合でも対応できるよう機能を追加
- 依存するプラグインがインストールされていない又は有効化されていない場合のエラーメッセージを修正

= 1.0.3 =  
wp_set_script_translationsのハンドルを"ブロック名-editor-script"とすることでblock.jsonにデフォルトで設定されている"editorScript": "file:./index.js",を維持しながら、wp_set_script_translationsの機能を維持するようにした。

= 1.0.2 =  
WordPress6.5対応のためwp_register_scriptではなくwp_enqueue_scriptでハンドルを使用するようにしました。

= 1.0.1 =  
引数名のスペルミスを修正しました。

= 1.0.0 =  
最初のリリース

## メソッドの機能と引数
### 名前空間・クラス
\Itmar\BlockClassPackage\ItmarEntryClass  

#### block_init(string $text_domain, string $file_path)
##### 説明
$file_path内に含まれている複数のブロックを登録します。同時にPHPとJavascriptの翻訳関数をセットします。翻訳のためのpot,po,moの各ファイルはプラグインのルートフォルダ内のlanguagesフォルダに配置されていることが必要です。
また、WordPressの関数で取得する変数をフロントエンドのJavaScriptで使用できるようにローカライズします。
ローカライズされた変数はテキストドメイン名の'-'を'_'に置換した名称のオブジェクトに次のように収納されます。  
home_url・・・WordPressサイトのホームURL  
plugin_url・・・プラグインルートのURL  

##### 引数
- `$text_domain` string 必須  
プラグインで設定したテキストドメイン名
- `$file_path` string 必須  
プラグインのルートフォルダへの絶対パス。通常は__FILE__を設定する。
##### 戻り値
なし
##### 呼び出し例
```
$block_entry = new \Itmar\BlockClassPackage\ItmarEntryClass();

add_action('init', function () use ($block_entry) {
	$block_entry->block_init('text-domain', __FILE__);
});
```

#### activation_check(array $plugin_data, array $plugin_slug)
##### 説明
$plugin_slugで指定された名称のプラグインがインストール又は有効化されていない場合、そのプラグイン名等（最初に発見された１つだけ）を表示して、処理を中止します。
#### 引数
- `$plugin_data` array 必須  
get_plugin_dataで取得したプラグインの情報
- `$plugin_slug` array 必須  
依存する（チェックする）プラグインの名称（string）。配列で指定してください。
##### 戻り値
なし
##### 呼び出し例
```
$block_entry = new \Itmar\BlockClassPackage\ItmarEntryClass();

register_activation_hook(__FILE__, function () use ($block_entry) {
	$plugin_data = get_plugin_data(__FILE__);
	$block_entry->activation_check($plugin_data, ['block-collections']); // ここでメソッドを呼び出し
});
```

#### show_admin_dependency_notices(array $plugin_data, array $plugin_slug)
##### 説明
$plugin_slugで指定された名称のプラグインがインストール又は有効化されていない場合、そのプラグイン名等（最初に発見された１つだけ）を管理画面に表示させます。
##### 引数
- `$plugin_data` array 必須  
get_plugin_dataで取得したプラグインの情報
- `$plugin_slug` array 必須  
依存する（チェックする）プラグインの名称（string）。配列で指定してください。
##### 戻り値
なし
##### 呼び出し例
```
$block_entry = new \Itmar\BlockClassPackage\ItmarEntryClass();

add_action('admin_notices', function () use ($block_entry) {
	$plugin_data = get_plugin_data(__FILE__);
	$block_entry->show_admin_dependency_notices($plugin_data, ['block-collections']);
});
```

#### enqueueCommonStyles(string $filePath, boolean $isEditor, string $packageName)
##### 説明
インストールされているnpmパッケージ内のindex.css、style-index.cssをエンキューします。依存元のプラグインで、この関数を実行することで、依存しているプラグインでも共通のCSSを充てることができます。
##### 引数
- `$filePath` string 必須  
プラグインのエントリポイントファイルがあるフォルダへの絶対パス。原則として`--FILE--`を指定する。
- `$isEditor` boolean 必須  
ブロックエディタに適用させるときはtrue、フロントエンドに適用させるときはfalse。
原則としてenqueue_block_assetsフックで呼び出すときはtrue、wp_enqueue_scriptsフックで呼び出すときはfalse.
- `$packageName` boolean 必須  
index.css、style-index.cssが格納されているnpmパッケージの名前
##### 戻り値
なし
##### 呼び出し例
```
$block_entry = new \Itmar\BlockClassPackage\ItmarEntryClass();

add_action('enqueue_block_assets', function () use ($block_entry) {
	$block_entry->enqueueCommonStyles(__FILE__, true, "itmar-block-packages");
});
add_action('wp_enqueue_scripts', function () use ($block_entry) {
	$block_entry->enqueueCommonStyles(__FILE__, false, "itmar-block-packages");
});

```
### 名前空間・クラス
\Itmar\BlockClassPackage\ItmarAccessClass
#### get_post_count(int $id = 0)
##### 説明
$idで指定された投稿データに紐づいたview_counterキーの値を返す。  
##### 引数
- `$id` int 任意   
投稿データのID。指定しなければ現在表示している投稿データのIDが選択される

###### 戻り値
IDの数値
###### 呼び出し例
```
$block_access = new \Itmar\BlockClassPackage\ItmarAccessClass();

$count = get_post_count()

```

#### set_post_count()
##### 説明
表示されたシングルページがもつ$idに紐づいたview_counterキーの値を更新する（カウントアップ）。  
##### 引数
なし

##### 戻り値
なし
##### 呼び出し例
```
$block_access = new \Itmar\BlockClassPackage\ItmarAccessClass();

add_action('template_redirect', array($block_access, 'set_post_count'));

```
  
### 名前空間・クラス
\Itmar\ClassPakage\ProgressOverlay

#### 説明
このクラスはフロントエンドのJavaScriptの操作により、時間がかかる処理の進捗状況をプログレスバーに表示させます。進捗の状況はサーバーサイドの情報ではなく、フロントエンドで得た情報をサーバーサイドに送り、プログレスバーを再レンダリングします。
ただし、キャンセルボタンについてはフロントエンドの操作で、サーバーサイドでWordPressのupdate_optionを行い、その結果をフロントエンドに返します。
以下に説明する関数は、全てJavaScriptで呼び出してください。  

#### ProgressOverlay.show(string message)
##### 説明
フロントエンドに進捗状況を表示するダイアログとオーバーレイを表示します。この関数の実行時はプログレスバーは表示されず、待ち表示のGIFアニメが表示されます。フロントエンドで処理の準備中に利用してください。  
なお、この処理により、サーバーサイドではupdate_option('start_cancel', false);が実行されます。
##### 引数
- `message` string 任意   
ダイアログ内に表示されるメッセージ

###### 戻り値
なし
###### 呼び出し例
```
ProgressOverlay.show();
```

#### ProgressOverlay.showChange()
##### 説明
フロントエンドに表示されたダイアログ内の、待ち表示のGIFアニメを消して、プログレスバーを表示させます。
##### 引数
なし
###### 戻り値
なし
###### 呼び出し例
```
ProgressOverlay.showChange()
```

#### ProgressOverlay.changeProgress(int total, int current, int allcount, int count);
##### 説明
処理の進捗状況をプログレスバーに表示させます。また、理する全件数とその内の何件目を処理しているかを表示します。
##### 引数
- `total` int 必須   
処理する全件数
- `current` int 必須   
何番目を処理しているかの番号
- `allcount` int 任意   
処理すべき全プロセス数。１件の処理に複数のプロセスがあり、そのプロセス数と処理済み件数をプログレスに表示する場合に使用する。
- `count` int 任意   
処理済みのプロセス数
###### 戻り値
なし
###### 呼び出し例
```
ProgressOverlay.changeProgress(response.data.total, response.data.progress);
```
  
#### ProgressOverlay.hide()
##### 説明
フロントエンドに表示されたダイアログとオーバーレイを消去します。
##### 引数
なし
###### 戻り値
なし
###### 呼び出し例
```
ProgressOverlay.hide()
```

#### ProgressOverlay.cancel()
##### 説明
サーバーサイドの処理を中止し、フロントエンドに表示されたダイアログとオーバーレイを消去します。  
この処理により、サーバーサイドではupdate_option('start_cancel', true);が実行されるので、このオプション値を検知することでサーバーサイドの処理を中止させる仕組みを構築することが必要です。
##### 引数
なし
###### 戻り値
なし
###### 呼び出し例
```
ProgressOverlay.cancel()
```





