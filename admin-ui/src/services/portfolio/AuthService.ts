import BaseAPIService from '@/services/BaseAPIService'
import type { APIResponseOk } from '@/types/APIResponse'
import type {
  AccountUpdate,
  AccountUpdateResponse,
  AuthUser,
  LoginResponse,
  SessionResponse,
  UserCredentials,
} from '@/types/portfolio'

export default class AuthService extends BaseAPIService {
  constructor() {
    super('auth')
  }

  login(credentials: UserCredentials) {
    return this.post<LoginResponse>(credentials, 'login')
  }

  loginMfa(mfaToken: string, code: string) {
    return this.post<SessionResponse>({ mfaToken, code }, 'login/mfa')
  }

  me() {
    return this.get<AuthUser>('me')
  }

  // { user: null } when signed out, so checking costs no failed request
  session() {
    return this.get<{ user: AuthUser | null }>('session')
  }

  updateAccount(data: AccountUpdate) {
    return this.put<AccountUpdateResponse>(data, 'account')
  }

  logout() {
    return this.post<APIResponseOk>({}, 'logout')
  }

  // Signs out every session of this account; this browser gets a fresh cookie
  revokeSessions() {
    return this.post<APIResponseOk>({}, 'sessions/revoke')
  }

  // Always answers the same way, whether or not the address has an account
  forgotPassword(email: string) {
    return this.post<{ ok: true; message: string }>({ email }, 'password/forgot')
  }

  resetPassword(token: string, password: string) {
    return this.post<{ ok: true; message: string }>({ token, password }, 'password/reset')
  }
}
