import { supabase } from '@/lib/supabase'
import { startOfDay, endOfDay, startOfMonth, endOfMonth, format } from 'date-fns'
import type { DashboardStats, MonthlyData, TopService, DailyCustomers } from '@/types'

export async function getDashboardStats(): Promise<DashboardStats> {
  const now = new Date()
  const todayStart = startOfDay(now).toISOString()
  const todayEnd = endOfDay(now).toISOString()
  const monthStart = startOfMonth(now).toISOString()
  const monthEnd = endOfMonth(now).toISOString()

  const [
    { count: totalCustomers },
    { count: totalVisits },
    { data: todayVisits },
    { data: todayExpenses },
    { data: monthVisits },
    { data: monthExpenses },
  ] = await Promise.all([
    supabase.from('customers').select('*', { count: 'exact', head: true }),
    supabase.from('visits').select('*', { count: 'exact', head: true }),
    supabase.from('visits').select('total_amount').gte('created_at', todayStart).lte('created_at', todayEnd),
    supabase.from('expenses').select('amount').gte('date', todayStart).lte('date', todayEnd),
    supabase.from('visits').select('total_amount').gte('created_at', monthStart).lte('created_at', monthEnd),
    supabase.from('expenses').select('amount').gte('date', monthStart).lte('date', monthEnd),
  ])

  const todayIncome = (todayVisits as { total_amount: number }[] || []).reduce((s, v) => s + Number(v.total_amount), 0)
  const todayExpenseTotal = (todayExpenses as { amount: number }[] || []).reduce((s, v) => s + Number(v.amount), 0)
  const monthIncome = (monthVisits as { total_amount: number }[] || []).reduce((s, v) => s + Number(v.total_amount), 0)
  const monthExpenseTotal = (monthExpenses as { amount: number }[] || []).reduce((s, v) => s + Number(v.amount), 0)

  return {
    todayIncome,
    todayExpenses: todayExpenseTotal,
    todayProfit: todayIncome - todayExpenseTotal,
    monthIncome,
    monthExpenses: monthExpenseTotal,
    monthProfit: monthIncome - monthExpenseTotal,
    totalCustomers: totalCustomers || 0,
    totalVisits: totalVisits || 0,
  }
}

export async function getMonthlyData(year?: number): Promise<MonthlyData[]> {
  const y = year || new Date().getFullYear()
  const start = `${y}-01-01`
  const end = `${y}-12-31`

  const [{ data: visits }, { data: expenses }] = await Promise.all([
    supabase.from('visits').select('total_amount, created_at').gte('created_at', start).lte('created_at', end).order('created_at'),
    supabase.from('expenses').select('amount, date').gte('date', start).lte('date', end).order('date'),
  ])

  const months = Array.from({ length: 12 }, (_, i) => {
    const m = format(new Date(y, i), 'MMM')
    const income = (visits as { total_amount: number; created_at: string }[] || [])
      .filter((v) => new Date(v.created_at).getMonth() === i)
      .reduce((s, v) => s + Number(v.total_amount), 0)
    const monthExpenses = (expenses as { amount: number; date: string }[] || [])
      .filter((e) => new Date(e.date).getMonth() === i)
      .reduce((s, v) => s + Number(v.amount), 0)

    return { month: m, income, expenses: monthExpenses, profit: income - monthExpenses }
  })

  return months
}

export async function getTopServices(limit = 5): Promise<TopService[]> {
  const { data } = await supabase
    .from('visit_services')
    .select('service_id, price, service:services(name)')
    .limit(1000)

  const grouped = new Map<string, { name: string; count: number; revenue: number }>()
  for (const vs of (data as any[]) || []) {
    const id = vs.service_id
    const existing = grouped.get(id) || { name: vs.service?.name || 'Unknown', count: 0, revenue: 0 }
    existing.count++
    existing.revenue += Number(vs.price)
    grouped.set(id, existing)
  }

  return Array.from(grouped.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

export async function getDailyCustomers(days = 30): Promise<DailyCustomers[]> {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - days)

  const { data } = await supabase
    .from('visits')
    .select('customer_id, created_at')
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString())
    .order('created_at')

  const grouped = new Map<string, number>()
  for (const v of (data as { customer_id: string; created_at: string }[]) || []) {
    const date = format(new Date(v.created_at), 'yyyy-MM-dd')
    grouped.set(date, (grouped.get(date) || 0) + 1)
  }

  const result: DailyCustomers[] = []
  for (let i = days; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = format(d, 'yyyy-MM-dd')
    result.push({ date: format(d, 'dd MMM'), count: grouped.get(dateStr) || 0 })
  }

  return result
}
