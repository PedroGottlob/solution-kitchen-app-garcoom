import { bffOperacional } from './api'

export type PaymentMethod = 'Pix' | 'CreditCard' | 'DebitCard' | 'Cash'

export interface CreatePaymentRequest {
  tableId: string
  amount: number
  method: PaymentMethod
}

export interface PaymentResponse {
  id: string
  tableId: string
  amount: number
  method: PaymentMethod
  status: 'Pending' | 'Confirmed' | 'Failed' | 'Cancelled'
  pixQrCode: string | null
  pixQrCodeBase64: string | null
  createdAt: string
  paidAt: string | null
}

export const paymentService = {
  async createPayment(data: CreatePaymentRequest): Promise<PaymentResponse> {
    const response = await bffOperacional.post<PaymentResponse>('/api/payments', data)
    return response.data
  },

  async getPaymentByTable(tableId: string): Promise<PaymentResponse | null> {
    try {
      const response = await bffOperacional.get<PaymentResponse>(`/api/payments/table/${tableId}`)
      return response.data
    } catch {
      return null
    }
  }
}