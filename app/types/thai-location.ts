export interface ThaiLocationValue {
  province: string
  district: string
  subdistrict: string
}

export const emptyThaiLocation = (): ThaiLocationValue => ({
  province: '',
  district: '',
  subdistrict: '',
})
