<script setup lang="ts">
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import type CollectionService from '@/services/portfolio/CollectionService'
import type { Experience } from '@/types/portfolio'
import { rules } from '@/composable/validation/useRules'

interface Props {
  isDrawerOpen: boolean
  service: CollectionService<Experience>
  nextOrder: number
}
interface Emit {
  (e: 'update:isDrawerOpen', value: boolean): void
  (e: 'refresh'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emit>()

const isSaving = ref(false)
const currentItem = ref<Experience | null>(null)

const defaultForm = () => ({
  role: '',
  company: '',
  date: '',
  stack: [] as string[],
  bullets: [] as string[],
})

const formData = reactive(defaultForm())

const { validationErrors, touchField, touch, resetValidation, hasError } =
  useFormValidation({ role: { required: rules.required } }, formData)

const closeDrawer = () => emit('update:isDrawerOpen', false)

const cleanList = (list: string[]) => list.map(item => item.trim()).filter(Boolean)

const handleSubmit = async () => {
  touch()
  if (hasError.value) return

  const payload: Partial<Experience> = {
    role: formData.role.trim(),
    company: formData.company.trim(),
    date: formData.date.trim(),
    stack: cleanList(formData.stack),
    bullets: cleanList(formData.bullets),
  }

  isSaving.value = true
  try {
    if (currentItem.value) {
      await props.service.update(currentItem.value._id, payload)
      showSuccess('Role updated')
    }
    else {
      await props.service.store({ ...payload, order: props.nextOrder })
      showSuccess('Role added')
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

const edit = (item: Experience) => {
  currentItem.value = item
  Object.assign(formData, {
    role: item.role ?? '',
    company: item.company ?? '',
    date: item.date ?? '',
    stack: [...(item.stack ?? [])],
    bullets: [...(item.bullets ?? [])],
  })
}

defineExpose({ edit })

// Start every opening from a clean form; edit() fills it in right after (parents call it on nextTick)
watch(() => props.isDrawerOpen, isOpen => {
  if (isOpen) {
    currentItem.value = null
    Object.assign(formData, defaultForm())
    nextTick(() => resetValidation())
  }
})
</script>

<template>
  <VNavigationDrawer
    temporary
    :width="640"
    location="end"
    class="scrollable-content"
    :model-value="props.isDrawerOpen"
    @update:model-value="(val: boolean) => emit('update:isDrawerOpen', val)"
  >
    <DrawerHeaderSection
      icon="briefcase"
      subtitle="An entry in the experience timeline"
      :title="currentItem ? 'Edit role' : 'Add role'"
      @cancel="closeDrawer"
    />

    <VDivider />

    <PerfectScrollbar
      :options="{ wheelPropagation: false }"
      class="h-100"
    >
      <VCard flat>
        <VCardText>
          <VRow>
            <VCol cols="12">
              <VTextField
                v-model="formData.role"
                :error-messages="validationErrors('role')"
                @input="touchField('role')"
              >
                <template #label>
                  Role <span class="text-red">*</span>
                </template>
              </VTextField>
            </VCol>
            <VCol
              cols="12"
              md="7"
            >
              <VTextField
                v-model="formData.company"
                label="Company / place"
              />
            </VCol>
            <VCol
              cols="12"
              md="5"
            >
              <VTextField
                v-model="formData.date"
                label="Date"
                placeholder="e.g. 2024 — Present"
              />
            </VCol>
            <VCol cols="12">
              <VCombobox
                v-model="formData.stack"
                label="Stack"
                placeholder="Type and press Enter to add"
                chips
                multiple
                closable-chips
                clearable
              />
            </VCol>
            <VCol cols="12">
              <StringListField
                v-model="formData.bullets"
                label="Bullet points"
                multiline
                add-label="Add bullet"
                empty-text="No bullet points yet."
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
                @click="handleSubmit"
              >
                {{ currentItem ? 'Update' : 'Save' }}
              </VBtn>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </PerfectScrollbar>
  </VNavigationDrawer>
</template>
