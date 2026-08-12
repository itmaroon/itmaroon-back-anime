<?php

/**
 * Plugin Name:       ITmaroon Back Anime
 * Description:       This is a plugin that collects blocks that provide the ability to place animations in the background.
 * Requires at least: 6.4
 * Requires PHP:      8.2
 * Version:           0.1.0
 * Author:            Web Creator ITmaroon
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       itmaroon-back-anime
 * Domain Path:       /languages
 * @package           create-block
 */

//PHPファイルに対する直接アクセスを禁止
if (!defined('ABSPATH')) exit;

// プラグイン情報取得に必要なファイルを読み込む
if (!function_exists('get_plugin_data')) {
	require_once(ABSPATH . 'wp-admin/includes/plugin.php');
}

require_once __DIR__ . '/vendor/itmar/loader-package/src/register_autoloader.php';

$block_entry = new \Itmar\BlockClassPackage\ItmarEntryClass();

//ブロックの初期登録
add_action('init', function () use ($block_entry) {
	$plugin_data = get_plugin_data(__FILE__);
	$block_entry->block_init($plugin_data['TextDomain'], __FILE__);
}, 1); //このプラグインは優先実行



//プラグインの読み込み
function itmaroon_back_anime_add_plugin()
{
	//urlパスの引き渡し
	$plugin_url = plugins_url("", __FILE__);
	wp_localize_script('itmar-script-handle', 'back_anime', array(
		'plugin_url' => $plugin_url
	));
}
add_action('enqueue_block_assets', 'itmaroon_back_anime_add_plugin');
