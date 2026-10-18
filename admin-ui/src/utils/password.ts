// Mirrors passwordError() in server/lib/accounts.js so the form and the API agree.
export const MIN_PASSWORD_LENGTH = 8

const COMMON = new Set([
  'password',
  'password1',
  'password123',
  '123456789012',
  'qwertyuiop',
  'qwerty123456',
  'iloveyou',
  'admin',
  'administrator',
  'letmein',
  'welcome',
  'welcome123',
  'changeme',
  'portfolio',
  'abc123456789',
  'football',
  'baseball',
  'superman',
  'trustno1',
  'sunshine',
  'princess',
  'dragon',
  'monkey',
  'master',
])

const characterClasses = (password: string) =>
  [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter(re => re.test(password)).length

// Returns what is wrong with the password, or null when the server will accept it
export function passwordProblem(password: string, username = ''): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) return `Use at least ${MIN_PASSWORD_LENGTH} characters.`
  if (password.length > 200) return 'Password is too long.'
  const lower = password.toLowerCase()
  if (COMMON.has(lower) || /^(.)\1+$/.test(password)) return 'This password is too common.'
  if (username.length >= 3 && lower.includes(username.toLowerCase())) return 'Do not include your username.'
  if (password.length < 16 && characterClasses(password) < 3)
    return 'Mix three of: lowercase, capitals, numbers, symbols. Or use 16+ characters.'

  return null
}

// 0 (empty) to 4 (strong), for the strength meter
export function passwordScore(password: string, username = ''): number {
  if (!password) return 0
  if (passwordProblem(password, username)) return 1
  if (password.length >= 20 || (password.length >= 16 && characterClasses(password) >= 3)) return 4
  if (password.length >= 14 || characterClasses(password) === 4) return 3

  return 2
}
