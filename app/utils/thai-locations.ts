import type { ThaiAddressRow } from '@riz007/thai-address-data'

export type ThaiLocationTree = {
  provinces: string[]
  districtsByProvince: Record<string, string[]>
  subdistrictsByKey: Record<string, string[]>
}

const districtKey = (province: string, district: string) => `${province}\0${district}`

export function buildThaiLocationTree(rows: ThaiAddressRow[]): ThaiLocationTree {
  const provinceSet = new Set<string>()
  const districtSets = new Map<string, Set<string>>()
  const subdistrictSets = new Map<string, Set<string>>()

  for (const row of rows) {
    provinceSet.add(row.province)
    if (!districtSets.has(row.province)) districtSets.set(row.province, new Set())
    districtSets.get(row.province)!.add(row.district)
    const key = districtKey(row.province, row.district)
    if (!subdistrictSets.has(key)) subdistrictSets.set(key, new Set())
    subdistrictSets.get(key)!.add(row.subdistrict)
  }

  const sort = (arr: string[]) => arr.sort((a, b) => a.localeCompare(b, 'th'))

  const provinces = sort([...provinceSet])
  const districtsByProvince: Record<string, string[]> = {}
  for (const [p, set] of districtSets) {
    districtsByProvince[p] = sort([...set])
  }
  const subdistrictsByKey: Record<string, string[]> = {}
  for (const [key, set] of subdistrictSets) {
    subdistrictsByKey[key] = sort([...set])
  }

  return { provinces, districtsByProvince, subdistrictsByKey }
}

export function districtsForProvince(tree: ThaiLocationTree, province: string): string[] {
  if (!province) return []
  return tree.districtsByProvince[province] ?? []
}

export function subdistrictsForDistrict(
  tree: ThaiLocationTree,
  province: string,
  district: string,
): string[] {
  if (!province || !district) return []
  return tree.subdistrictsByKey[districtKey(province, district)] ?? []
}

/** Keep legacy free-text values visible in selects when editing old records. */
export function optionsWithCurrent(options: string[], current: string): string[] {
  const c = current.trim()
  if (!c || options.includes(c)) return options
  return [c, ...options]
}
