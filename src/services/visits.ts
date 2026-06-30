import { supabase } from '@/lib/supabase'
import type { Visit, VisitService } from '@/types'

export async function getVisits(search?: string): Promise<Visit[]> {
  let query = supabase
    .from('visits')
    .select('*, customer:customers(*), visit_services:visit_services(*, service:services(*))')
    .order('created_at', { ascending: false })
    .limit(50)

  if (search) {
    query = query.or(
      `customer.name.ilike.%${search}%,remarks.ilike.%${search}%`,
    )
  }

  const { data } = await query
  return (data as unknown as Visit[]) || []
}

export async function getCustomerVisits(customerId: string): Promise<Visit[]> {
  const { data } = await supabase
    .from('visits')
    .select('*, visit_services:visit_services(*, service:services(*))')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })

  return (data as unknown as Visit[]) || []
}

export async function getRecentVisits(limit = 5): Promise<Visit[]> {
  const { data } = await supabase
    .from('visits')
    .select('*, customer:customers(*), visit_services:visit_services(*, service:services(*))')
    .order('created_at', { ascending: false })
    .limit(limit)

  return (data as unknown as Visit[]) || []
}

export async function createVisit(
  customerId: string,
  services: { service_id: string; price: number }[],
  totalAmount: number,
  remarks?: string,
) {
  const { data: visit, error } = await supabase
    .from('visits')
    .insert({
      customer_id: customerId,
      total_amount: totalAmount,
      remarks: remarks || null,
    })
    .select()
    .single()

  if (error) throw error

  const visitServices = services.map((s) => ({
    visit_id: visit.id,
    service_id: s.service_id,
    price: s.price,
  }))

  await supabase.from('visit_services').insert(visitServices)

  return visit as Visit
}

export async function deleteVisit(id: string) {
  await supabase.from('visit_services').delete().eq('visit_id', id)
  await supabase.from('visits').delete().eq('id', id)
}
