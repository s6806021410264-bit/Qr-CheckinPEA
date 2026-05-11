import { supabase } from './supabase'



export async function getPositionOptions() {
  const { data, error } = await supabase
    .from('positions')
    .select('name')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  if (error) {
    console.warn('Using fallback positions:', error.message)
    return []
    }

  const positions = (data || [])
    .map(item => item.name)
    .filter(Boolean)

  return positions.length > 0 ? positions : []
}

export async function createPosition({ name, sortOrder }) {
  const { error } = await supabase
    .from('positions')
    .insert({
      name: name.trim(),
      sort_order: Number(sortOrder) || 0,
      is_active: true,
    })

  if (error) throw error
}