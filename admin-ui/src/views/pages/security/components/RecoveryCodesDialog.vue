<script setup lang="ts">
const props = defineProps<{
  codes: string[]
}>()

const isOpen = defineModel<boolean>({ default: false })

const copyCodes = async () => {
  try {
    await navigator.clipboard.writeText(props.codes.join('\n'))
    showSuccess('Recovery codes copied')
  }
  catch {
    showErrorMsg('Could not copy. Select the codes and copy them manually.')
  }
}

const downloadCodes = () => {
  const text = `Portfolio admin recovery codes\nEach code works once.\n\n${props.codes.join('\n')}\n`
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }))
  const link = document.createElement('a')

  link.href = url
  link.download = 'portfolio-admin-recovery-codes.txt'
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <!-- Persistent: these codes are shown only once, so closing must be deliberate -->
  <VDialog
    v-model="isOpen"
    max-width="480"
    persistent
  >
    <VCard>
      <DrawerHeaderSection
        title="Save your recovery codes"
        icon="key"
        @cancel="isOpen = false"
      />
      <VDivider />
      <VCardText>
        <VAlert
          type="warning"
          variant="tonal"
          density="compact"
          icon="alert-triangle"
          class="mb-4"
        >
          If you lose your phone, these codes are the only way into your account. Each one works once, and they will not be shown again.
        </VAlert>

        <div class="codes-grid">
          <code
            v-for="code in props.codes"
            :key="code"
            class="text-body-1"
          >{{ code }}</code>
        </div>
      </VCardText>
      <VCardActions class="pa-4 pt-0 flex-wrap gap-2">
        <VBtn
          variant="tonal"
          prepend-icon="copy"
          @click="copyCodes"
        >
          Copy
        </VBtn>
        <VBtn
          variant="tonal"
          prepend-icon="download"
          @click="downloadCodes"
        >
          Download
        </VBtn>
        <VSpacer />
        <VBtn @click="isOpen = false">
          I've saved them
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped>
.codes-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 16px;
  background-color: rgba(var(--v-theme-on-surface), 0.04);
  border-radius: 8px;
  padding: 16px;
  text-align: center;
}
</style>
