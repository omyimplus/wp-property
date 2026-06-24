-- พิกัดปักหมุดแผนที่ (หลังบ้านอสังหาฯ + ฝากขาย)
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS latitude double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision;

ALTER TABLE property_customers
  ADD COLUMN IF NOT EXISTS latitude double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision;

COMMENT ON COLUMN properties.latitude IS 'ละติจูดจากการปักหมุดแผนที่';
COMMENT ON COLUMN properties.longitude IS 'ลองจิจูดจากการปักหมุดแผนที่';
