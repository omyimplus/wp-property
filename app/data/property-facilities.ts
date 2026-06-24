export type PropertyFacilityIcon =
  | 'cabinet'
  | 'hood'
  | 'ac'
  | 'dishwasher'
  | 'fridge'
  | 'heater'
  | 'microwave'
  | 'washer'
  | 'tv'
  | 'bed'
  | 'sofa'
  | 'wardrobe'
  | 'wifi'
  | 'cctv'
  | 'elevator'
  | 'parking'
  | 'fitness'
  | 'pool'
  | 'garden'
  | 'security'
  | 'playground'
  | 'restaurant'
  | 'store'
  | 'shuttle'
  | 'transit'
  | 'jacuzzi'
  | 'steam'
  | 'sauna'
  | 'library'
  | 'keycard'
  | 'laundry'
  | 'moto_parking'
  | 'meeting'
  | 'ev'
  | 'sports'
  | 'pet'

export type InUnitFacilityKey =
  | 'cabinets'
  | 'cooker_hood'
  | 'air_conditioner'
  | 'dishwasher'
  | 'refrigerator'
  | 'water_heater'
  | 'microwave'
  | 'washing_machine'
  | 'tv'
  | 'bed'
  | 'sofa'
  | 'wardrobe'
  | 'internet'
  | 'pet_friendly'

export type NearbyFacilityKey =
  | 'elevator'
  | 'elevator_lobby'
  | 'jacuzzi'
  | 'fitness'
  | 'shuttle'
  | 'garden'
  | 'playground'
  | 'library'
  | 'convenience_store'
  | 'access_control'
  | 'laundry'
  | 'motorcycle_parking'
  | 'meeting_room'
  | 'parking'
  | 'steam_room'
  | 'security_24h'
  | 'cctv'
  | 'swimming_pool'
  | 'sauna'
  | 'restaurant'
  | 'ev_charger'
  | 'sports_court'
  | 'near_transit'

export interface PropertyFacilityOption {
  key: string
  labelKey: string
  icon?: PropertyFacilityIcon
}

/** สิ่งอำนวยความสะดวกในห้อง / มาพร้อมยูนิต */
export const IN_UNIT_FACILITIES: PropertyFacilityOption[] = [
  { key: 'cabinets', labelKey: 'propertyFacilities.inUnit.cabinets', icon: 'cabinet' },
  { key: 'cooker_hood', labelKey: 'propertyFacilities.inUnit.cooker_hood', icon: 'hood' },
  { key: 'air_conditioner', labelKey: 'propertyFacilities.inUnit.air_conditioner', icon: 'ac' },
  { key: 'dishwasher', labelKey: 'propertyFacilities.inUnit.dishwasher', icon: 'dishwasher' },
  { key: 'refrigerator', labelKey: 'propertyFacilities.inUnit.refrigerator', icon: 'fridge' },
  { key: 'water_heater', labelKey: 'propertyFacilities.inUnit.water_heater', icon: 'heater' },
  { key: 'microwave', labelKey: 'propertyFacilities.inUnit.microwave', icon: 'microwave' },
  { key: 'washing_machine', labelKey: 'propertyFacilities.inUnit.washing_machine', icon: 'washer' },
  { key: 'tv', labelKey: 'propertyFacilities.inUnit.tv', icon: 'tv' },
  { key: 'bed', labelKey: 'propertyFacilities.inUnit.bed', icon: 'bed' },
  { key: 'sofa', labelKey: 'propertyFacilities.inUnit.sofa', icon: 'sofa' },
  { key: 'wardrobe', labelKey: 'propertyFacilities.inUnit.wardrobe', icon: 'wardrobe' },
  { key: 'internet', labelKey: 'propertyFacilities.inUnit.internet', icon: 'wifi' },
  { key: 'pet_friendly', labelKey: 'propertyFacilities.inUnit.pet_friendly', icon: 'pet' },
]

/** ความสะดวกโดยรอบ / สิ่งอำนวยความสะดวกในโครงการ */
export const NEARBY_FACILITIES: PropertyFacilityOption[] = [
  { key: 'elevator', labelKey: 'propertyFacilities.nearby.elevator', icon: 'elevator' },
  { key: 'parking', labelKey: 'propertyFacilities.nearby.parking', icon: 'parking' },
  { key: 'motorcycle_parking', labelKey: 'propertyFacilities.nearby.motorcycle_parking', icon: 'moto_parking' },
  { key: 'jacuzzi', labelKey: 'propertyFacilities.nearby.jacuzzi', icon: 'jacuzzi' },
  { key: 'steam_room', labelKey: 'propertyFacilities.nearby.steam_room', icon: 'steam' },
  { key: 'sauna', labelKey: 'propertyFacilities.nearby.sauna', icon: 'sauna' },
  { key: 'fitness', labelKey: 'propertyFacilities.nearby.fitness', icon: 'fitness' },
  { key: 'swimming_pool', labelKey: 'propertyFacilities.nearby.swimming_pool', icon: 'pool' },
  { key: 'sports_court', labelKey: 'propertyFacilities.nearby.sports_court', icon: 'sports' },
  { key: 'garden', labelKey: 'propertyFacilities.nearby.garden', icon: 'garden' },
  { key: 'playground', labelKey: 'propertyFacilities.nearby.playground', icon: 'playground' },
  { key: 'library', labelKey: 'propertyFacilities.nearby.library', icon: 'library' },
  { key: 'meeting_room', labelKey: 'propertyFacilities.nearby.meeting_room', icon: 'meeting' },
  { key: 'convenience_store', labelKey: 'propertyFacilities.nearby.convenience_store', icon: 'store' },
  { key: 'restaurant', labelKey: 'propertyFacilities.nearby.restaurant', icon: 'restaurant' },
  { key: 'laundry', labelKey: 'propertyFacilities.nearby.laundry', icon: 'laundry' },
  { key: 'shuttle', labelKey: 'propertyFacilities.nearby.shuttle', icon: 'shuttle' },
  { key: 'security_24h', labelKey: 'propertyFacilities.nearby.security_24h', icon: 'security' },
  { key: 'cctv', labelKey: 'propertyFacilities.nearby.cctv', icon: 'cctv' },
  { key: 'access_control', labelKey: 'propertyFacilities.nearby.access_control', icon: 'keycard' },
  { key: 'ev_charger', labelKey: 'propertyFacilities.nearby.ev_charger', icon: 'ev' },
  { key: 'near_transit', labelKey: 'propertyFacilities.nearby.near_transit', icon: 'transit' },
  // legacy key — ข้อมูลเก่าที่บันทึกไว้ก่อนหน้า
  { key: 'elevator_lobby', labelKey: 'propertyFacilities.nearby.elevator_lobby', icon: 'elevator' },
]

const IN_UNIT_KEYS = new Set(IN_UNIT_FACILITIES.map(f => f.key))
const NEARBY_KEYS = new Set(NEARBY_FACILITIES.map(f => f.key))

export function isInUnitFacilityKey(key: string): key is InUnitFacilityKey {
  return IN_UNIT_KEYS.has(key)
}

export function isNearbyFacilityKey(key: string): key is NearbyFacilityKey {
  return NEARBY_KEYS.has(key)
}

export function resolveFacilityOptions(
  keys: string[] | null | undefined,
  catalog: PropertyFacilityOption[],
): PropertyFacilityOption[] {
  if (!keys?.length) return []
  const map = new Map(catalog.map(item => [item.key, item]))
  return keys.map(key => map.get(key)).filter((item): item is PropertyFacilityOption => Boolean(item))
}
