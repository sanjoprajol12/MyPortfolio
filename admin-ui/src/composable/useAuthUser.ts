import { useAuthStore } from '@/store/auth'

export function useAuthUser() {
  const store = useAuthStore()

  const authUserData = computed(() => store.user)

  return { authUserData }
}
