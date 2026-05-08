import dayjs from 'dayjs'
import { supabase } from '../../lib/supabase'
import { getTodayBangkok } from '../utils/dateUtils'

// ─────────────────────────────
// 🔥 ERROR FORMATTER
// ─────────────────────────────
function formatError(error, fallback = 'เกิดข้อผิดพลาดในระบบ') {
       if (!error) return fallback

       if (error.code === '23505') return 'ข้อมูลซ้ำในระบบ'
       if (error.code === '23502') return 'ข้อมูลไม่ครบ'
       if (error.message?.includes('invalid')) return 'รูปแบบข้อมูลไม่ถูกต้อง'

       return error.message || fallback
}

// ─── CHECK-INS ───────────────────────────────────────────

export async function getTodayCheckins() {
       const today = getTodayBangkok()

       const { data, error } = await supabase
              .from('checkins')
              .select(`
      id,
      created_at,
      users (
        id,
        name,
        code,
        position
      )
    `)
              .gte('created_at', `${today}T00:00:00+07:00`)
              .lte('created_at', `${today}T23:59:59+07:00`)
              .order('created_at', { ascending: false })

       if (error) throw new Error(formatError(error))
       return data ?? []
}

export async function getCheckinsByDate(date) {
       const { data, error } = await supabase
              .from('checkins')
              .select(`
      id,
      created_at,
      users (
        id,
        name,
        code,
        position
      )
    `)
              .gte('created_at', `${date}T00:00:00+07:00`)
              .lte('created_at', `${date}T23:59:59+07:00`)
              .order('created_at', { ascending: false })

       if (error) throw new Error(formatError(error))
       return data ?? []
}

export async function getWeeklyCheckins() {
       const weekStart = dayjs().startOf('week').format('YYYY-MM-DD')

       const { data, error } = await supabase
              .from('checkins')
              .select('created_at')
              .gte('created_at', `${weekStart}T00:00:00+07:00`)
              .order('created_at', { ascending: true })

       if (error) throw new Error(formatError(error))
       return data ?? []
}

export async function getMonthlyCheckins(year, month) {
       const start = dayjs(`${year}-${String(month).padStart(2, '0')}-01`).format('YYYY-MM-DD')
       const end = dayjs(`${year}-${String(month).padStart(2, '0')}-01`).endOf('month').format('YYYY-MM-DD')

       const { data, error } = await supabase
              .from('checkins')
              .select(`
      id,
      created_at,
      users (
        id,
        name,
        code,
        position
      )
    `)
              .gte('created_at', `${start}T00:00:00+07:00`)
              .lte('created_at', `${end}T23:59:59+07:00`)
              .order('created_at', { ascending: true })

       if (error) throw new Error(formatError(error))
       return data ?? []
}

// ─── USERS ───────────────────────────────────────────────

export async function getAllUsers() {
       const { data, error } = await supabase
              .from('users')
              .select('id, name, code, role, position')
              .order('name', { ascending: true })

       if (error) throw new Error(formatError(error))
       return data ?? []
}

export async function createUser(userData) {
       const { error } = await supabase.from('users').insert({
              name: userData.name.trim(),
              code: userData.code.trim(),
              role: userData.role,
              position: userData.position?.trim() || null,
       })

       if (error) throw new Error(formatError(error))
}

// ─── UPDATE USER ────────────────────────────────────────

export async function updateUser(id, updates) {
       const { error } = await supabase
              .from('users')
              .update({
                     name: updates.name.trim(),
                     code: updates.code.trim(),
                     role: updates.role,
                     position: updates.position?.trim() || null,
              })
              .eq('id', id)

       if (error) throw new Error(formatError(error))
}

// ─── DELETE USER ────────────────────────────────────────

export async function deleteUser(id) {
       const { error } = await supabase
              .from('users')
              .delete()
              .eq('id', id)

       if (error) throw new Error(formatError(error))
}

// ─── EVENTS ──────────────────────────────────────────────

export async function getAllEvents() {
       const { data, error } = await supabase
              .from('events')
              .select('*')
              .order('date', { ascending: true })

       if (error) throw new Error(formatError(error))
       return data ?? []
}

export async function createEvent(eventData) {
       const { error } = await supabase.from('events').insert({
              name: eventData.name.trim(),
              date: eventData.date,
              description: eventData.description?.trim() || null,
       })

       if (error) throw new Error(formatError(error))
}

export async function updateEvent(id, eventData) {
       const { error } = await supabase
              .from('events')
              .update({
                     name: eventData.name.trim(),
                     date: eventData.date,
                     description: eventData.description?.trim() || null,
              })
              .eq('id', id)

       if (error) throw new Error(formatError(error))
}

export async function deleteEvent(id) {
       const { error } = await supabase
              .from('events')
              .delete()
              .eq('id', id)

       if (error) throw new Error(formatError(error))
}
