import { supabase } from './supabase'

const SESSION_WAIT_MS = 700
const LOCAL_TTL_MS = 8 * 60 * 60 * 1000

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function getLockKey(code) {
  return `admin_session_lock:${code}`
}

function readLocalLock(lockKey) {
  try {
    return JSON.parse(localStorage.getItem(lockKey))
  } catch {
    return null
  }
}

function writeLocalLock(lockKey, lock) {
  localStorage.setItem(lockKey, JSON.stringify(lock))
}

function clearLocalLock(lockKey, sessionId) {
  const current = readLocalLock(lockKey)
  if (!current || current.sessionId === sessionId) {
    localStorage.removeItem(lockKey)
  }
}

function isActiveLock(lock) {
  return lock?.sessionId && Date.now() - Number(lock.updatedAt || 0) < LOCAL_TTL_MS
}

function getPresenceCount(channel) {
  return Object.keys(channel.presenceState()).length
}

async function startRealtimePresence(user, code, sessionId) {
  const channel = supabase.channel(`admin-session:${code}`, {
    config: { presence: { key: sessionId } },
  })

  const subscribed = new Promise(resolve => {
    channel.subscribe(status => resolve(status === 'SUBSCRIBED'))
  })

  const ready = await subscribed
  if (!ready) {
    await supabase.removeChannel(channel)
    return { ok: false, message: 'ไม่สามารถเปิด session admin ได้' }
  }

  await delay(SESSION_WAIT_MS)

  if (getPresenceCount(channel) > 0) {
    await supabase.removeChannel(channel)
    return {
      ok: false,
      message: `รหัส ${user.code} กำลังใช้งานอยู่ในเครื่องอื่น`,
    }
  }

  const trackStatus = await channel.track({
    code: user.code,
    name: user.name,
    startedAt: Date.now(),
  })

  if (trackStatus !== 'ok') {
    await supabase.removeChannel(channel)
    return { ok: false, message: 'ไม่สามารถบันทึก session admin ได้' }
  }

  await delay(SESSION_WAIT_MS)

  if (getPresenceCount(channel) > 1) {
    await channel.untrack()
    await supabase.removeChannel(channel)
    return {
      ok: false,
      message: `รหัส ${user.code} กำลังใช้งานอยู่ในเครื่องอื่น`,
    }
  }

  return { ok: true, channel }
}

export async function startAdminSession(user) {
  const code = user?.code?.trim().toLowerCase()
  if (!code) {
    return { ok: false, message: 'ไม่พบรหัส admin' }
  }

  const sessionId = `${Date.now()}-${Math.random().toString(36).slice(2)}`
  const lockKey = getLockKey(code)
  const existingLock = readLocalLock(lockKey)

  if (isActiveLock(existingLock) && existingLock.sessionId !== sessionId) {
    return {
      ok: false,
      message: `รหัส ${user.code} กำลังเปิดใช้งานอยู่ในแท็บอื่น`,
    }
  }

  writeLocalLock(lockKey, {
    sessionId,
    code: user.code,
    name: user.name,
    updatedAt: Date.now(),
  })

  await delay(120)

  const confirmedLock = readLocalLock(lockKey)
  if (confirmedLock?.sessionId !== sessionId) {
    return {
      ok: false,
      message: `รหัส ${user.code} กำลังเปิดใช้งานอยู่ในแท็บอื่น`,
    }
  }

  const heartbeat = window.setInterval(() => {
    writeLocalLock(lockKey, {
      sessionId,
      code: user.code,
      name: user.name,
      updatedAt: Date.now(),
    })
  }, 5000)

  const realtime = await startRealtimePresence(user, code, sessionId)
  if (!realtime.ok) {
    window.clearInterval(heartbeat)
    clearLocalLock(lockKey, sessionId)
    return realtime
  }

  const release = () => {
    window.clearInterval(heartbeat)
    clearLocalLock(lockKey, sessionId)
  }

  window.addEventListener('beforeunload', release, { once: true })

  return {
    ok: true,
    channel: realtime.channel,
    sessionId,
    lockKey,
    heartbeat,
    release,
  }
}

export async function endAdminSession(session) {
  if (!session) return

  session.release?.()

  try {
    await session.channel?.untrack()
  } finally {
    if (session.channel) {
      await supabase.removeChannel(session.channel)
    }
  }
}
