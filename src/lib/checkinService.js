// src/lib/checkinService.js
import { supabase } from './supabase'

// รูปแบบรหัสที่รับได้
const CODE_PATTERNS = [
  /^EMP\d{3,}$/,   // EMP001, EMP0001, ...
  /^WALK-\d{4}$/,  // WALK-0001, WALK-0002, ...
]

export function isValidCodeFormat(code) {
  const normalized = code.trim().toUpperCase()
  return CODE_PATTERNS.some(pattern => pattern.test(normalized))
}

// หา event วันนี้
export async function getTodayEvent() {
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
  }).format(new Date())

  const { data, error } = await supabase
    .from('events')
    .select('id, date')
    .eq('date', today)
    .maybeSingle()

  if (error) throw new Error(`getTodayEvent failed: ${error.message}`)
  return data
}

// หา user จากรหัส (เพิ่ม role)
export async function getUserByCode(code) {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, code, role,position') // ✅ เพิ่ม role
    .eq('code', code.trim().toUpperCase())
    .maybeSingle()

  if (error) throw new Error(`getUserByCode failed: ${error.message}`)
  return data
}

// ตรวจว่าเคย check-in แล้วไหม
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

// บันทึก check-in
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

// check-in ปกติ (มีรหัสในระบบ)
export async function performCheckIn(userCode) {
  const normalizedCode = userCode.trim().toUpperCase()

  // validate format ก่อน query DB
  if (!isValidCodeFormat(normalizedCode)) {
    return {
      status: 'invalid_format',
      message: 'รูปแบบรหัสไม่ถูกต้อง — ตัวอย่าง: EMP001 หรือ WALK-0001',
    }
  }

  try {
    // ✅ ตรวจ user ก่อนเลย เพื่อเช็ค role
    const user = await getUserByCode(normalizedCode)
    if (!user) return { status: 'not_found', message: `ไม่พบรหัส "${normalizedCode}" ในระบบ` }

    // ✅ ถ้าเป็น admin → ข้าม event check ไปเลย
    if (user.role === 'admin') {
      return { status: 'success', user }
    }

    // 👤 user ปกติ → ค่อยตรวจ event
    const event = await getTodayEvent()
    if (!event) return { status: 'no_event', message: 'ไม่มีอีเวนต์วันนี้' }

    const alreadyCheckedIn = await hasCheckedIn(user.id, event.id)
    if (alreadyCheckedIn) {
      return {
        status: 'duplicate',
        message: `${user.name} ลงชื่อแล้ว`,
        user,  // ← ส่ง user กลับด้วย
      }
    }

    const result = await recordCheckIn(user.id, event.id)

    if (result.status === 'duplicate') {
      return {
        status: 'duplicate',
        message: `${user.name} ลงชื่อแล้ว`,
      }
    }

    return { status: 'success', message: `✓ ลงชื่อสำเร็จ! ยินดีต้อนรับ ${user.name}`, user, event }
  } catch (err) {
    console.error('[performCheckIn]', err)
    return { status: 'error', message: 'เกิดข้อผิดพลาด กรุณาลองใหม่' }
  }
}

// ลงทะเบียน walk-in + check-in (ไม่มีรหัสในระบบ)
export async function registerAndCheckIn(firstName, lastName) {
  const trimmedFirst = firstName?.trim()
  const trimmedLast = lastName?.trim()

  if (!trimmedFirst) return { status: 'error', message: 'กรุณากรอกชื่อ' }
  if (!trimmedLast) return { status: 'error', message: 'กรุณากรอกนามสกุล' }

  const fullName = `${trimmedFirst} ${trimmedLast}`

  try {
    const event = await getTodayEvent()
    if (!event) return { status: 'no_event', message: 'ไม่มีอีเวนต์วันนี้' }

    let newUser = null
    let attempts = 0
    const MAX_ATTEMPTS = 5

    while (!newUser && attempts < MAX_ATTEMPTS) {
      attempts++

      const { count } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .like('code', 'WALK-%')

      const autoCode = `WALK-${String((count ?? 0) + 1).padStart(4, '0')}`

      const { data, error } = await supabase
        .from('users')
        .insert({ name: fullName, code: autoCode })
        .select('id, name, code')
        .maybeSingle()

      if (!error) {
        newUser = data
      } else if (error.code === '23505') {
        continue
      } else {
        throw new Error(`registerAndCheckIn insert failed: ${error.message}`)
      }
    }

    if (!newUser) return { status: 'error', message: 'ไม่สามารถสร้างรหัสได้ กรุณาลองใหม่' }

    await recordCheckIn(newUser.id, event.id)

    return {
      status: 'success',
      message: `✓ ลงทะเบียนสำเร็จ! ยินดีต้อนรับ ${newUser.name}`,
      user: newUser,
      event,
    }
  } catch (err) {
    console.error('[registerAndCheckIn]', err)
    return { status: 'error', message: 'เกิดข้อผิดพลาด กรุณาลองใหม่' }
  }
}
