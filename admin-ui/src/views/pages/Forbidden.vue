<script setup lang="ts">
const router = useRouter()
</script>

<template>
  <div class="d-flex align-center justify-center pa-6 pa-md-10">
    <VCard
      flat
      class="admin-card text-center pa-8"
      max-width="480"
      width="100%"
    >
      <VAvatar
        color="warning"
        variant="tonal"
        size="80"
        class="mb-5"
      >
        <VIcon
          icon="lock"
          size="40"
        />
      </VAvatar>
      <h1 class="text-h4 mb-2">
        Access denied
      </h1>
      <p class="text-body-1 text-medium-emphasis mb-6">
        Only super admins can open this page. Ask a super admin if you need access.
      </p>
      <VBtn
        prepend-icon="layout-dashboard"
        @click="router.push({ name: 'dashboard' })"
      >
        Back to dashboard
      </VBtn>
    </VCard>
  </div>
</template>
