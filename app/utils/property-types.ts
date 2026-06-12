import type { PropertyType } from '~/types/property'

/** key จาก home.search.propertyTypes → ค่า property_type ใน DB */
export const propertyTypeKeyToDb: Record<string, PropertyType> = {
  houseTown: 'house',
  townhouse: 'townhouse',
  condo: 'condo',
  commercial: 'commercial',
  apartment: 'apartment',
}

export function dbPropertyTypeToCategoryKey(dbType: string): string | undefined {
  return Object.entries(propertyTypeKeyToDb).find(([, db]) => db === dbType)?.[0]
}
