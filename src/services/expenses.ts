import { supabase } from '@/lib/supabase'
import type { Expense } from '@/types'

export async function getExpenses(search?: string): Promise<Expense[]> {
  let query = supabase.from('expenses').select('*').order('date', { ascending: false })
  if (search) {
    query = query.or(`category.ilike.%${search}%,description.ilike.%${search}%`)
  }
  const { data } = await query
  return (data as Expense[]) || []
}

export async function createExpense(expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>) {
  const { data } = await supabase.from('expenses').insert(expense).select().single()
  return data as Expense | null
}

export async function updateExpense(id: string, expense: Partial<Expense>) {
  const { data } = await supabase.from('expenses').update(expense).eq('id', id).select().single()
  return data as Expense | null
}

export async function deleteExpense(id: string) {
  await supabase.from('expenses').delete().eq('id', id)
}
