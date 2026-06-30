import { supabase } from '@/lib/supabase'
import type { Customer } from '@/types'

export async function getCustomers(search?: string): Promise<Customer[]> {
  let query = supabase.from('customers').select('*').order('created_at', { ascending: false })
  if (search) {
    query = query.or(`name.ilike.%${search}%,mobile.ilike.%${search}%`)
  }
  const { data } = await query
  return (data as Customer[]) || []
}

export async function getCustomer(id: string): Promise<Customer | null> {
  const { data } = await supabase.from('customers').select('*').eq('id', id).single()
  return data as Customer | null
}

export async function createCustomer(customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) {
  const { data } = await supabase.from('customers').insert(customer).select().single()
  return data as Customer | null
}

export async function updateCustomer(id: string, customer: Partial<Customer>) {
  const { data } = await supabase.from('customers').update(customer).eq('id', id).select().single()
  return data as Customer | null
}

export async function deleteCustomer(id: string) {
  await supabase.from('visit_services').delete().in('visit_id', supabase.from('visits').select('id').eq('customer_id', id) as any)
  await supabase.from('visits').delete().eq('customer_id', id)
  await supabase.from('customers').delete().eq('id', id)
}
