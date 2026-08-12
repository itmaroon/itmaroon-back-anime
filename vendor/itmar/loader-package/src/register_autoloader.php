<?php

/** 1) 呼び出し元のプラグイン・ベースを推定 */
$caller_file = null;
$bt = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 2);
foreach ($bt as $f) {
    if (!empty($f['file'])) {
        $caller_file = $f['file'];
        break;
    }
}

if (!$caller_file) {
    return;
}

$plugin_base = dirname($caller_file);
$composer_dir = $plugin_base . '/vendor/composer';

/** 2) Composer生成ファイルの存在確認 */
$psr4_path    = $composer_dir . '/autoload_psr4.php';
$classmap_path = $composer_dir . '/autoload_classmap.php';
$files_path   = $composer_dir . '/autoload_files.php';

$prefixes = file_exists($psr4_path)     ? include $psr4_path      : [];
$classmap = file_exists($classmap_path) ? include $classmap_path  : [];
$files    = file_exists($files_path)    ? include $files_path     : [];

/** 3) Composer "files" を require_once（←今回のキモ） */
if (is_array($files)) {
    foreach ($files as $file) {
        // autoload_files.php は [hash => path] 形式のこともある
        if (is_string($file) && file_exists($file)) {
            require_once $file;
        } elseif (is_string($file)) {
            // 相対パスの可能性に保険
            $maybe = $plugin_base . '/vendor/' . ltrim($file, '/\\');
            if (file_exists($maybe)) {
                require_once $maybe;
            }
        }
    }
}

/** 4) 翻訳ファイルの自動ロード（従来ロジックを維持） */
$extract_textdomain = static function (string $namespace): ?string {
    $parts = explode('\\', trim($namespace, '\\'));
    if (count($parts) >= 2) {
        return strtolower(preg_replace('/([a-z])([A-Z])/', '$1-$2', $parts[1]));
    }
    return null;
};
foreach ($prefixes as $prefix => $dirs) {
    foreach ((array) $dirs as $dir) {
        $textdomain = $extract_textdomain($prefix);
        $base_path = dirname($dir);
        $languages_path = $base_path . '/languages';
        if ($textdomain && is_dir($languages_path)) {
            $locale = function_exists('determine_locale') ? determine_locale() : (get_locale() ?: 'en_US');
            $mofile = $languages_path . '/' . $textdomain . '-' . $locale . '.mo';
            if (file_exists($mofile)) {
                load_textdomain($textdomain, $mofile);
            }
        }
    }
}

/** 5) classmap → PSR-4 の順に解決する autoload を登録 */
spl_autoload_register(static function (string $class) use ($classmap, $prefixes): bool {
    // 5-1) classmap
    if (isset($classmap[$class])) {
        $file = $classmap[$class];
        if (file_exists($file)) {
            require $file;
            return true;
        }
        // 念のため相対パス対策
        $maybe = dirname(__DIR__) . '/' . ltrim($file, '/\\');
        if (file_exists($maybe)) {
            require $maybe;
            return true;
        }
    }

    // 5-2) PSR-4
    foreach ($prefixes as $prefix => $dirs) {
        if (strncmp($class, $prefix, strlen($prefix)) === 0) {
            $relative = ltrim(str_replace('\\', DIRECTORY_SEPARATOR, substr($class, strlen($prefix))), DIRECTORY_SEPARATOR);
            foreach ((array) $dirs as $baseDir) {
                $file = rtrim($baseDir, '/\\') . DIRECTORY_SEPARATOR . $relative . '.php';
                if (file_exists($file)) {
                    require $file;
                    return true;
                }
            }
        }
    }
    return false;
}, /*throw*/ true, /*prepend*/ true);
