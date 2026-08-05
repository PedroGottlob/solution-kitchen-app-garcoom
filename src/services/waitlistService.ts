import { bffOperacional } from './api'

export interface WaitlistEntry {
  id: string
  ticketNumber: number
  customerName: string
  partySize: number
  status: 'Waiting' | 'Called' | 'Seated' | 'Cancelled'
  createdAt: string
  calledAt?: string
}

export interface CreateWaitlistEntryPayload {
  customerName: string
  partySize: number
}

export const waitlistService = {
  async getWaitlist(includeResolved = false): Promise<WaitlistEntry[]> {
    const { data } = await bffOperacional.get<WaitlistEntry[]>(`/api/waitlist?includeResolved=${includeResolved}`)
    return data
  },
  async createEntry(payload: CreateWaitlistEntryPayload): Promise<WaitlistEntry> {
    const { data } = await bffOperacional.post<WaitlistEntry>('/api/waitlist', payload)
    return data
  },
  async callEntry(entryId: string): Promise<void> {
    await bffOperacional.patch(`/api/waitlist/${entryId}/call`)
  },
  async seatEntry(entryId: string): Promise<void> {
    await bffOperacional.patch(`/api/waitlist/${entryId}/seat`)
  },
  async cancelEntry(entryId: string): Promise<void> {
    await bffOperacional.patch(`/api/waitlist/${entryId}/cancel`)
  },
}