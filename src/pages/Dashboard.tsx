import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, DollarSign, Users, CalendarCheck, Sparkles } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Loading } from '@/components/ui/Loading'
import { BarChart } from '@/components/charts/BarChart'
import { PieChart } from '@/components/charts/PieChart'
import { LineChart } from '@/components/charts/LineChart'
import { formatCurrency } from '@/lib/utils'
import { useApp } from '@/context/AppContext'
import { getDashboardStats, getMonthlyData, getTopServices, getDailyCustomers } from '@/services/dashboard'
import { getRecentVisits } from '@/services/visits'
import type { DashboardStats, MonthlyData, TopService, DailyCustomers, Visit } from '@/types'
import { Link } from 'react-router-dom'
import { formatDateTime } from '@/lib/utils'

export function Dashboard() {
  const { settings } = useApp()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [topServices, setTopServices] = useState<TopService[]>([])
  const [dailyCustomers, setDailyCustomers] = useState<DailyCustomers[]>([])
  const [recentVisits, setRecentVisits] = useState<Visit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    try {
      setLoading(true)
      setError(null)
      const [s, m, t, d, rv] = await Promise.all([
        getDashboardStats(),
        getMonthlyData(),
        getTopServices(),
        getDailyCustomers(14),
        getRecentVisits(5),
      ])
      setStats(s)
      setMonthlyData(m)
      setTopServices(t)
      setDailyCustomers(d)
      setRecentVisits(rv)
    } catch (err) {
      setError('Failed to load dashboard data. Check your connection.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loading />
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
        <button onClick={loadDashboard} className="mt-4 text-pink-500 font-medium">Retry</button>
      </div>
    )
  }

  const c = settings.currency

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back! Here's your business overview.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={<DollarSign className="h-5 w-5 text-green-600" />}
          label="Today's Income"
          value={formatCurrency(stats?.todayIncome || 0, c)}
          bg="bg-green-50"
        />
        <StatCard
          icon={<DollarSign className="h-5 w-5 text-red-600" />}
          label="Today's Expenses"
          value={formatCurrency(stats?.todayExpenses || 0, c)}
          bg="bg-red-50"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5 text-pink-600" />}
          label="Today's Profit"
          value={formatCurrency(stats?.todayProfit || 0, c)}
          bg="bg-pink-50"
        />
        <StatCard
          icon={<Users className="h-5 w-5 text-blue-600" />}
          label="Total Customers"
          value={String(stats?.totalCustomers || 0)}
          bg="bg-blue-50"
        />
        <StatCard
          icon={<CalendarCheck className="h-5 w-5 text-purple-600" />}
          label="Total Visits"
          value={String(stats?.totalVisits || 0)}
          bg="bg-purple-50"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5 text-emerald-600" />}
          label="Monthly Income"
          value={formatCurrency(stats?.monthIncome || 0, c)}
          bg="bg-emerald-50"
        />
        <StatCard
          icon={<TrendingDown className="h-5 w-5 text-orange-600" />}
          label="Monthly Expenses"
          value={formatCurrency(stats?.monthExpenses || 0, c)}
          bg="bg-orange-50"
        />
        <StatCard
          icon={<Sparkles className="h-5 w-5 text-cyan-600" />}
          label="Monthly Profit"
          value={formatCurrency(stats?.monthProfit || 0, c)}
          bg="bg-cyan-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Income & Expenses</CardTitle>
          </CardHeader>
          <BarChart
            data={monthlyData}
            dataKeys={[
              { key: 'income', color: '#22c55e', name: 'Income' },
              { key: 'expenses', color: '#ef4444', name: 'Expenses' },
            ]}
          />
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Monthly Profit</CardTitle>
          </CardHeader>
          <BarChart
            data={monthlyData}
            dataKeys={[{ key: 'profit', color: '#ec4899', name: 'Profit' }]}
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Daily Customers</CardTitle>
          </CardHeader>
          <LineChart data={dailyCustomers} />
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Services</CardTitle>
          </CardHeader>
          <PieChart data={topServices.map((s) => ({ name: s.name, value: s.count }))} />
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Visits</CardTitle>
          <Link to="/visits" className="text-sm text-pink-500 font-medium">View all</Link>
        </CardHeader>
        <div className="space-y-3">
          {recentVisits.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">No visits yet</p>
          )}
          {recentVisits.map((visit) => (
            <div key={visit.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-900">{visit.customer?.name || 'Unknown'}</p>
                <p className="text-xs text-gray-500">{formatDateTime(visit.created_at)}</p>
              </div>
              <span className="text-sm font-semibold text-pink-600">
                {formatCurrency(visit.total_amount, c)}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  bg,
}: {
  icon: React.ReactNode
  label: string
  value: string
  bg: string
}) {
  return (
    <Card className={`${bg} border-0`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 mb-1">{label}</p>
          <p className="text-lg font-bold text-gray-900">{value}</p>
        </div>
        <div className="p-2 bg-white rounded-lg shadow-sm">{icon}</div>
      </div>
    </Card>
  )
}
