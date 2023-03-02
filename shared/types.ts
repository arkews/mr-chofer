import { ReactNode } from 'react'

export type Photo = {
  uri: string
  type: string
  name: string
}

export type Document = {
  uri: string
  type: string
  name: string
}

export type PaymentMethod = 'cash' | 'nequi'

export type PaymentOption = {
  name: string
  value: string
  icon?: ReactNode
}
