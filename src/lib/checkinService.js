// src/lib/checkinService.js
import { supabase } from './supabase'

export function getTodayBangkokDate() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
  }).format(new Date())
}

export async function getTodayEvent() {
  const today = getTodayBangkokDate()

  const { data, error } = await supabase
    .from('events')
    .select('id, date')
    .eq('date', today)
    .maybeSingle()

  if (error) throw new Error(`getTodayEvent failed: ${error.message}`)
  return data
}

export async function getUserByCode(code) {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, code, role, position')
    .eq('code', code.trim())
    .maybeSingle()

  if (error) throw new Error(`getUserByCode failed: ${error.message}`)
  return data
}

export async function hasCheckedIn(userId, eventId) {
  const { data, error } = await supabase
    .from('checkins')
    .select('id')
    .eq('user_id', userId)
    .eq('event_id', eventId)
    .limit(1)

  if (error) throw new Error(`hasCheckedIn failed: ${error.message}`)
  return data?.length > 0
}

export async function recordCheckIn(userId, eventId) {
  const { error } = await supabase
    .from('checkins')
    .insert({ user_id: userId, event_id: eventId })

  if (error?.code === '23505') {
    return { status: 'duplicate' }
  }

  if (error) throw error

  return { status: 'success' }
}

export async function performCheckIn(userCode) {
  const inputCode = userCode.trim()

  const user = await getUserByCode(inputCode)

  if (!user) {
    return {
      status: 'not_found',
      message: 'ไม่พบรหัสนี้ในระบบ กรุณาลงทะเบียนก่อนใช้งาน',
      code: inputCode,
    }
  }

  if (user.role === 'admin') {
    return { status: 'success', user }
  }

  const event = await getTodayEvent()
  if (!event) {
    return {
      status: 'no_event',
      message: 'ยังไม่มีกิจกรรมสำหรับวันนี้',
    }
  }

  const already = await hasCheckedIn(user.id, event.id)
  if (already) {
    return { status: 'duplicate', user }
  }

  const saved = await recordCheckIn(user.id, event.id)
  if (saved.status === 'duplicate') {
    return { status: 'duplicate', user }
  }

  return { status: 'success', user, event }
}
