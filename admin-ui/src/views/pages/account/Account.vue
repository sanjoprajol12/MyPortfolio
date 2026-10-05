<script setup lang="ts">
import { avatarText, formatDate } from '@/utils/formatters'
import AuthService from '@/services/portfolio/AuthService'
import { useAuthStore } from '@/store/auth'
import type { AccountUpdate } from '@/types/portfolio'
import { rules } from '@/composable/validation/useRules'

const authService = new AuthService()
const authStore = useAuthStore()

const isSaving = ref(false)
const isPasswordVisible = ref(false)

const accountForm = reactive({
  currentPassword: '',
  username: authStore.user?.username ?? '',
  newPassword: '',
  confirmPassword: '',
})

const formValidationRules = computed(() => ({
  currentPassword: { required: rules.required },
  username: { required: rules.required },
  newPassword: { minLength: rules.minLength(8) },
  confirmPassword: {
    sameAs: rules.custom(
      (value: string) => value === accountForm.newPassword,
      'Passwords do not match',
    ),
  },
}))

const { validationErrors, touchField, touch, resetValidation, hasError } =
  useFormValidation(formValidationRules, accountForm)

const roleName = computed(() => authStore.isSuperAdmin ? 'Super admin' : 'Admin')

const saveAccount = async () => {
  touch()
  if (hasError.value) return

  const payload: AccountUpdate = { currentPassword: accountForm.currentPassword }
  const username = accountForm.username.trim()

  if (username !== authStore.user?.username)
    payload.username = username
  if (accountForm.newPassword)
    payload.newPassword = accountForm.newPassword

  if (!payload.username && !payload.newPassword) {
    showInfo('Nothing to update')

    return
  }

  isSaving.value = true
  try {
    const { user, token } = await authService.updateAccount(payload)

    authStore.setAuth(user, token)
    Object.assign(accountForm, { currentPassword: '', newPassword: '', confirmPassword: '' })
    nextTick(() => resetValidation())
    showSuccess(payload.newPassword ? 'Password changed. Your other sessions were signed out.' : 'Account updated')
  }
  catch (error) {
    showError(error)
  }
  finally {
    isSaving.value = false
  }
}
</script>

<template>
  <section>
    <VRow>
      <VCol
        cols="12"
        md="4"
      >
        <VCard
          flat
          class="admin-card"
        >
          <VCardText class="d-flex flex-column align-center text-center pa-8">
            <VAvatar
              size="88"
              color="primary"
              variant="tonal"
              class="mb-4"
            >
              <span class="text-h3">{{ avatarText(authStore.user?.username ?? '') }}</span>
            </VAvatar>
            <h5 class="text-h5 mb-1">
              {{ authStore.user?.username }}
            </h5>
            <VChip
              size="small"
              color="primary"
              prepend-icon="users"
            >
              {{ roleName }}
            </VChip>
          </VCardText>
          <VDivider />
          <VCardText class="pa-5 d-flex flex-column gap-3 text-body-2">
            <div class="d-flex justify-space-between gap-2">
              <span class="text-medium-emphasis">Two-step verification</span>
              <span class="font-weight-medium">{{ authStore.user?.mfaEnabled ? 'On' : 'Off' }}</span>
            </div>
            <div
              v-if="authStore.user?.lastLoginAt"
              class="d-flex justify-space-between gap-2"
            >
              <span class="text-medium-emphasis">Last sign-in</span>
              <span class="font-weight-medium">{{ formatDate(authStore.user.lastLoginAt) }}</span>
            </div>
            <div
              v-if="authStore.user?.createdAt"
              class="d-flex justify-space-between gap-2"
            >
              <span class="text-medium-emphasis">Account created</span>
              <span class="font-weight-medium">{{ formatDate(authStore.user.createdAt) }}</span>
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
            title="Sign-in details"
            subtitle="Change your username or password"
            icon="key"
            size="small"
          />

          <VDivider />

          <VCardText class="pa-4">
            <VRow>
              <VCol cols="12">
                <VTextField
                  v-model="accountForm.username"
                  autocomplete="username"
                  :error-messages="validationErrors('username')"
                  @input="touchField('username')"
                >
                  <template #label>
                    Username <span class="text-red">*</span>
                  </template>
                </VTextField>
              </VCol>
              <VCol
                cols="12"
                md="6"
              >
                <VTextField
                  v-model="accountForm.newPassword"
                  label="New password"
                  autocomplete="new-password"
                  hint="At least 8 characters. Leave blank to keep your current password."
                  persistent-hint
                  :type="isPasswordVisible ? 'text' : 'password'"
                  :error-messages="validationErrors('newPassword')"
                  @input="touchField('newPassword')"
                />
              </VCol>
              <VCol
                cols="12"
                md="6"
              >
                <VTextField
                  v-model="accountForm.confirmPassword"
                  label="Confirm new password"
                  autocomplete="new-password"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  :error-messages="validationErrors('confirmPassword')"
                  @input="touchField('confirmPassword')"
                />
              </VCol>
              <VCol cols="12">
                <VDivider class="mb-4" />
                <VTextField
                  v-model="accountForm.currentPassword"
                  autocomplete="current-password"
                  hint="Required to confirm any change"
                  persistent-hint
                  :type="isPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isPasswordVisible ? 'eye-off' : 'eye'"
                  :error-messages="validationErrors('currentPassword')"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                  @input="touchField('currentPassword')"
                >
                  <template #label>
                    Current password <span class="text-red">*</span>
                  </template>
                </VTextField>
              </VCol>
              <VCol
                cols="12"
                class="d-flex justify-end"
              >
                <VBtn
                  :loading="isSaving"
                  prepend-icon="save"
                  @click="saveAccount"
                >
                  Update account
                </VBtn>
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </section>
</template>
