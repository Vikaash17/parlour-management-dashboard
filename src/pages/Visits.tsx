import { useState, useEffect } from 'react'
import { Plus, Trash2, Search } from 'lucide-react'
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
import { getVisits, createVisit, deleteVisit } from '@/services/visits'
import { getCustomers, createCustomer } from '@/services/customers'
import { getServices } from '@/services/services'
import { formatDate, formatDateTime, formatCurrency } from '@/lib/utils'
import { useApp } from '@/context/AppContext'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Visit, Customer, Service } from '@/types'

const visitSchema = z.object({
  customer_id: z.string().min(1, 'Please select a customer'),
  remarks: z.string().optional(),
})

type VisitForm = z.infer<typeof visitSchema>

const quickCustomerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  mobile: z.string().min(10, 'Invalid mobile'),
  gender: z.string().min(1, 'Gender is required'),
})

const genderOptions = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' },
]

export function Visits() {
  const { settings } = useApp()
  const [visits, setVisits] = useState<Visit[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState<Visit | null>(null)
  const [saving, setSaving] = useState(false)

  const [customers, setCustomers] = useState<Customer[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [customerSearch, setCustomerSearch] = useState('')
  const [showNewCustomer, setShowNewCustomer] = useState(false)
  const [selectedServices, setSelectedServices] = useState<{ service_id: string; name: string; price: number }[]>([])
  const [quickName, setQuickName] = useState('')
  const [quickMobile, setQuickMobile] = useState('')
  const [quickGender, setQuickGender] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<VisitForm>({
    resolver: zodResolver(visitSchema),
  })

  useEffect(() => {
    loadVisits()
  }, [search])

  async function loadVisits() {
    try {
      setLoading(true)
      const data = await getVisits(search || undefined)
      setVisits(data)
    } catch {
      console.error('Failed to load visits')
    } finally {
      setLoading(false)
    }
  }

  async function openNewVisit() {
    setShowNewCustomer(false)
    setSelectedServices([])
    setQuickName('')
    setQuickMobile('')
    setQuickGender('')
    setCustomerSearch('')
    reset({ customer_id: '', remarks: '' })
    const [c, s] = await Promise.all([getCustomers(), getServices()])
    setCustomers(c)
    setServices(s)
    setModalOpen(true)
  }

  function toggleService(service: Service) {
    setSelectedServices((prev) => {
      const exists = prev.find((s) => s.service_id === service.id)
      if (exists) {
        return prev.filter((s) => s.service_id !== service.id)
      }
      return [...prev, { service_id: service.id, name: service.name, price: service.price }]
    })
  }

  const totalAmount = selectedServices.reduce((sum, s) => sum + s.price, 0)

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.mobile.includes(customerSearch),
  )

  async function onSubmit(data: VisitForm) {
    if (selectedServices.length === 0) {
      alert('Please select at least one service')
      return
    }
    try {
      setSaving(true)
      let customerId = data.customer_id

      if (showNewCustomer) {
        const newCustomer = await createCustomer({
          name: quickName,
          mobile: quickMobile,
          gender: quickGender,
          address: null,
          notes: null,
        })
        if (newCustomer) customerId = newCustomer.id
      }

      if (!customerId) {
        alert('Please select a customer')
        return
      }

      await createVisit(
        customerId,
        selectedServices.map((s) => ({ service_id: s.service_id, price: s.price })),
        totalAmount,
        data.remarks,
      )
      setModalOpen(false)
      loadVisits()
    } catch {
      alert('Failed to create visit')
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    if (!deleting) return
    try {
      setSaving(true)
      await deleteVisit(deleting.id)
      setDeleteOpen(false)
      setDeleting(null)
      loadVisits()
    } catch {
      console.error('Failed to delete visit')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Visits</h1>
          <p className="text-sm text-gray-500 mt-1">{visits.length} recent visits</p>
        </div>
        <Button onClick={openNewVisit}>
          <Plus className="h-4 w-4" /> New Visit
        </Button>
      </div>

      <SearchInput value={search} onChange={setSearch} placeholder="Search by customer name..." />

      {loading ? (
        <Loading />
      ) : visits.length === 0 ? (
        <EmptyState title="No visits found" description="Create your first visit" />
      ) : (
        <div className="space-y-3">
          {visits.map((visit) => (
            <Card key={visit.id}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{visit.customer?.name || 'Unknown'}</p>
                    <span className="text-xs text-gray-400">{formatDate(visit.created_at)}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {visit.visit_services?.map((vs) => (
                      <span key={vs.id} className="text-xs bg-pink-50 text-pink-600 px-2 py-0.5 rounded-full">
                        {vs.service?.name}
                      </span>
                    ))}
                  </div>
                  {visit.remarks && <p className="text-xs text-gray-400 mt-1">{visit.remarks}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-pink-600">
                    {formatCurrency(visit.total_amount, settings.currency)}
                  </span>
                  <button
                    onClick={() => {
                      setDeleting(visit)
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Visit" size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Customer</label>
              <button
                type="button"
                onClick={() => setShowNewCustomer(!showNewCustomer)}
                className="text-xs text-pink-500 font-medium"
              >
                {showNewCustomer ? 'Select existing' : 'Add new customer'}
              </button>
            </div>

            {showNewCustomer ? (
              <div className="space-y-3 p-3 bg-gray-50 rounded-xl">
                <Input
                  label="Name"
                  value={quickName}
                  onChange={(e) => setQuickName(e.target.value)}
                  placeholder="Customer name"
                />
                <Input
                  label="Mobile"
                  value={quickMobile}
                  onChange={(e) => setQuickMobile(e.target.value)}
                  placeholder="Mobile number"
                />
                <Select
                  label="Gender"
                  value={quickGender}
                  onChange={(e) => setQuickGender(e.target.value)}
                  options={genderOptions}
                  placeholder="Select gender"
                />
              </div>
            ) : (
              <div>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    placeholder="Search customers..."
                    className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-2 text-sm outline-none focus:border-pink-400"
                  />
                </div>
                <select
                  {...register('customer_id')}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-pink-400"
                  size={4}
                >
                  <option value="">Select a customer</option>
                  {filteredCustomers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} - {c.mobile}
                    </option>
                  ))}
                </select>
                {errors.customer_id && (
                  <span className="text-xs text-red-500">{errors.customer_id.message}</span>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Services</label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {services.length === 0 && (
                <p className="text-sm text-gray-400 col-span-2">No services available. Add services first.</p>
              )}
              {services.map((service) => {
                const selected = selectedServices.some((s) => s.service_id === service.id)
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => toggleService(service)}
                    className={`text-left p-3 rounded-xl border text-sm transition-colors ${
                      selected
                        ? 'border-pink-400 bg-pink-50 text-pink-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-medium">{service.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatCurrency(service.price, settings.currency)}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <span className="text-sm font-medium text-gray-700">Total:</span>
            <span className="text-lg font-bold text-pink-600">
              {formatCurrency(totalAmount, settings.currency)}
            </span>
          </div>

          <Textarea label="Remarks (Optional)" id="remarks" {...register('remarks')} />

          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving} disabled={selectedServices.length === 0}>
              Save Visit
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Visit"
        message="Are you sure you want to delete this visit?"
        loading={saving}
      />
    </div>
  )
}
