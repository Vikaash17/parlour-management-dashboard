import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Modal } from '@/components/ui/Modal'
import { SearchInput } from '@/components/ui/SearchInput'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { Loading } from '@/components/ui/Loading'
import { getExpenses, createExpense, updateExpense, deleteExpense } from '@/services/expenses'
import { formatDate, formatCurrency } from '@/lib/utils'
import { useApp } from '@/context/AppContext'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Expense } from '@/types'

const expenseSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  category: z.string().min(1, 'Category is required'),
  amount: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Amount must be positive'),
  description: z.string().optional(),
})

interface ExpenseForm {
  date: string
  category: string
  amount: string
  description?: string
}

const categoryOptions = [
  { value: 'Rent', label: 'Rent' },
  { value: 'Electricity', label: 'Electricity' },
  { value: 'Water', label: 'Water' },
  { value: 'Internet', label: 'Internet' },
  { value: 'Product Purchase', label: 'Product Purchase' },
  { value: 'Maintenance', label: 'Maintenance' },
  { value: 'Miscellaneous', label: 'Miscellaneous' },
]

const catColors: Record<string, string> = {
  Rent: 'bg-red-100 text-red-700',
  Electricity: 'bg-yellow-100 text-yellow-700',
  Water: 'bg-blue-100 text-blue-700',
  Internet: 'bg-purple-100 text-purple-700',
  'Product Purchase': 'bg-green-100 text-green-700',
  Maintenance: 'bg-orange-100 text-orange-700',
  Miscellaneous: 'bg-gray-100 text-gray-700',
}

export function Expenses() {
  const { settings } = useApp()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editing, setEditing] = useState<Expense | null>(null)
  const [deleting, setDeleting] = useState<Expense | null>(null)
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExpenseForm>({
    resolver: zodResolver(expenseSchema) as any,
  })

  useEffect(() => {
    loadExpenses()
  }, [search])

  async function loadExpenses() {
    try {
      setLoading(true)
      const data = await getExpenses(search || undefined)
      setExpenses(data)
    } catch {
      console.error('Failed to load expenses')
    } finally {
      setLoading(false)
    }
  }

  function openAdd() {
    setEditing(null)
    reset({ date: new Date().toISOString().split('T')[0], category: '', amount: '', description: '' })
    setModalOpen(true)
  }

  function openEdit(expense: Expense) {
    setEditing(expense)
    reset({
      date: expense.date.split('T')[0],
      category: expense.category,
      amount: String(expense.amount),
      description: expense.description || '',
    })
    setModalOpen(true)
  }

  async function onSubmit(data: ExpenseForm) {
    try {
      setSaving(true)
      const payload = { date: data.date, category: data.category, amount: Number(data.amount), description: data.description }
      if (editing) {
        await updateExpense(editing.id, payload as any)
      } else {
        await createExpense(payload as any)
      }
      setModalOpen(false)
      loadExpenses()
    } catch {
      console.error('Failed to save expense')
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    if (!deleting) return
    try {
      setSaving(true)
      await deleteExpense(deleting.id)
      setDeleteOpen(false)
      setDeleting(null)
      loadExpenses()
    } catch {
      console.error('Failed to delete expense')
    } finally {
      setSaving(false)
    }
  }

  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-sm text-gray-500 mt-1">
            Total: {formatCurrency(totalExpenses, settings.currency)}
          </p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>

      <SearchInput value={search} onChange={setSearch} placeholder="Search by category or description..." />

      {loading ? (
        <Loading />
      ) : expenses.length === 0 ? (
        <EmptyState
          title="No expenses found"
          description={search ? 'Try a different search term' : 'Add your first expense'}
        />
      ) : (
        <div className="space-y-3">
          {expenses.map((expense) => (
            <Card key={expense.id}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${catColors[expense.category] || 'bg-gray-100'}`}>
                      {expense.category}
                    </span>
                    <span className="text-xs text-gray-400">{formatDate(expense.date)}</span>
                  </div>
                  {expense.description && (
                    <p className="text-sm text-gray-600 mt-1">{expense.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-red-500">
                    {formatCurrency(expense.amount, settings.currency)}
                  </span>
                  <button onClick={() => openEdit(expense)} className="p-2 rounded-lg hover:bg-gray-100">
                    <Pencil className="h-4 w-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => {
                      setDeleting(expense)
                      setDeleteOpen(true)
                    }}
                    className="p-2 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Expense' : 'Add Expense'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Date" id="date" type="date" error={errors.date?.message} {...register('date')} />
          <Select
            label="Category"
            id="category"
            options={categoryOptions}
            placeholder="Select category"
            error={errors.category?.message}
            {...register('category')}
          />
          <Input label="Amount" id="amount" type="number" step="0.01" error={errors.amount?.message} {...register('amount')} />
          <Textarea label="Description (Optional)" id="description" {...register('description')} />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {editing ? 'Update' : 'Add'} Expense
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Expense"
        message={`Are you sure you want to delete this expense?`}
        loading={saving}
      />
    </div>
  )
}
