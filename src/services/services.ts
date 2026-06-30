import { supabase } from '@/lib/supabase'
import type { Service } from '@/types'

export async function getServices(search?: string): Promise<Service[]> {
  let query = supabase.from('services').select('*').order('name')
  if (search) {
    query = query.or(`name.ilike.%${search}%,category.ilike.%${search}%`)
  }
  const { data } = await query
  return (data as Service[]) || []
}

export async function createService(service: Omit<Service, 'id' | 'created_at' | 'updated_at'>) {
  const { data } = await supabase.from('services').insert(service).select().single()
  return data as Service | null
}

export async function updateService(id: string, service: Partial<Service>) {
  const { data } = await supabase.from('services').update(service).eq('id', id).select().single()
  return data as Service | null
}

export async function deleteService(id: string) {
  await supabase.from('services').delete().eq('id', id)
}
