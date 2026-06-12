export async function sendLineNotify(token: string, message: string): Promise<void> {
  const body = new URLSearchParams({ message })

  const res = await fetch('https://notify-api.line.me/api/notify', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw createError({
      statusCode: 502,
      statusMessage: text || 'ส่งแจ้งเตือน Line ไม่สำเร็จ',
    })
  }
}
