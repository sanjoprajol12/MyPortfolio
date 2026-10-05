// The portfolio API returns resources directly (arrays / objects), { ok: true } after
// deletes, and { error } on failure.
export interface APIResponseOk {
  ok: boolean
}

export interface APIErrorResponse {
  message: string
  status?: number
  data?: { error?: string; message?: string } | null
}
