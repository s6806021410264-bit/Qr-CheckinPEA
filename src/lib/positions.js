import { supabase } from './supabase'

export const FALLBACK_POSITION_OPTIONS = [
  'บริหาร',
  'ผสน.',
  'ผบร.',
  'ผบส.',
  'ผกส.',
  'ผปบ.',
  'ผมต.',
]

export async function getPositionOptions() {
  const { data, error } = await supabase
    .from('positions')
    .select('name')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  if (error) {
    console.warn('Using fallback positions:', error.message)
    return FALLBACK_POSITION_OPTIONS
  }

  const positions = (data || [])
    .map(item => item.name)
    .filter(Boolean)

  return positions.length > 0 ? positions : FALLBACK_POSITION_OPTIONS
}
