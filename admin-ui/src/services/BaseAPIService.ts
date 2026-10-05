import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios"
import axios from "axios"
import type { App } from "vue"
import VueAxios from "vue-axios"
import JwtService from "./JwtService"
import type { APIErrorResponse } from "@/types/APIResponse"

interface CustomAxiosInstance extends AxiosInstance {
  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T>;
  put<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T>;
  patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T>;
  delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>;
}

// The API authenticates with a Bearer token only, so no cookies are sent cross-origin.
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: {
    Accept: "application/json",
  },
}) as CustomAxiosInstance

apiClient.interceptors.request.use(config => {
  const token = JwtService.getToken()

  if (token) config.headers.Authorization = `Bearer ${token}`

  return config
})

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  error => {
    const isLoginRequest = String(error.config?.url || "").endsWith("auth/login")

    // A failed login is an expected 401; anything else means the session is gone.
    if (error.response?.status === 401 && !isLoginRequest) {
      JwtService.destroyToken()

      const base = import.meta.env.BASE_URL.replace(/\/$/, "")
      const loginPath = `${base}/login`

      if (window.location.pathname !== loginPath) {
        // Router paths are relative to the /admin base
        const current = window.location.pathname.slice(base.length) || "/"
        const redirect = encodeURIComponent(current + window.location.search)

        window.location.href = `${loginPath}?to=${redirect}`
      }
    }

    const errorInfo: APIErrorResponse = {
      message: error.response?.data?.error || error.response?.data?.message || error.message,
      status: error.response?.status,
      data: error.response?.data,
    }

    return Promise.reject(errorInfo)
  },
)

class BaseAPIService {
  protected static staticClient = apiClient

  constructor(protected resource?: string) {
    this.initResource(resource)
  }

  protected initResource(resource?: string): void {
    if (resource) this.resource = resource
  }

  public static init(app: App<Element>): void {
    app.use(VueAxios, axios)
  }

  protected async query<T>(
    path: string = "",
    params: AxiosRequestConfig = {},
  ): Promise<T> {
    return apiClient.get<T>(this.buildUrl(path), params)
  }

  protected async get<T>(path: string = ""): Promise<T> {
    return apiClient.get<T>(this.buildUrl(path))
  }

  protected async post<T>(data: unknown, path: string = ""): Promise<T> {
    return apiClient.post<T>(this.buildUrl(path), data)
  }

  protected async put<T>(data: unknown, path: string = ""): Promise<T> {
    return apiClient.put<T>(this.buildUrl(path), data)
  }

  protected async patch<T>(data: unknown, path: string = ""): Promise<T> {
    return apiClient.patch<T>(this.buildUrl(path), data)
  }

  protected async delete<T>(path: string = ""): Promise<T> {
    return apiClient.delete<T>(this.buildUrl(path))
  }

  private buildUrl(path: string): string {
    return path ? `${this.resource}/${path}` : this.resource!
  }
}

export default BaseAPIService

export { apiClient }
