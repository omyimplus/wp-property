#!/usr/bin/env bash
# สร้าง zip ของ .output/server/node_modules สำหรับอัปโหลด Plesk เอง
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -d .output/server/node_modules ]]; then
  echo "ไม่พบ .output/server/node_modules — รัน npm run build ก่อน"
  exit 1
fi

OUT="$ROOT/server-node_modules.zip"
rm -f "$OUT"
(cd .output/server && zip -r -q "$OUT" node_modules)

echo "สร้างแล้ว: $OUT"
echo "อัปโหลดไป Plesk → httpdocs/.output/server/ แล้ว Extract"
