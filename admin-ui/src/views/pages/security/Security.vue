<script setup lang="ts">
import ConfirmPasswordDialog from './components/ConfirmPasswordDialog.vue'
import MfaSetupDialog from './components/MfaSetupDialog.vue'
import RecoveryCodesDialog from './components/RecoveryCodesDialog.vue'
import SecuritySettingsCard from './components/SecuritySettingsCard.vue'
import MfaService from '@/services/portfolio/MfaService'
import AuthService from '@/services/portfolio/AuthService'
import { useAuthStore } from '@/store/auth'
import type { MfaSetup } from '@/types/portfolio'

const mfaService = new MfaService()
const authService = new AuthService()
const authStore = useAuthStore()
const $confirm = useConfirm()

const isMfaLoading = ref(false)
const isSyncing = ref(false)

const isMfaEnabled = ref(Boolean(authStore.user?.mfaEnabled))
const recoveryCodesRemaining = ref(0)

const showMfaDialog = ref(false)
const mfaSetupData = ref<MfaSetup | null>(null)

const showRecoveryCodesDialog = ref(false)
const recoveryCodes = ref<string[]>([])

// Turning MFA off or replacing recovery codes needs the current password (the server enforces it);
// `pendingAction` records which one the dialog is confirming.
type PasswordProtectedAction = 'disable' | 'recovery-codes'
const showConfirmPasswordDialog = ref(false)
const pendingAction = ref<PasswordProtectedAction | null>(null)
const confirmPasswordError = ref('')

const confirmDialog = computed(() => pendingAction.value === 'disable'
  ? {
    title: 'Turn off two-step verification',
    message: 'Enter your current password to turn off authenticator-app verification.',
    label: 'Turn off',
  }
  : {
    title: 'Create new recovery codes',
    message: 'Enter your current password. Your old recovery codes will stop working.',
    label: 'Create codes',
  })

const applyMfaEnabled = (enabled: boolean) => {
  isMfaEnabled.value = enabled
  authStore.setMfaEnabled(enabled)
}

const loadSecuritySettings = async () => {
  isSyncing.value = true
  try {
    const status = await mfaService.status()

    applyMfaEnabled(status.enabled)
    recoveryCodesRemaining.value = status.recoveryCodesRemaining
  }
  catch (error) {
    showError(error)
  }
  finally {
    isSyncing.value = false
  }
}

const openMfaSetup = async () => {
  isMfaLoading.value = true
  try {
    mfaSetupData.value = await mfaService.setup()
    showMfaDialog.value = true
  }
  catch (error) {
    showError(error)
  }
  finally {
    isMfaLoading.value = false
  }
}

const showNewRecoveryCodes = (codes: string[]) => {
  recoveryCodes.value = codes
  recoveryCodesRemaining.value = codes.length
  showRecoveryCodesDialog.value = true
}

const activateMfaAuthenticator = async (code: string) => {
  isMfaLoading.value = true
  try {
    const response = await mfaService.activate(code)

    showMfaDialog.value = false
    mfaSetupData.value = null
    applyMfaEnabled(true)
    showSuccess('Two-step verification is on')
    showNewRecoveryCodes(response.recoveryCodes)
  }
  catch (error) {
    showError(error)
  }
  finally {
    isMfaLoading.value = false
  }
}

const requestPassword = (action: PasswordProtectedAction) => {
  pendingAction.value = action
  confirmPasswordError.value = ''
  showConfirmPasswordDialog.value = true
}

