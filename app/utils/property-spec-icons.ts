import type { PropertyIconName } from '~/data/property-icons'

/** แมป key ของสเปกทรัพย์ → ไอคอน */
export const PROPERTY_SPEC_ICON_MAP: Record<string, PropertyIconName> = {
  type: 'building',
  listing: 'tag',
  project: 'building',
  bed: 'bedroom',
  bath: 'bathroom',
  parking: 'parking',
  usable: 'usable_area',
  land: 'land_area',
  floor: 'floor_level',
  floors: 'building',
  facing: 'compass',
  age: 'age',
  deposit: 'tag',
  code: 'hash',
  posted: 'calendar',
}

export function specItemIcon(key: string): PropertyIconName | undefined {
  return PROPERTY_SPEC_ICON_MAP[key]
}
