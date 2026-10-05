<script lang="ts" setup>
import Footer from '@/layouts/components/Footer.vue'
import NavbarThemeSwitcher from '@/layouts/components/NavbarThemeSwitcher.vue'
import UserProfile from '@/layouts/components/UserProfile.vue'
import VerticalNavLayout from '@/core/components/VerticalNavLayout.vue'
import { useNavItems } from '@/navigation'

const { mainItems } = useNavItems()
</script>

<template>
  <VerticalNavLayout :nav-items="mainItems">
    <!--  navbar -->
    <template #navbar="{ toggleVerticalOverlayNavActive }">
      <div class="d-flex h-100 align-center">
        <IconBtn
          id="vertical-nav-toggle-btn"
          class="ms-n2 d-lg-none"
          @click="toggleVerticalOverlayNavActive(true)"
        >
          <VIcon icon="menu" />
        </IconBtn>

        <VSpacer />

        <!-- Saves go live immediately, so keep the public site one click away -->
        <IconBtn
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          class="me-1"
        >
          <VIcon icon="external-link" />
          <VTooltip
            activator="parent"
            location="bottom"
          >
            View live site
          </VTooltip>
        </IconBtn>

        <NavbarThemeSwitcher class="me-2" />

        <UserProfile />
      </div>
    </template>

    <slot />

    <template #footer>
      <Footer />
    </template>
  </VerticalNavLayout>
</template>
