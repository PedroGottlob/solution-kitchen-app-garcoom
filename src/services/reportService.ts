import { bffOperacional } from './api'

export interface TopItem {
  name: string
  quantity: number
  revenue: number
  price?: number
  cost?: number
}

export interface ReportMetrics {
  revenue: number
  orderCount: number
  averageTicket: number
  topItems: TopItem[]
}

export interface WeeklyReport {
  analysis: string
  currentWeek: ReportMetrics
  previousWeek: ReportMetrics
  generatedAt: string
}

export const reportService = {
  async getWeeklyReport(): Promise<WeeklyReport> {
    const { data } = await bffOperacional.get<WeeklyReport>('/api/reports/weekly')
    return data
  },
}