const onPasswordConfirmed = async (password: string) => {
  isMfaLoading.value = true
  confirmPasswordError.value = ''
  try {
    if (pendingAction.value === 'disable') {
      await mfaService.disable(password)
      applyMfaEnabled(false)
      recoveryCodesRemaining.value = 0
      showSuccess('Two-step verification is off')
    }
    else if (pendingAction.value === 'recovery-codes') {
      const response = await mfaService.regenerateRecoveryCodes(password)

      showNewRecoveryCodes(response.recoveryCodes)
    }
    showConfirmPasswordDialog.value = false
  }
  catch (error: any) {
    if (error?.status === 422) {
      confirmPasswordError.value = error.message || 'The current password is incorrect.'
    }
    else {
      showError(error)
      showConfirmPasswordDialog.value = false
    }
  }
  finally {
    isMfaLoading.value = false
  }
}

const isRevoking = ref(false)

// Every other browser or device is signed out; this one keeps working with a fresh token
const revokeSessions = () => {
  $confirm?.({
    message: 'Sign out of the admin on every other browser and device?',
    button: { no: 'No', yes: 'Yes' },
    callback: async (ok: boolean) => {
      if (!ok) return
      isRevoking.value = true
      try {
        const { token } = await authService.revokeSessions()

        authStore.replaceToken(token)
        showSuccess('Signed out of all other sessions')
      }
      catch (error) {
        showError(error)
      }
      finally {
        isRevoking.value = false
      }
    },
  })
}

onMounted(() => loadSecuritySettings())
</script>

<template>
  <section>
    <VRow>
      <VCol
        cols="12"
        md="8"
      >
        <SecuritySettingsCard
          :is-mfa-enabled="isMfaEnabled"
          :recovery-codes-remaining="recoveryCodesRemaining"
          :is-loading="isMfaLoading"
          :is-syncing="isSyncing"
          @open-mfa-setup="openMfaSetup"
          @deactivate-mfa="requestPassword('disable')"
          @regenerate-recovery-codes="requestPassword('recovery-codes')"
        />
      </VCol>

      <VCol
        cols="12"
        md="4"
      >
        <VCard
          flat
          class="admin-card"
        >
          <VCardText class="pa-5">
            <div class="d-flex align-start gap-3 text-body-2">
              <VIcon
                icon="info"
                size="20"
                color="info"
              />
              <div class="text-medium-emphasis">
                To change your username or password, go to
                <RouterLink :to="{ name: 'account' }">
                  My account
                </RouterLink>.
                Lost your phone and recovery codes? Ask a super admin to reset two-step verification from Admin users.
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol
        cols="12"
        md="8"
      >
        <VCard
          flat
          class="admin-card"
        >
          <PageHeader
            title="Sessions"
            subtitle="Where you are signed in to the admin"
            icon="log-out"
            size="small"
          />

          <VDivider />

          <VCardText class="pa-5">
            <div class="d-flex align-start gap-4 flex-wrap flex-sm-nowrap">
              <div class="flex-grow-1">
                <div class="text-body-1 font-weight-medium mb-1">
                  Sign out everywhere else
                </div>
                <p class="text-body-2 text-medium-emphasis mb-0">
                  Use this if you signed in on a shared computer or lost a device. Sessions also end on their own after 7 days, and when your password changes.
                </p>
              </div>
              <VBtn
                variant="tonal"
                color="error"
                prepend-icon="log-out"
                class="flex-shrink-0"
                :loading="isRevoking"
                @click="revokeSessions"
              >
                Sign out others
              </VBtn>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <MfaSetupDialog
      v-model:is-open="showMfaDialog"
      :mfa-data="mfaSetupData"
      :is-loading="isMfaLoading"
      @activate="activateMfaAuthenticator"
    />

    <RecoveryCodesDialog
      v-model="showRecoveryCodesDialog"
      :codes="recoveryCodes"
    />

    <!-- Re-authentication before weakening the second factor -->
    <ConfirmPasswordDialog
      v-model="showConfirmPasswordDialog"
      :title="confirmDialog.title"
      :message="confirmDialog.message"
      :confirm-label="confirmDialog.label"
      :loading="isMfaLoading"
      :error-message="confirmPasswordError"
      @confirm="onPasswordConfirmed"
    />
  </section>
</template>
