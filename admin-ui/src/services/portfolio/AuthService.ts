import BaseAPIService from '@/services/BaseAPIService'
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

  updateAccount(data: AccountUpdate) {
    return this.put<AccountUpdateResponse>(data, 'account')
  }

  // Signs out every session of this account; returns a fresh token for this one
  revokeSessions() {
    return this.post<{ token: string }>({}, 'sessions/revoke')
  }
}
