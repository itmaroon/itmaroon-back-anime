<?php

namespace Itmar\BlockClassPackage;

class ItmarAccessClass
{
  const META_KEY = 'view_counter';

  /**
   * アクセス数を取得
   */
  public function get_post_count($id = 0)
  {
    if ($id === 0) {
      $id = get_queried_object_id();
    }
    if (!$id) {
      return 0;
    }

    $count = get_post_meta($id, self::META_KEY, true);

    // メタがなければ 0 とみなす（保存はしない）
    if ($count === '' || !is_numeric($count)) {
      return 0;
    }

    return (int) $count;
  }

  /**
   * アクセス数をインクリメント
   */
  public function set_post_count()
  {
    // 管理画面やフィードなどはカウントしない
    if (
      is_admin()
      || is_feed()
      || is_robots()
      || is_trackback()
      || wp_is_json_request()
      || wp_doing_ajax()
      || is_preview()
    ) {
      return;
    }

    if (!is_singular()) {
      return;
    }

    $id = get_queried_object_id();
    if (!$id) {
      return;
    }

    $count = get_post_meta($id, self::META_KEY, true);
    if ($count === '' || !is_numeric($count)) {
      $count = 0;
    }

    $count = (int) $count + 1;
    update_post_meta($id, self::META_KEY, $count);
  }

  /**
   * フック登録用
   */
  public function hook()
  {
    // 表示が確定した後でカウントするのが無難
    add_action('wp', [$this, 'set_post_count']);
  }
}
