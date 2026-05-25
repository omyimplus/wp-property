const min = [22, 12, 0]
const v = process.versions.node.split('.').map(Number)
const ok =
  v[0] > min[0]
  || (v[0] === min[0] && v[1] > min[1])
  || (v[0] === min[0] && v[1] === min[1] && v[2] >= min[2])

if (!ok) {
  console.error(
    `\nwp-property ต้องการ Node.js >= ${min.join('.')} (ปัจจุบัน ${process.versions.node}).\n`
    + '  nvm install 22 && nvm use\n'
    + '  หรือ: fnm use / volta install node@22\n',
  )
  process.exit(1)
}
