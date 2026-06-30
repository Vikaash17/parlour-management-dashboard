import { useState, useEffect } from 'react'
import { Download, FileSpreadsheet } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Loading } from '@/components/ui/Loading'
import { BarChart } from '@/components/charts/BarChart'
import { PieChart } from '@/components/charts/PieChart'
import { formatCurrency, downloadCSV, downloadExcel } from '@/lib/utils'
import { useApp } from '@/context/AppContext'
import { getReportData, type ReportData } from '@/services/reports'
import type { ReportFilters } from '@/types'

const periodOptions = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'custom', label: 'Custom Range' },
]

export function Reports() {
  const { settings } = useApp()
  const [filters, setFilters] = useState<ReportFilters>({ period: 'month' })
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReport()
  }, [filters])

  async function loadReport() {
    try {
      setLoading(true)
      const reportData = await getReportData(filters)
      setData(reportData)
    } catch {
      console.error('Failed to load report')
    } finally {
      setLoading(false)
    }
  }

  function exportCSV() {
    if (!data) return
    const rows = [
      { Metric: 'Income', Value: data.income },
      { Metric: 'Expenses', Value: data.expenses },
      { Metric: 'Profit', Value: data.profit },
      { Metric: 'Customers', Value: data.customerCount },
      { Metric: 'Visits', Value: data.visitCount },
    ]
    const periodLabel = filters.period === 'custom' ? `${filters.from}_to_${filters.to}` : filters.period
    downloadCSV(rows, `report_${periodLabel}`)
  }

  function exportExcel() {
    if (!data) return
    const rows = [
      { Metric: 'Income', Value: data.income },
      { Metric: 'Expenses', Value: data.expenses },
      { Metric: 'Profit', Value: data.profit },
      { Metric: 'Customers', Value: data.customerCount },
      { Metric: 'Visits', Value: data.visitCount },
    ]
    const periodLabel = filters.period === 'custom' ? `${filters.from}_to_${filters.to}` : filters.period
    downloadExcel(rows, `report_${periodLabel}`)
  }

  const c = settings.currency

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500 mt-1">Analyze your business performance</p>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full">
            <Select
              label="Period"
              value={filters.period}
              onChange={(e) => setFilters((prev) => ({ ...prev, period: e.target.value as ReportFilters['period'] }))}
              options={periodOptions}
            />
          </div>
          {filters.period === 'custom' && (
            <>
              <div className="flex-1 w-full">
                <Input
                  label="From"
                  type="date"
                  value={filters.from || ''}
                  onChange={(e) => setFilters((prev) => ({ ...prev, from: e.target.value }))}
                />
              </div>
              <div className="flex-1 w-full">
                <Input
                  label="To"
                  type="date"
                  value={filters.to || ''}
                  onChange={(e) => setFilters((prev) => ({ ...prev, to: e.target.value }))}
                />
              </div>
            </>
          )}
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={exportCSV}>
              <Download className="h-4 w-4" /> CSV
            </Button>
            <Button variant="secondary" size="sm" onClick={exportExcel}>
              <FileSpreadsheet className="h-4 w-4" /> Excel
            </Button>
          </div>
        </div>
      </Card>

      {loading ? (
        <Loading />
      ) : data ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <SummaryCard label="Income" value={formatCurrency(data.income, c)} color="text-green-600" />
            <SummaryCard label="Expenses" value={formatCurrency(data.expenses, c)} color="text-red-600" />
            <SummaryCard label="Profit" value={formatCurrency(data.profit, c)} color="text-pink-600" />
            <SummaryCard label="Customers" value={String(data.customerCount)} color="text-blue-600" />
            <SummaryCard label="Visits" value={String(data.visitCount)} color="text-purple-600" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Overview</CardTitle>
              </CardHeader>
              <BarChart
                data={data.monthlyData}
                dataKeys={[
                  { key: 'income', color: '#22c55e', name: 'Income' },
                  { key: 'expenses', color: '#ef4444', name: 'Expenses' },
                  { key: 'profit', color: '#ec4899', name: 'Profit' },
                ]}
              />
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Top Services</CardTitle>
              </CardHeader>
              <PieChart data={data.topServices.map((s) => ({ name: s.name, value: s.count }))} />
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Services Detail</CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 font-medium text-gray-500">Service</th>
                    <th className="text-right py-2 font-medium text-gray-500">Count</th>
                    <th className="text-right py-2 font-medium text-gray-500">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topServices.map((s, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="py-2 text-gray-900">{s.name}</td>
                      <td className="py-2 text-right text-gray-900">{s.count}</td>
                      <td className="py-2 text-right text-gray-900">{formatCurrency(s.revenue, c)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : null}
    </div>
  )
}

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <Card className="border-0 bg-gray-50">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
    </Card>
  )
}
