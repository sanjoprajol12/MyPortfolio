<script setup lang="ts">
import AuthService from '@/services/portfolio/AuthService'
import { VNodeRenderer } from '@/core/components/VNodeRenderer'
import { rules } from '@/composable/validation/useRules'
import { passwordProblem } from '@/utils/password'
import { appConfig } from '@themeConfig'

const authService = new AuthService()
const route = useRoute()

const token = computed(() => (typeof route.query.token === 'string' ? route.query.token : ''))
const form = reactive({ password: '', confirmPassword: '' })
const isLoading = ref(false)
const isPasswordVisible = ref(false)
const doneMessage = ref('')
const errorMessage = ref('')

const { validationErrors, touch, hasError } = useFormValidation(computed(() => ({
  password: {
    required: rules.required,
    strong: rules.custom((value: string) => !passwordProblem(value), 'Choose a stronger password (see the hint below)'),
  },
  confirmPassword: {
    sameAs: rules.custom((value: string) => value === form.password, 'Passwords do not match'),
  },
})), form)

async function submit() {
  touch()
  if (hasError.value) return

  isLoading.value = true
  errorMessage.value = ''
  try {
    const { message } = await authService.resetPassword(token.value, form.password)

    doneMessage.value = message
    Object.assign(form, { password: '', confirmPassword: '' })
  }
  catch (error: any) {
    errorMessage.value = error?.message || 'Something went wrong. Please try again.'
  }
  finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="auth-simple d-flex align-center justify-center pa-4">
    <VCard
      flat
      class="admin-card pa-2 pa-sm-6"
      max-width="440"
      width="100%"
    >
      <VCardText>
        <div class="d-flex justify-center mb-6">
          <VNodeRenderer :nodes="appConfig.app.logo" />
        </div>
        <h1 class="auth-simple__title text-center mb-1">
          Choose a new password
        </h1>
        <p class="text-body-1 text-medium-emphasis text-center mb-0">
          The link works once and expires 30 minutes after it was sent.
        </p>
      </VCardText>

      <VCardText>
        <VAlert
          v-if="!token"
          type="error"
          variant="tonal"
          icon="alert-circle"
        >
          This page needs the link from your reset email.
          <RouterLink :to="{ name: 'forgot-password' }">
            Request a new link
          </RouterLink>.
        </VAlert>

        <VAlert
          v-else-if="doneMessage"
          type="success"
          variant="tonal"
          icon="check"
        >
          {{ doneMessage }}
        </VAlert>

        <VForm
          v-else
          @submit.prevent="submit"
        >
          <VRow>
            <VCol cols="12">
              <VTextField
                v-model="form.password"
                autofocus
                label="New password"
                autocomplete="new-password"
                hint="At least 8 characters"
                persistent-hint
                :type="isPasswordVisible ? 'text' : 'password'"
                :append-inner-icon="isPasswordVisible ? 'eye-off' : 'eye'"
                :error-messages="validationErrors('password')"
                @click:append-inner="isPasswordVisible = !isPasswordVisible"
              />
              <PasswordStrength
                :password="form.password"
                class="mt-2"
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                v-model="form.confirmPassword"
                label="Confirm new password"
                autocomplete="new-password"
                :type="isPasswordVisible ? 'text' : 'password'"
                :error-messages="validationErrors('confirmPassword')"
              />
            </VCol>
            <VCol
              v-if="errorMessage"
              cols="12"
            >
              <VAlert
                type="error"
                variant="tonal"
                density="compact"
                icon="alert-circle"
              >
                {{ errorMessage }}
                <RouterLink :to="{ name: 'forgot-password' }">
                  Request a new link
                </RouterLink>
              </VAlert>
            </VCol>
            <VCol cols="12">
              <VBtn
                block
                size="large"
                type="submit"
                :loading="isLoading"
              >
                Change password
              </VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <VCardText class="text-center pt-0">
        <RouterLink
          :to="{ name: 'login' }"
          class="text-primary"
        >
          Back to sign in
        </RouterLink>
      </VCardText>
    </VCard>
  </div>
</template>

<style scoped>
.auth-simple {
  min-block-size: 100dvh;
}

.auth-simple__title {
  font-size: 1.5rem;
  font-weight: 600;
}
</style>
