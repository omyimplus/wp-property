/**
 * โหลด TinyMCE จาก npm (self-hosted, ฟรี GPL) — ไม่ต้องใช้ API key จาก tiny.cloud
 * เรียกครั้งเดียวก่อน mount Editor
 */
import 'tinymce/tinymce'

import 'tinymce/icons/default'
import 'tinymce/models/dom'
import 'tinymce/themes/silver'

import 'tinymce/plugins/advlist'
import 'tinymce/plugins/anchor'
import 'tinymce/plugins/autolink'
import 'tinymce/plugins/charmap'
import 'tinymce/plugins/code'
import 'tinymce/plugins/directionality'
import 'tinymce/plugins/fullscreen'
import 'tinymce/plugins/help'
import 'tinymce/plugins/image'
import 'tinymce/plugins/insertdatetime'
import 'tinymce/plugins/link'
import 'tinymce/plugins/lists'
import 'tinymce/plugins/media'
import 'tinymce/plugins/nonbreaking'
import 'tinymce/plugins/preview'
import 'tinymce/plugins/searchreplace'
import 'tinymce/plugins/table'
import 'tinymce/plugins/visualblocks'
import 'tinymce/plugins/visualchars'
import 'tinymce/plugins/wordcount'

import 'tinymce/skins/ui/oxide/skin.min.css'
import 'tinymce/skins/ui/oxide/content.min.css'
import 'tinymce/skins/content/default/content.min.css'

export const TINYMCE_SELF_HOST_INIT = {
  license_key: 'gpl',
  skin: false,
  content_css: false,
} as const
