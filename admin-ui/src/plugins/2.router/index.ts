import type { App } from "vue"
import { createRouter, createWebHistory } from "vue-router"
import { setupGuards } from "./guards"

const router = createRouter({
  // The admin is served under /admin (see vite.config.ts `base`)
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: "/dashboard",
      component: () => import("@/layouts/DefaultLayout.vue"),
      meta: {
        middleware: "auth",
      },
      children: [
        {
          path: "dashboard",
          name: "dashboard",
          component: () => import("@/views/pages/Dashboard.vue"),
          meta: {
            title: "Dashboard",
            closable: false,
            icon: "layout-dashboard",
            key: "fullPath",
          },
        },
        {
          path: "messages",
          name: "messages",
          component: () => import("@/views/pages/messages/Message.vue"),
          meta: {
            title: "Messages",
            icon: "mail",
            key: "fullPath",
          },
        },
        {
          path: "hero",
          name: "hero",
          component: () => import("@/views/pages/hero/Hero.vue"),
          meta: {
            title: "Hero & site",
            icon: "layout",
            key: "fullPath",
          },
        },
        {
          path: "about",
          name: "about",
          component: () => import("@/views/pages/about/About.vue"),
          meta: {
            title: "About",
            icon: "user-round",
            key: "fullPath",
          },
        },
        {
          path: "skills",
          name: "skills",
          component: () => import("@/views/pages/skills/Skill.vue"),
          meta: {
            title: "Skills",
            icon: "layers",
            key: "fullPath",
          },
        },
        {
          path: "experience",
          name: "experience",
          component: () => import("@/views/pages/experience/Experience.vue"),
          meta: {
            title: "Experience",
            icon: "briefcase",
            key: "fullPath",
          },
        },
        {
          path: "projects",
          name: "projects",
          component: () => import("@/views/pages/projects/Project.vue"),
          meta: {
            title: "Projects",
            icon: "folder-git-2",
            key: "fullPath",
          },
        },
        {
          path: "contact",
          name: "contact",
          component: () => import("@/views/pages/contact/Contact.vue"),
          meta: {
            title: "Contact info",
            icon: "contact",
            key: "fullPath",
          },
        },
        {
          path: "resume",
          name: "resume",
          component: () => import("@/views/pages/resume/Resume.vue"),
          meta: {
            title: "Resume & CV",
            icon: "file-text",
            key: "fullPath",
          },
        },

        // Administration
        {
          path: "account",
          name: "account",
          component: () => import("@/views/pages/account/Account.vue"),
          meta: {
            title: "My account",
            icon: "user-cog",
            key: "fullPath",
          },
        },
        {
          path: "security",
          name: "security",
          component: () => import("@/views/pages/security/Security.vue"),
          meta: {
            title: "Security",
            icon: "shield-check",
            key: "fullPath",
          },
        },
        {
          path: "admin-users",
          name: "admin-users",
          component: () => import("@/views/pages/admin-users/AdminUser.vue"),
          meta: {
            title: "Admin users",
            icon: "users",
            key: "fullPath",
            superAdminOnly: true,
          },
        },

        // Error & Other
        {
          path: "/403",
          name: "forbidden",
          component: () => import("@/views/pages/Forbidden.vue"),
          meta: {
            title: "Access denied",
            icon: "lock",
            key: "fullPath",
          },
        },
        {
          path: "/404",
          name: "404",
          component: () => import("@/views/Error.vue"),
          meta: {
            title: "Error 404",
            icon: "alert-circle",
            key: "fullPath",
          },
        },
      ],
    },
    {
      path: "/",
      component: () => import("@/layouts/AuthLayout.vue"), // Auth layout wrapper
      children: [
        {
          path: "/login",
          name: "login",
          component: () => import("@/views/pages/auth/Login.vue"),
          meta: { unauthenticatedOnly: true }, // Redirect if logged in
        },
      ],
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: "/404",
    },
  ],
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: "smooth", top: 60 }

    return { top: 0 }
  },
})

setupGuards(router)

export { router }

export default function (app: App) {
  app.use(router)
}
