import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, ArrowLeft } from 'lucide-react'
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
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '@/services/customers'
import { getCustomerVisits } from '@/services/visits'
import { formatDate, formatCurrency } from '@/lib/utils'
import { useApp } from '@/context/AppContext'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Customer, Visit } from '@/types'

const customerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  mobile: z.string().min(10, 'Invalid mobile number').max(15, 'Invalid mobile number'),
  gender: z.string().min(1, 'Gender is required'),
  address: z.string().optional(),
  notes: z.string().optional(),
})

type CustomerForm = z.infer<typeof customerSchema>

const genderOptions = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' },
]

export function Customers() {
  const { settings } = useApp()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editing, setEditing] = useState<Customer | null>(null)
  const [deleting, setDeleting] = useState<Customer | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [visitHistory, setVisitHistory] = useState<Visit[]>([])
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
  })

  useEffect(() => {
    loadCustomers()
  }, [search])

  async function loadCustomers() {
    try {
      setLoading(true)
      const data = await getCustomers(search || undefined)
      setCustomers(data)
    } catch {
      console.error('Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  function openAdd() {
    setEditing(null)
    reset({ name: '', mobile: '', gender: '', address: '', notes: '' })
    setModalOpen(true)
  }

  function openEdit(customer: Customer) {
    setEditing(customer)
    reset({
      name: customer.name,
      mobile: customer.mobile,
      gender: customer.gender,
      address: customer.address || '',
      notes: customer.notes || '',
    })
    setModalOpen(true)
  }

  async function onSubmit(data: CustomerForm) {
    try {
      setSaving(true)
      if (editing) {
        await updateCustomer(editing.id, data)
      } else {
        await createCustomer(data)
      }
      setModalOpen(false)
      loadCustomers()
    } catch {
      console.error('Failed to save customer')
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    if (!deleting) return
    try {
      setSaving(true)
      await deleteCustomer(deleting.id)
      setDeleteOpen(false)
      setDeleting(null)
      if (selectedCustomer?.id === deleting.id) setSelectedCustomer(null)
      loadCustomers()
    } catch {
      console.error('Failed to delete customer')
    } finally {
      setSaving(false)
    }
  }

  async function viewProfile(customer: Customer) {
    setSelectedCustomer(customer)
    const visits = await getCustomerVisits(customer.id)
    setVisitHistory(visits)
  }

  if (selectedCustomer) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedCustomer(null)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Customers
        </button>
        <Card>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-900">{selectedCustomer.name}</h2>
            <p className="text-sm text-gray-500">{selectedCustomer.mobile}</p>
            <p className="text-sm text-gray-500">{selectedCustomer.gender}</p>
            {selectedCustomer.address && <p className="text-sm text-gray-500">{selectedCustomer.address}</p>}
            {selectedCustomer.notes && <p className="text-sm text-gray-400 italic">{selectedCustomer.notes}</p>}
          </div>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Visit History ({visitHistory.length})</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            {visitHistory.length === 0 && <EmptyState title="No visits yet" />}
            {visitHistory.map((visit) => (
              <div key={visit.id} className="border-b border-gray-50 pb-3 last:border-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium">{formatDate(visit.created_at)}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {visit.visit_services?.map((vs) => (
                        <span key={vs.id} className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                          {vs.service?.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-pink-600">
                    {formatCurrency(visit.total_amount, settings.currency)}
                  </span>
                </div>
                {visit.remarks && <p className="text-xs text-gray-400 mt-1">{visit.remarks}</p>}
              </div>
            ))}
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500 mt-1">{customers.length} total customers</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>

      <SearchInput value={search} onChange={setSearch} placeholder="Search by name or mobile..." />

      {loading ? (
        <Loading />
      ) : customers.length === 0 ? (
        <EmptyState
          title="No customers found"
          description={search ? 'Try a different search term' : 'Add your first customer'}
        />
      ) : (
        <div className="space-y-3">
          {customers.map((customer) => (
            <Card key={customer.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => viewProfile(customer)}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{customer.name}</p>
                  <p className="text-sm text-gray-500">{customer.mobile}</p>
                </div>
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => openEdit(customer)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                  >
                    <Pencil className="h-4 w-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => {
                      setDeleting(customer)
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Customer' : 'Add Customer'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Name" id="name" error={errors.name?.message} {...register('name')} />
          <Input label="Mobile" id="mobile" error={errors.mobile?.message} {...register('mobile')} />
          <Select
            label="Gender"
            id="gender"
            options={genderOptions}
            placeholder="Select gender"
            error={errors.gender?.message}
            {...register('gender')}
          />
          <Textarea label="Address (Optional)" id="address" {...register('address')} />
          <Textarea label="Notes (Optional)" id="notes" {...register('notes')} />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {editing ? 'Update' : 'Add'} Customer
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Customer"
        message={`Are you sure you want to delete ${deleting?.name}? This will also delete all their visits.`}
        loading={saving}
      />
    </div>
  )
}
