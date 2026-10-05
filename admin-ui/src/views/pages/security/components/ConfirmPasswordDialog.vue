<script setup lang="ts">
const props = withDefaults(defineProps<{
  title: string
  message: string
  confirmLabel?: string
  loading?: boolean
  errorMessage?: string
}>(), {
  confirmLabel: 'Confirm',
  loading: false,
  errorMessage: '',
})

const emit = defineEmits<{
  (e: 'confirm', password: string): void
}>()

const isOpen = defineModel<boolean>({ default: false })

const password = ref('')
const isPasswordVisible = ref(false)

// Never keep a typed password around once the dialog closes
watch(isOpen, open => {
  if (!open) {
    password.value = ''
    isPasswordVisible.value = false
  }
})

const submit = () => {
  if (!password.value || props.loading) return
  emit('confirm', password.value)
}
</script>

<template>
  <VDialog
    v-model="isOpen"
    max-width="460"
    :persistent="props.loading"
  >
    <VCard>
      <DrawerHeaderSection
        :title="props.title"
        icon="lock"
        @cancel="isOpen = false"
      />
      <VDivider />
      <VForm @submit.prevent="submit">
        <VCardText>
          <p class="text-body-2 text-medium-emphasis mb-4">
            {{ props.message }}
          </p>
          <VTextField
            v-model="password"
            autofocus
            label="Current password"
            autocomplete="current-password"
            :type="isPasswordVisible ? 'text' : 'password'"
            :append-inner-icon="isPasswordVisible ? 'eye-off' : 'eye'"
            :error-messages="props.errorMessage ? [props.errorMessage] : []"
            @click:append-inner="isPasswordVisible = !isPasswordVisible"
          />
        </VCardText>
        <VCardActions class="justify-end pa-4 pt-0">
          <VBtn
            variant="text"
            :disabled="props.loading"
            @click="isOpen = false"
          >
            Cancel
          </VBtn>
          <VBtn
            type="submit"
            color="error"
            :loading="props.loading"
            :disabled="!password"
          >
            {{ props.confirmLabel }}
          </VBtn>
        </VCardActions>
      </VForm>
    </VCard>
  </VDialog>
</template>
