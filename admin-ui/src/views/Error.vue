<template>
  <div class="d-flex align-center justify-center pa-6 pa-md-10">
    <VCard
      flat
      class="admin-card text-center pa-8"
      max-width="480"
      width="100%"
    >
      <VAvatar
        color="primary"
        variant="tonal"
        size="80"
        class="mb-5"
      >
        <VIcon
          icon="compass"
          size="40"
        />
      </VAvatar>
      <div class="text-h2 font-weight-medium mb-1">
        404
      </div>
      <h1 class="text-h5 mb-2">
        Page not found
      </h1>
      <p class="text-body-1 text-medium-emphasis mb-6">
        We couldn't find the page you are looking for.
      </p>
      <VBtn
        prepend-icon="layout-dashboard"
        :to="{ name: 'dashboard' }"
      >
        Back to dashboard
      </VBtn>
    </VCard>
  </div>
</template>
