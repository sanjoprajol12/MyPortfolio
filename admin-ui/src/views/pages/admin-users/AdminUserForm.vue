<script setup lang="ts">
import AdminUserService from '@/services/portfolio/AdminUserService'
import { useAuthStore } from '@/store/auth'
import type { AdminUserPayload as AdminUser, AuthUser as AdminUserView } from '@/types/portfolio'
import { rules } from '@/composable/validation/useRules'

interface Props { isDrawerOpen: boolean }
interface Emit {
  (e: 'update:isDrawerOpen', value: boolean): void
  (e: 'refresh'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emit>()

const adminUserService = new AdminUserService()
const authStore = useAuthStore()
const router = useRouter()

const isEditMode = ref(false)
const isSaving = ref(false)
const isPasswordVisible = ref(false)
const currentAdminUserId = ref<string | null>(null)

const roleOptions = [
  { title: 'Admin: edits portfolio content', value: 'admin' },
  { title: 'Super admin: also manages admin accounts', value: 'super_admin' },
]

const defaultForm = (): Required<AdminUser> => ({ username: '', password: '', role: 'admin' })

const adminUserFormData = reactive<Required<AdminUser>>(defaultForm())

// Password is required for new accounts; when editing, blank keeps the current one
const formValidationRules = computed(() => ({
  username: { required: rules.required },
  password: {
    required: rules.requiredIf(!isEditMode.value),
    minLength: rules.minLength(8),
  },
}))

const { validationErrors, touchField, touch, resetValidation, hasError } =
  useFormValidation(formValidationRules, adminUserFormData)

const resetForm = () => {
  Object.assign(adminUserFormData, defaultForm())
  isPasswordVisible.value = false
  nextTick(() => resetValidation())
}

const closeDrawer = () => {
  emit('update:isDrawerOpen', false)
}

const handleSubmitAdminUser = async () => {
  touch()

  if (hasError.value) return

  try {
    isSaving.value = true

    const payload: Partial<AdminUser> = {
      username: adminUserFormData.username.trim(),
      role: adminUserFormData.role,
    }

    if (adminUserFormData.password)
      payload.password = adminUserFormData.password

    if (isEditMode.value && currentAdminUserId.value) {
      const { token, user: updated } = await adminUserService.update(currentAdminUserId.value, payload)

      const isSelf = updated.id === authStore.user?.id

      if (isSelf)
        authStore.setAuth(updated, token)
      showSuccess('Admin user updated')

      // A super admin who demoted themselves can no longer open this page
      if (isSelf && updated.role !== 'super_admin') {
        closeDrawer()
        await router.push({ name: 'dashboard' })

        return
      }
    }
    else {
      await adminUserService.store(payload as AdminUser)
      showSuccess('Admin user added')
    }
    emit('refresh')
    closeDrawer()
  }
  catch (error) {
    showError(error)
  }
  finally {
    isSaving.value = false
  }
}

const editAdminUserData = (val: AdminUserView) => {
  isEditMode.value = true
  currentAdminUserId.value = val.id

  Object.assign(adminUserFormData, {
    username: val.username ?? '',
    password: '',
    role: val.role ?? 'admin',
  })
}

defineExpose({ edit: editAdminUserData })

// Start every opening from a clean form; edit() fills it in right after (parents call it on nextTick).
// Resetting on open rather than on a timer after close means a quick close-then-reopen can't wipe the new data.
watch(
  () => props.isDrawerOpen,
  (isOpen: boolean) => {
    if (isOpen) {
      isEditMode.value = false
      currentAdminUserId.value = null
      resetForm()
    }
  },
)
</script>

<template>
  <VNavigationDrawer
    temporary
    :width="480"
    location="end"
    :model-value="props.isDrawerOpen"
    @update:model-value="(val: boolean) => emit('update:isDrawerOpen', val)"
  >
    <DrawerHeaderSection
      icon="users"
      subtitle="An account that can sign in to this portal"
      :title="isEditMode ? 'Edit admin user' : 'Add admin user'"
      @cancel="closeDrawer"
    />

    <VDivider />

    <VCard flat>
      <VCardText>
        <VRow>
          <VCol cols="12">
            <VTextField
              v-model="adminUserFormData.username"
              autocomplete="off"
              :error-messages="validationErrors('username')"
              @input="touchField('username')"
            >
              <template #label>
                Username <span class="text-red">*</span>
              </template>
            </VTextField>
          </VCol>

          <VCol cols="12">
            <VTextField
              v-model="adminUserFormData.password"
              autocomplete="new-password"
              :type="isPasswordVisible ? 'text' : 'password'"
              :append-inner-icon="isPasswordVisible ? 'eye-off' : 'eye'"
              :hint="isEditMode ? 'Leave blank to keep the current password. Changing it signs them out.' : 'At least 8 characters'"
              persistent-hint
              :error-messages="validationErrors('password')"
              @click:append-inner="isPasswordVisible = !isPasswordVisible"
              @input="touchField('password')"
            >
              <template #label>
                {{ isEditMode ? 'New password' : 'Password' }}
                <span
                  v-if="!isEditMode"
                  class="text-red"
                >*</span>
              </template>
            </VTextField>
          </VCol>

          <VCol cols="12">
            <VSelect
              v-model="adminUserFormData.role"
              :items="roleOptions"
              label="Role"
            />
          </VCol>

          <VCol
            cols="12"
            class="d-flex justify-end gap-3"
          >
            <VBtn
              variant="text"
              color="secondary"
              prepend-icon="x"
              :disabled="isSaving"
              @click="closeDrawer"
            >
              Cancel
            </VBtn>
            <VBtn
              :loading="isSaving"
              prepend-icon="save"
              @click="handleSubmitAdminUser"
            >
              {{ isEditMode ? 'Update' : 'Save' }}
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>
  </VNavigationDrawer>
</template>
