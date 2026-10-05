import type { NavGroup, NavLink, NavSectionTitle } from '@/types/layouts'
import { useAuthStore } from '@/store/auth'

type NavItem = NavLink | NavGroup | NavSectionTitle

export const useNavItems = () => {
  const authStore = useAuthStore()

  const mainItems = computed<NavItem[]>(() => [
    { title: 'Dashboard', icon: { icon: 'layout-dashboard' }, to: 'dashboard' },

    { heading: 'Inbox' },
    { title: 'Messages', icon: { icon: 'mail' }, to: 'messages' },

    { heading: 'Website content' },
    { title: 'Hero & site', icon: { icon: 'layout' }, to: 'hero' },
    { title: 'About', icon: { icon: 'user-round' }, to: 'about' },
    { title: 'Skills', icon: { icon: 'layers' }, to: 'skills' },
    { title: 'Experience', icon: { icon: 'briefcase' }, to: 'experience' },
    { title: 'Projects', icon: { icon: 'folder-git-2' }, to: 'projects' },
    { title: 'Contact info', icon: { icon: 'contact' }, to: 'contact' },
    { title: 'Resume & CV', icon: { icon: 'file-text' }, to: 'resume' },

    { heading: 'Administration' },

    // Only super admins manage accounts (the API enforces this as well)
    ...(authStore.isSuperAdmin ? [{ title: 'Admin users', icon: { icon: 'users' }, to: 'admin-users' }] : []),
    { title: 'My account', icon: { icon: 'user-cog' }, to: 'account' },
    { title: 'Security', icon: { icon: 'shield-check' }, to: 'security' },
  ])

  return { mainItems }
}
