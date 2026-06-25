import { bffOperacional } from './api'

export interface DashboardData {
  revenueToday: number
  revenueYesterday: number
  revenueThisWeek: number
  revenueThisMonth: number
  revenueLastMonth: number
  ordersToday: number
  ordersThisMonth: number
  averageTicketToday: number
  averageTicketThisMonth: number
  revenueTodayVsYesterdayPercent: number
  revenueThisMonthVsLastMonthPercent: number
  ordersByStatus: Record<string, number>
  topItems: { name: string; quantitySold: number; totalRevenue: number }[]
  salesByHour: { hour: number; orderCount: number; revenue: number }[]
  salesByDayOfWeek: { dayOfWeek: string; orderCount: number; revenue: number }[]
}

export async function getDashboard(): Promise<DashboardData> {
  const response = await bffOperacional.get('/api/dashboard')
  return response.data
}