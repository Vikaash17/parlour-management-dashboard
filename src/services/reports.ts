import { supabase } from '@/lib/supabase'
import type { ReportFilters, MonthlyData, TopService } from '@/types'
import { getMonthlyData, getTopServices } from './dashboard'

export interface ReportData {
  income: number
  expenses: number
  profit: number
  customerCount: number
  visitCount: number
  topServices: TopService[]
  monthlyData: MonthlyData[]
}

export async function getReportData(filters: ReportFilters): Promise<ReportData> {
  let fromDate: string
  let toDate: string

  if (filters.period === 'custom' && filters.from && filters.to) {
    fromDate = new Date(filters.from).toISOString()
    toDate = new Date(filters.to + 'T23:59:59').toISOString()
  } else {
    const now = new Date()
    const getRange = () => {
      switch (filters.period) {
        case 'today': {
          const from = new Date(now.setHours(0, 0, 0, 0))
          return { from, to: new Date() }
        }
        case 'week': {
          const from = new Date(now)
          from.setDate(now.getDate() - now.getDay() + 1)
          from.setHours(0, 0, 0, 0)
          return { from, to: new Date() }
        }
        case 'month': {
          const from = new Date(now.getFullYear(), now.getMonth(), 1)
          return { from, to: new Date() }
        }
        default:
          return { from: new Date(), to: new Date() }
      }
    }
    const range = getRange()
    fromDate = range.from.toISOString()
    toDate = range.to.toISOString()
  }

  const startDate = fromDate.split('T')[0]
  const endDate = toDate.split('T')[0]

  const [{ data: visits }, { data: expenses }, { data: customers }, { count: visitCount }] =
    await Promise.all([
      supabase.from('visits').select('total_amount').gte('created_at', fromDate).lte('created_at', toDate),
      supabase.from('expenses').select('amount').gte('date', startDate).lte('date', endDate),
      supabase
        .from('visits')
        .select('customer_id')
        .gte('created_at', fromDate)
        .lte('created_at', toDate),
      supabase
        .from('visits')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', fromDate)
        .lte('created_at', toDate),
    ])

  const income = ((visits as { total_amount: number }[]) || []).reduce((s, v) => s + Number(v.total_amount), 0)
  const expenseTotal = ((expenses as { amount: number }[]) || []).reduce((s, v) => s + Number(v.amount), 0)
  const uniqueCustomers = new Set(((customers as { customer_id: string }[]) || []).map((v) => v.customer_id))

  const topServices = await getTopServices()
  const monthlyData = await getMonthlyData()

  return {
    income,
    expenses: expenseTotal,
    profit: income - expenseTotal,
    customerCount: uniqueCustomers.size,
    visitCount: visitCount || 0,
    topServices,
    monthlyData,
  }
}
