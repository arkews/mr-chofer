export type Payment = {
  driver_id: string
  payment_method: string
  amount: number
  status?: string

  created_at?: Date
  updated_at?: Date
}
