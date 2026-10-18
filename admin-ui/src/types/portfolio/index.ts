// Shapes of the documents in server/models/*.js

export type AdminRole = 'super_admin' | 'admin'

// An admin account as returned by the API (User.toPublic on the server)
export interface AuthUser {
  id: string
  username: string
  email?: string
  role: AdminRole
  mfaEnabled: boolean
  lastLoginAt?: string | null
  createdAt?: string

  // The site requires every admin to use two-step verification
  mfaRequired?: boolean
}

export interface UserCredentials {
  username: string
  password: string
}

// The session itself is an httpOnly cookie set by the API
export interface SessionResponse {
  user: AuthUser
  mfaRequired: boolean
}

// The password was right but the account has two-step verification:
// exchange mfaToken plus a code for a session at auth/login/mfa
export interface MfaChallengeResponse {
  mfaRequired: true
  mfaToken: string
}

export type LoginResponse = SessionResponse | MfaChallengeResponse

export interface AccountUpdate {
  currentPassword: string
  username?: string
  email?: string
  newPassword?: string
}

// Changing a password signs out older sessions; the API gives this browser a fresh cookie
export interface AccountUpdateResponse {
  user: AuthUser
}

export interface MessagePage {
  items: Message[]
  total: number
  unread: number
  page: number
  limit: number
}

export interface MessageQuery {
  page?: number
  limit?: number
  q?: string
  status?: 'all' | 'unread' | 'read' | 'spam'
}

export interface MfaStatus {
  enabled: boolean
  recoveryCodesRemaining: number
}

export interface MfaSetup {
  account: string
  issuer: string
  secret: string
  otpauthUrl: string
  qrCode: string
}

export interface AdminUserPayload {
  username: string
  email?: string
  password?: string
  role: AdminRole
}

export interface Overview {
  unread: number
  totalMessages: number
  projects: number
  experience: number
}

export interface HeroStat {
  num: string
  label: string
  fullWidth: boolean
}

export interface Hero {
  eyebrow: string
  eyebrowHighlight: string
  headlineLine1: string
  headlineLine2: string
  headlineLine3: string
  locationLabel: string
  description: string
  photoUrl: string
  photoName: string
  photoRole: string
  stats: HeroStat[]
  primaryStack: string[]
}

export interface AboutMeta {
  key: string
  value: string
  highlight: boolean
}

export interface About {
  paragraphs: string[]
  meta: AboutMeta[]
}

export interface ContactInfo {
  intro: string
  email: string
  phone: string
  availability: string
  website: string
  linkedinUrl: string
  linkedinHandle: string
  githubUrl: string
  githubHandle: string
}

export interface Education {
  degree: string
  school: string
  years: string
  details: string
}

export interface Certification {
  name: string
  issuer: string
  year: string
}

export interface Language {
  name: string
  level: string
}

export interface Award {
  name: string
  year: string
  details: string
}

export interface Resume {
  headline: string
  summary: string
  location: string
  website: string
  includePhoto: boolean
  showDownloadButtons: boolean
  includeProjectsOnResume: boolean
  resumeProjectLimit: number
  education: Education[]
  certifications: Certification[]
  languages: Language[]
  awards: Award[]
  interests: string[]
}

export interface Site {
  _id?: string
  firstName: string
  lastName: string
  pageTitle: string
  hero: Hero
  about: About
  contact: ContactInfo
  resume: Resume
  footerCopy: string
}

// Skills, experience and projects share an `order` field used for sorting on the site
export interface Ordered {
  _id: string
  order: number
}

export interface SkillTag {
  name: string
  highlight: boolean
}

export interface Skill extends Ordered {
  title: string
  subtitle: string
  fullWidth: boolean
  tags: SkillTag[]
}

export interface Experience extends Ordered {
  date: string
  role: string
  company: string
  stack: string[]
  bullets: string[]
}

export type ProjectStatusKind = 'live' | 'type' | 'none'

export interface Project extends Ordered {
  title: string
  description: string
  liveUrl: string
  githubUrl: string
  statusKind: ProjectStatusKind
  statusLabel: string
  techs: string[]
  features: string[]
}

export interface Message {
  _id: string
  name: string
  email: string
  message: string
  read: boolean
  spam?: boolean
  createdAt: string
}
