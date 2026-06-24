import richContentCss from '~/assets/css/rich-content.css?raw'

/** CSS สำหรับ TinyMCE iframe — แมป .rich-content → body ให้ตรงกับหน้าบ้าน */
export const tinymceContentStyle = richContentCss
  .replace(/\/\*\*[\s\S]*?\*\//g, '')
  .replace(/\.rich-content/g, 'body')
  .trim()
