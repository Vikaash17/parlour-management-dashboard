export interface Customer {
  id: string
  name: string
  mobile: string
  gender: string
  address?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  name: string
  category: ServiceCategory
  price: number
  created_at: string
  updated_at: string
}

export type ServiceCategory =
  | 'Hair'
  | 'Skin'
  | 'Makeup'
  | 'Threading'
  | 'Nails'
  | 'Other'

export interface Visit {
  id: string
  customer_id: string
  total_amount: number
  remarks?: string | null
  created_at: string
  updated_at: string
  customer?: Customer
  visit_services?: VisitService[]
}

export interface VisitService {
  id: string
  visit_id: string
  service_id: string
  price: number
  service?: Service
}

export interface Expense {
  id: string
  date: string
  category: ExpenseCategory
  amount: number
  description?: string | null
  created_at: string
  updated_at: string
}

export type ExpenseCategory =
  | 'Rent'
  | 'Electricity'
  | 'Water'
  | 'Internet'
  | 'Product Purchase'
  | 'Maintenance'
  | 'Miscellaneous'

export interface Setting {
  id: string
  key: string
  value: string
  updated_at: string
}

export interface DashboardStats {
  todayIncome: number
  todayExpenses: number
  todayProfit: number
  monthIncome: number
  monthExpenses: number
  monthProfit: number
  totalCustomers: number
  totalVisits: number
}

export interface MonthlyData {
  month: string
  income: number
  expenses: number
  profit: number
}

export interface TopService {
  name: string
  count: number
  revenue: number
}

export interface DailyCustomers {
  date: string
  count: number
}

export interface ReportFilters {
  period: 'today' | 'week' | 'month' | 'custom'
  from?: string
  to?: string
}

export interface AppSettings {
  businessName: string
  ownerName: string
  currency: string
}
