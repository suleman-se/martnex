export interface AddressInput {
  first_name: string
  last_name: string
  address_1: string
  address_2?: string
  city: string
  country_code: string
  postal_code: string
  phone?: string
  is_default_shipping?: boolean
  is_default_billing?: boolean
}

export interface CustomerAddress extends AddressInput {
  id: string
}

export interface CustomerProfile {
  email: string
  first_name?: string
  last_name?: string
  phone?: string
  addresses?: CustomerAddress[]
}
