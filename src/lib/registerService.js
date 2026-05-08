import { supabase } from './supabase'

const MAX_ATTEMPTS = 8
const NEW_CODE_PREFIX = 'new-'

function formatNewCode(value) {
  return `${NEW_CODE_PREFIX}${String(value).padStart(3, '0')}`
}

function parseNewCode(code) {
  const match = String(code || '').toLowerCase().match(/^new-(\d+)$/)
  return match ? Number(match[1]) : 0
}

async function getNextUserCode() {
  const { data, error } = await supabase
    .from('users')
    .select('code')
    .ilike('code', `${NEW_CODE_PREFIX}%`)

  if (error) throw error

  const maxCode = (data || []).reduce((max, user) => {
    return Math.max(max, parseNewCode(user.code))
  }, 0)

  return formatNewCode(maxCode + 1)
}

export async function registerWalkInUser({ firstName, lastName, position }) {
  const fullName = `${firstName.trim()} ${lastName.trim()}`

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const code = await getNextUserCode()
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        name: fullName,
        code,
        role: 'user',
        position: position?.trim() || null,
      })
      .select('id, name, code, position')
      .single()

    if (!error) return user
    if (error.code !== '23505') throw error
  }

  throw new Error('Unable to register user with a unique code')
}
