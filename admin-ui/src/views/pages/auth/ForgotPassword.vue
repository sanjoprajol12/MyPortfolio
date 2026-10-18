<script setup lang="ts">
import AuthService from '@/services/portfolio/AuthService'
import { VNodeRenderer } from '@/core/components/VNodeRenderer'
import { rules } from '@/composable/validation/useRules'
import { appConfig } from '@themeConfig'

const authService = new AuthService()

const form = reactive({ email: '' })
const isLoading = ref(false)
const sentMessage = ref('')
const errorMessage = ref('')

const { validationErrors, touch, hasError } = useFormValidation(
  { email: { required: rules.required, email: rules.email } },
  form,
)

async function submit() {
  touch()
  if (hasError.value) return

  isLoading.value = true
  errorMessage.value = ''
  try {
    const { message } = await authService.forgotPassword(form.email.trim())

    sentMessage.value = message
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
          Forgot your password?
        </h1>
        <p class="text-body-1 text-medium-emphasis text-center mb-0">
          Enter the email address on your admin account and we will send a reset link.
        </p>
      </VCardText>

      <VCardText>
        <VAlert
          v-if="sentMessage"
          type="success"
          variant="tonal"
          icon="mail"
        >
          {{ sentMessage }}
        </VAlert>

        <VForm
          v-else
          @submit.prevent="submit"
        >
          <VRow>
            <VCol cols="12">
              <VTextField
                v-model="form.email"
                autofocus
                type="email"
                label="Email"
                autocomplete="email"
                prepend-inner-icon="mail"
                :error-messages="validationErrors('email')"
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
              </VAlert>
            </VCol>
            <VCol cols="12">
              <VBtn
                block
                size="large"
                type="submit"
                :loading="isLoading"
              >
                Send reset link
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
