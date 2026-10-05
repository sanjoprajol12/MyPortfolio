<script setup lang="ts">
import type { MfaSetup } from '@/types/portfolio'

const props = withDefaults(defineProps<{
  mfaData: MfaSetup | null
  isLoading?: boolean
}>(), {
  isLoading: false,
})

const emit = defineEmits<{
  (e: 'activate', code: string): void
}>()

const isOpen = defineModel<boolean>('isOpen', { default: false })

const code = ref('')

watch(isOpen, open => {
  if (open)
    code.value = ''
})

// Spaced in groups of four so it is easier to type into an app by hand
const formattedSecret = computed(() => props.mfaData?.secret.replace(/(.{4})/g, '$1 ').trim() ?? '')

const copySecret = async () => {
  if (!props.mfaData) return
  try {
    await navigator.clipboard.writeText(props.mfaData.secret)
    showSuccess('Setup key copied')
  }
  catch {
    showErrorMsg('Could not copy. Select the key and copy it manually.')
  }
}

const submit = () => {
  const clean = code.value.replace(/\s+/g, '')
  if (!/^\d{6}$/.test(clean)) {
    showErrorMsg('Please enter a valid 6-digit code')

    return
  }
  emit('activate', clean)
}
</script>

<template>
  <VDialog
    v-model="isOpen"
    max-width="520"
    :persistent="props.isLoading"
  >
    <VCard>
      <DrawerHeaderSection
        title="Set up authenticator app"
        subtitle="Google Authenticator, Microsoft Authenticator, Authy, 1Password…"
        icon="smartphone"
        @cancel="isOpen = false"
      />
      <VDivider />
      <VForm @submit.prevent="submit">
        <VCardText v-if="props.mfaData">
          <ol class="setup-steps text-body-2 mb-4">
            <li>Open your authenticator app and add a new account.</li>
            <li>Scan this QR code, or enter the setup key by hand.</li>
            <li>Type the 6-digit code the app shows to finish.</li>
          </ol>

          <div class="d-flex justify-center mb-4">
            <img
              :src="props.mfaData.qrCode"
              alt="QR code for your authenticator app"
              width="200"
              height="200"
              class="qr-image"
            >
          </div>

          <div class="text-caption text-medium-emphasis mb-1">
            Setup key for {{ props.mfaData.account }}
          </div>
          <div class="secret-box d-flex align-center justify-space-between gap-2 mb-5">
            <code class="text-body-2">{{ formattedSecret }}</code>
            <IconBtn
              size="small"
              @click="copySecret"
            >
              <VIcon icon="copy" />
              <VTooltip activator="parent">
                Copy setup key
              </VTooltip>
            </IconBtn>
          </div>

          <VTextField
            v-model="code"
            autofocus
            label="6-digit code"
            placeholder="123456"
            inputmode="numeric"
            autocomplete="one-time-code"
            maxlength="7"
          />
        </VCardText>
        <VCardActions class="justify-end pa-4 pt-0">
          <VBtn
            variant="text"
            :disabled="props.isLoading"
            @click="isOpen = false"
          >
            Cancel
          </VBtn>
          <VBtn
            type="submit"
            :loading="props.isLoading"
            prepend-icon="shield-check"
          >
            Turn on
          </VBtn>
        </VCardActions>
      </VForm>
    </VCard>
  </VDialog>
</template>

<style scoped>
.setup-steps {
  padding-inline-start: 1.25rem;
}

.qr-image {
  border-radius: 8px;
  background: #fff;
  padding: 6px;
}

.secret-box {
  background-color: rgba(var(--v-theme-on-surface), 0.04);
  border-radius: 8px;
  padding: 8px 8px 8px 12px;
  word-break: break-all;
}
</style>
