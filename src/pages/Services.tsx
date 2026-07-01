import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { SearchInput } from '@/components/ui/SearchInput'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { Loading } from '@/components/ui/Loading'
import { getServices, createService, updateService, deleteService } from '@/services/services'
import { formatCurrency } from '@/lib/utils'
import { useApp } from '@/context/AppContext'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Service } from '@/types'

const serviceSchema = z.object({
  name: z.string().min(1, 'Service name is required'),
  category: z.string().min(1, 'Category is required'),
  price: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Price must be positive'),
})

interface ServiceForm {
  name: string
  category: string
  price: string
}

const defaultCategories = ['Hair', 'Skin', 'Makeup', 'Threading', 'Nails', 'Silai', 'Product']

const catColors: Record<string, string> = {
  Hair: 'bg-purple-100 text-purple-700',
  Skin: 'bg-pink-100 text-pink-700',
  Makeup: 'bg-yellow-100 text-yellow-700',
  Threading: 'bg-blue-100 text-blue-700',
  Nails: 'bg-green-100 text-green-700',
  Silai: 'bg-orange-100 text-orange-700',
  Product: 'bg-teal-100 text-teal-700',
}

export function Services() {
  const { settings } = useApp()
  const [services, setServices] = useState<Service[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)
  const [deleting, setDeleting] = useState<Service | null>(null)
  const [saving, setSaving] = useState(false)
  const [customCat, setCustomCat] = useState('')
  const [extraCategories, setExtraCategories] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('customCategories') || '[]') } catch { return [] }
  })

  const allCategories = [...defaultCategories, ...extraCategories]
  const categoryOptions = allCategories.map((c) => ({ value: c, label: c }))

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ServiceForm>({
    resolver: zodResolver(serviceSchema) as any,
  })

  const selectedCategory = watch('category')

  useEffect(() => {
    loadServices()
  }, [search])

  useEffect(() => {
    localStorage.setItem('customCategories', JSON.stringify(extraCategories))
  }, [extraCategories])

  async function loadServices() {
    try {
      setLoading(true)
      const data = await getServices(search || undefined)
      setServices(data)
    } catch {
      console.error('Failed to load services')
    } finally {
      setLoading(false)
    }
  }

  function openAdd() {
    setEditing(null)
    setCustomCat('')
    reset({ name: '', category: '', price: '' })
    setModalOpen(true)
  }

  function openEdit(service: Service) {
    setEditing(service)
    setCustomCat('')
    reset({ name: service.name, category: service.category, price: String(service.price) })
    setModalOpen(true)
  }

  async function onSubmit(data: ServiceForm) {
    try {
      setSaving(true)
      let category = data.category
      if (category === '__custom__') {
        if (!customCat.trim()) {
          alert('Please enter a category name')
          setSaving(false)
          return
        }
        category = customCat.trim()
        if (!extraCategories.includes(category)) {
          setExtraCategories((prev) => [...prev, category])
        }
      }
      const payload = { name: data.name, category, price: Number(data.price) }
      if (editing) {
        await updateService(editing.id, payload as any)
      } else {
        await createService(payload as any)
      }
      setModalOpen(false)
      loadServices()
    } catch {
      console.error('Failed to save service')
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    if (!deleting) return
    try {
      setSaving(true)
      await deleteService(deleting.id)
      setDeleteOpen(false)
      setDeleting(null)
      loadServices()
    } catch {
      console.error('Failed to delete service')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Services</h1>
          <p className="text-sm text-gray-500 mt-1">{services.length} total services</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>

      <SearchInput value={search} onChange={setSearch} placeholder="Search by name or category..." />

      {loading ? (
        <Loading />
      ) : services.length === 0 ? (
        <EmptyState
          title="No services found"
          description={search ? 'Try a different search term' : 'Add your first service'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {services.map((service) => (
            <Card key={service.id}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{service.name}</p>
                  <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 ${catColors[service.category] || 'bg-gray-100 text-gray-700'}`}>
                    {service.category}
                  </span>
                  <p className="text-lg font-bold text-pink-600 mt-2">
                    {formatCurrency(service.price, settings.currency)}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(service)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Pencil className="h-4 w-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => {
                      setDeleting(service)
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Service' : 'Add Service'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Service Name" id="name" error={errors.name?.message} {...register('name')} />
          <Select
            label="Category"
            id="category"
            options={[...categoryOptions, { value: '__custom__', label: 'Add New Category...' }]}
            placeholder="Select category"
            error={errors.category?.message}
            {...register('category')}
          />
          {selectedCategory === '__custom__' && (
            <Input
              label="New Category Name"
              value={customCat}
              onChange={(e) => setCustomCat(e.target.value)}
              placeholder="Enter category name"
            />
          )}
          <Input label="Price" id="price" type="number" step="0.01" error={errors.price?.message} {...register('price')} />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {editing ? 'Update' : 'Add'} Service
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Service"
        message={`Are you sure you want to delete ${deleting?.name}?`}
        loading={saving}
      />
    </div>
  )
}
