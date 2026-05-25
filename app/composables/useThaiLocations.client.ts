import type { ThaiAddressRow } from '@riz007/thai-address-data'
import addressData from '@riz007/thai-address-data/data.json'
import {
  buildThaiLocationTree,
  districtsForProvince,
  optionsWithCurrent,
  subdistrictsForDistrict,
  type ThaiLocationTree,
} from '~/utils/thai-locations'

const tree: ThaiLocationTree = buildThaiLocationTree(addressData as ThaiAddressRow[])

export function useThaiLocations() {
  const provinces = tree.provinces

  function provinceOptions(current: string) {
    return optionsWithCurrent(provinces, current)
  }

  function districtOptions(province: string, current: string) {
    return optionsWithCurrent(districtsForProvince(tree, province), current)
  }

  function subdistrictOptions(province: string, district: string, current: string) {
    return optionsWithCurrent(subdistrictsForDistrict(tree, province, district), current)
  }

  return {
    ready: true as const,
    provinceOptions,
    districtOptions,
    subdistrictOptions,
  }
}
