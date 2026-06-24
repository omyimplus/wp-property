import type { PropertyFacilityIcon } from '~/data/property-facilities'

/** ไอคอนสำหรับสเปกทรัพย์ / UI ทั่วไป (นอกเหนือจากสิ่งอำนวยความสะดวก) */
export type PropertySpecIcon =
  | 'bedroom'
  | 'bathroom'
  | 'usable_area'
  | 'land_area'
  | 'calendar'
  | 'description'
  | 'location'
  | 'building'
  | 'floor_level'
  | 'compass'
  | 'tag'
  | 'hash'
  | 'age'

export type PropertyIconName = PropertyFacilityIcon | PropertySpecIcon

/**
 * เนื้อหา SVG ภายใน viewBox 0 0 24 24
 * สไตล์เดียวกัน: stroke currentColor, stroke-width 2, round caps
 */
export const PROPERTY_ICON_PATHS: Record<PropertyIconName, string> = {
  // —— สเปกทรัพย์ ——
  bedroom:
    '<path d="M3 19h18"/><path d="M4 19V7h4.5v12"/><path d="M8.5 12.5h12"/><path d="M9 10.5a2.5 2.5 0 015 0V19H9V10.5z"/><path d="M4 19v1.5M20 19v1.5"/>',
  bathroom:
    '<rect x="7.5" y="4" width="9" height="5.5" rx="1"/><ellipse cx="12" cy="11.5" rx="4.5" ry="1.25"/><path d="M7.5 11.5v3.5a4.5 2.75 0 009 0v-3.5"/>',
  usable_area:
    '<path d="M4 8V4h4"/><path d="M4 16v4h4"/><path d="M16 4h4v4"/><path d="M16 20h4v-4"/><rect x="9" y="9" width="6" height="6" rx="0.5"/>',
  land_area:
    '<path d="M4 20h16"/><path d="M6 16l3-6 3 4 3-8 3 10"/><path d="M4 20V8l4-3 4 2 4-4 4 3v14"/>',
  calendar:
    '<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M8 3v4M16 3v4M4 11h16"/><path d="M12 14v3l1.5 1.5"/>',
  description:
    '<path d="M7 6h10v2a1 1 0 01-1 1H8a1 1 0 01-1-1V6z"/><rect x="6" y="10" width="12" height="8" rx="1"/>',
  location:
    '<path d="M12 21s6-5.2 6-10a6 6 0 10-12 0c0 4.8 6 10 6 10z"/><circle cx="12" cy="11" r="2.5"/>',
  building:
    '<rect x="6" y="3" width="12" height="18" rx="1"/><path d="M10 7h1M13 7h1M10 11h1M13 11h1M10 15h1M13 15h1"/><path d="M9 21v-3h6v3"/>',
  floor_level:
    '<path d="M6 20V4l6-2 6 2v16"/><path d="M9 10h6M9 14h6M9 18h6"/>',
  compass:
    '<circle cx="12" cy="12" r="8"/><path d="M12 8l2 4-4 2 2-6z"/><path d="M12 4v1M12 19v1M4 12h1M19 12h1"/>',
  tag:
    '<path d="M5 5h6l8 8-6 6-8-8V5z"/><circle cx="9" cy="9" r="1" fill="currentColor" stroke="none"/>',
  hash:
    '<path d="M10 4l-2 16M16 4l-2 16M5 9h14M4 15h14"/>',
  age:
    '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',

  // —— ในห้อง ——
  cabinet:
    '<rect x="5" y="4" width="14" height="16" rx="1.5"/><path d="M5 12h14M12 4v16"/>',
  hood:
    '<path d="M4 10h16"/><path d="M6 10V7a2 2 0 012-2h8a2 2 0 012 2v3"/><path d="M8 14h8v3H8z"/>',
  ac:
    '<rect x="4" y="7" width="16" height="10" rx="2"/><path d="M8 12h8M12 9v6"/>',
  dishwasher:
    '<rect x="5" y="4" width="14" height="16" rx="2"/><circle cx="12" cy="13" r="4"/><circle cx="12" cy="13" r="1.5" fill="currentColor" stroke="none"/>',
  fridge:
    '<rect x="7" y="3" width="10" height="18" rx="1.5"/><path d="M7 11h10M10 7v2M10 15v2"/>',
  heater:
    '<path d="M12 3v18"/><path d="M8 7l4-4 4 4"/><path d="M8 17l4 4 4-4"/>',
  microwave:
    '<rect x="4" y="7" width="16" height="10" rx="2"/><rect x="7" y="10" width="7" height="4" rx="0.5"/><circle cx="17" cy="12" r="1" fill="currentColor" stroke="none"/>',
  washer:
    '<rect x="5" y="4" width="14" height="16" rx="2"/><circle cx="12" cy="13" r="4.5"/><path d="M9 13a3 3 0 016 0"/>',
  tv:
    '<rect x="4" y="6" width="16" height="11" rx="1.5"/><path d="M9 20h6"/>',
  bed:
    '<path d="M3 19h18"/><path d="M4 19V7h4.5v12"/><path d="M8.5 12.5h12"/><path d="M9 10.5a2.5 2.5 0 015 0V19H9V10.5z"/><path d="M4 19v1.5M20 19v1.5"/>',
  sofa:
    '<path d="M5 12h14v5H5z"/><path d="M7 12V9h10v3"/><path d="M5 17v2M19 17v2"/>',
  wardrobe:
    '<rect x="6" y="3" width="12" height="18" rx="1.5"/><path d="M12 3v18M9 9h6"/>',
  wifi:
    '<path d="M5 12.5a10 10 0 0114 0"/><path d="M8.5 15.5a5.5 5.5 0 017 0"/><circle cx="12" cy="19" r="0.75" fill="currentColor" stroke="none"/>',
  pet:
    '<circle cx="8.5" cy="9" r="1.25" fill="currentColor" stroke="none"/><circle cx="12" cy="7" r="1.25" fill="currentColor" stroke="none"/><circle cx="15.5" cy="9" r="1.25" fill="currentColor" stroke="none"/><path d="M6.5 12.5c0 3.5 2.5 5.5 5.5 5.5s5.5-2 5.5-5.5"/>',

  // —— โครงการ / โดยรอบ ——
  cctv:
    '<rect x="3" y="8" width="12" height="8" rx="1.5"/><path d="M15 11l6-3v12l-6-3"/><circle cx="9" cy="12" r="2"/>',
  elevator:
    '<rect x="7" y="3" width="10" height="18" rx="1.5"/><path d="M12 8v8"/><path d="M9.5 10.5L12 8l2.5 2.5"/><path d="M9.5 13.5L12 16l2.5-2.5"/>',
  parking:
    '<path d="M3 15h18"/><path d="M4.5 15l2-5.5h2.5l1 2h3l1-2h2.5l2 5.5"/><circle cx="7.5" cy="15" r="2.25" fill="currentColor" stroke="none"/><circle cx="16.5" cy="15" r="2.25" fill="currentColor" stroke="none"/><path d="M9.5 9.5h2.5"/>',
  moto_parking:
    '<circle cx="7.5" cy="17" r="2"/><circle cx="16.5" cy="17" r="2"/><path d="M5.5 17h2l1.5-4.5h5l1.5 4.5h2"/><path d="M9 12.5l1.5-3h3l1.5 3"/>',
  jacuzzi:
    '<path d="M5 14c0-4 3.5-6 7-6s7 2 7 6"/><path d="M5 14v2c0 2 3 3 7 3s7-1 7-3v-2"/><circle cx="9" cy="10" r="0.6" fill="currentColor" stroke="none"/><circle cx="12" cy="9" r="0.6" fill="currentColor" stroke="none"/><circle cx="15" cy="10" r="0.6" fill="currentColor" stroke="none"/>',
  steam:
    '<path d="M8 20c0-2.5 1.5-4.5 0-7"/><path d="M12 20c0-2.5 1.5-4.5 0-7"/><path d="M16 20c0-2.5 1.5-4.5 0-7"/>',
  sauna:
    '<rect x="5" y="6" width="14" height="14" rx="1.5"/><path d="M5 10h14"/><path d="M8 14h2M14 14h2"/><path d="M12 6V4"/>',
  fitness:
    '<path d="M4 12h4l1.5-4 3 8 1.5-4h4"/>',
  pool:
    '<path d="M4 14c2 1 4-1 6 0s4-1 6 0 4-1 6 0"/><path d="M6 10c1.5-2 4-2 6 0"/><path d="M4 17h16"/>',
  sports:
    '<circle cx="12" cy="12" r="8"/><path d="M4 12h16"/><path d="M12 4a12 12 0 000 16"/><path d="M12 4a12 12 0 010 16"/>',
  garden:
    '<path d="M12 20V10"/><path d="M8 14c-2-3-1-7 4-7"/><path d="M16 14c2-3 1-7-4-7"/><path d="M4 20h16"/>',
  playground:
    '<circle cx="8" cy="7" r="2"/><path d="M8 9v4"/><path d="M6 20l2-7h8l2 7"/><path d="M10 13h4"/>',
  library:
    '<path d="M5 5h3.5v14H5z"/><path d="M10.25 5H13.75v14h-3.5z"/><path d="M15.5 8H19v11h-3.5z"/>',
  meeting:
    '<rect x="4" y="11" width="16" height="5" rx="1"/><circle cx="8" cy="8" r="2"/><circle cx="16" cy="8" r="2"/><circle cx="12" cy="6" r="2"/>',
  store:
    '<path d="M5 10l2-6h10l2 6"/><path d="M5 10h14v10H5z"/><path d="M9 14h6"/>',
  restaurant:
    '<path d="M7 4v8"/><path d="M5 4v3"/><path d="M9 4v3"/><path d="M7 12v8"/><path d="M17 4v16"/><path d="M15 8h4"/>',
  laundry:
    '<path d="M6 4h12l1 3H5l1-3z"/><path d="M5 7h14v13H5z"/><circle cx="12" cy="14" r="4"/><path d="M10 14a2 2 0 014 0"/>',
  shuttle:
    '<rect x="4" y="8" width="16" height="8" rx="2"/><path d="M4 13h16"/><circle cx="8" cy="18" r="1.5" fill="currentColor" stroke="none"/><circle cx="16" cy="18" r="1.5" fill="currentColor" stroke="none"/>',
  security:
    '<path d="M12 3l8 4v6c0 4.5-3.5 7.5-8 8-4.5-.5-8-3.5-8-8V7l8-4z"/><path d="M9.5 12l2 2 4-4"/>',
  keycard:
    '<rect x="4" y="7" width="16" height="10" rx="2"/><rect x="7" y="10" width="5" height="4" rx="0.5"/><path d="M14 11h3M14 14h2"/>',
  ev:
    '<path d="M13 4L8 14h4l-1 6 7-12h-4l1-4z"/>',
  transit:
    '<rect x="5" y="5" width="14" height="12" rx="2"/><path d="M5 11h14"/><circle cx="8" cy="15" r="1" fill="currentColor" stroke="none"/><circle cx="16" cy="15" r="1" fill="currentColor" stroke="none"/><path d="M9 8h6"/>',
}

export function hasPropertyIcon(name: string): name is PropertyIconName {
  return name in PROPERTY_ICON_PATHS
}
