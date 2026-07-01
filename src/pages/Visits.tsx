import { useState, useEffect } from 'react'
import { Plus, Trash2, Search, Minus, Plus as PlusIcon } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Modal } from '@/components/ui/Modal'
import { SearchInput } from '@/components/ui/SearchInput'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { Loading } from '@/components/ui/Loading'
import { getVisits, createVisit, deleteVisit } from '@/services/visits'
import { getCustomers, createCustomer } from '@/services/customers'
import { getServices } from '@/services/services'
import { formatDate, formatCurrency } from '@/lib/utils'
import { useApp } from '@/context/AppContext'
import type { Visit, Customer, Service } from '@/types'

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
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [remarks, setRemarks] = useState('')

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
    setSelectedCustomerId('')
    setRemarks('')
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

  function updateServicePrice(serviceId: string, price: number) {
    setSelectedServices((prev) =>
      prev.map((s) => (s.service_id === serviceId ? { ...s, price: Math.max(0, price) } : s)),
    )
  }

  const totalAmount = selectedServices.reduce((sum, s) => sum + s.price, 0)

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.mobile.includes(customerSearch),
  )

  async function onSubmit() {
    if (selectedServices.length === 0) {
      alert('Please select at least one service')
      return
    }
    try {
      setSaving(true)
      let customerId = selectedCustomerId

      if (showNewCustomer) {
        if (!quickName || !quickGender) {
          alert('Please fill name and gender')
          setSaving(false)
          return
        }
        if (!/^\d{10}$/.test(quickMobile)) {
          alert('Mobile number must be exactly 10 digits')
          setSaving(false)
          return
        }
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
        setSaving(false)
        return
      }

      await createVisit(
        customerId,
        selectedServices.map((s) => ({ service_id: s.service_id, price: s.price })),
        totalAmount,
        remarks || undefined,
      )
      setModalOpen(false)
      loadVisits()
    } catch (e) {
      alert('Failed to create visit: ' + (e instanceof Error ? e.message : 'Unknown error'))
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
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-4">
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
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Name</label>
                  <input
                    type="text"
                    value={quickName}
                    onChange={(e) => setQuickName(e.target.value)}
                    placeholder="Customer name"
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-pink-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Mobile</label>
                  <input
                    type="tel"
                    value={quickMobile}
                    onChange={(e) => setQuickMobile(e.target.value)}
                    placeholder="10 digit mobile number"
                    maxLength={10}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-pink-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Gender</label>
                  <select
                    value={quickGender}
                    onChange={(e) => setQuickGender(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-pink-400 bg-white"
                  >
                    <option value="">Select gender</option>
                    {genderOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
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
                    className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-pink-400"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {filteredCustomers.length === 0 && (
                    <p className="text-sm text-gray-400 py-2 text-center">No customers found</p>
                  )}
                  {filteredCustomers.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedCustomerId(c.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm border transition-colors ${
                        selectedCustomerId === c.id
                          ? 'border-pink-400 bg-pink-50 text-pink-700'
                          : 'border-gray-100 bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span className="font-medium">{c.name}</span>
                      <span className="text-gray-400 ml-2">{c.mobile}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Services</label>
            <div className="space-y-2">
              {services.length === 0 && (
                <p className="text-sm text-gray-400">No services available. Add services first.</p>
              )}
              <div className="flex flex-wrap gap-2">
                {services.map((service) => {
                  const selected = selectedServices.some((s) => s.service_id === service.id)
                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => toggleService(service)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        selected
                          ? 'border-pink-400 bg-pink-50 text-pink-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {service.name} ({formatCurrency(service.price, settings.currency)})
                    </button>
                  )
                })}
              </div>
              {selectedServices.length > 0 && (
                <div className="space-y-2 mt-2">
                  <p className="text-xs text-gray-500 font-medium">Adjust prices if needed:</p>
                  {selectedServices.map((s) => (
                    <div key={s.service_id} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                      <span className="flex-1 text-sm font-medium">{s.name}</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => updateServicePrice(s.service_id, s.price - 10)}
                          className="p-1 rounded-lg hover:bg-gray-200"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <input
                          type="number"
                          value={s.price}
                          onChange={(e) => updateServicePrice(s.service_id, Number(e.target.value))}
                          className="w-20 text-center rounded-lg border border-gray-200 px-2 py-1 text-sm"
                          step="10"
                        />
                        <button
                          type="button"
                          onClick={() => updateServicePrice(s.service_id, s.price + 10)}
                          className="p-1 rounded-lg hover:bg-gray-200"
                        >
                          <PlusIcon className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <span className="text-sm font-medium text-gray-700">Total:</span>
            <span className="text-lg font-bold text-pink-600">
              {formatCurrency(totalAmount, settings.currency)}
            </span>
          </div>

          <Textarea label="Remarks (Optional)" id="remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} />

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
