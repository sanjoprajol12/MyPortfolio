<script setup lang="ts">
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import type CollectionService from '@/services/portfolio/CollectionService'
import type { Skill } from '@/types/portfolio'
import { rules } from '@/composable/validation/useRules'

interface Props {
  isDrawerOpen: boolean
  service: CollectionService<Skill>
  nextOrder: number
}
interface Emit {
  (e: 'update:isDrawerOpen', value: boolean): void
  (e: 'refresh'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emit>()

const isSaving = ref(false)
const currentItem = ref<Skill | null>(null)

const defaultForm = () => ({
  title: '',
  subtitle: '',
  fullWidth: false,
  tagNames: [] as string[],
  highlighted: [] as string[],
})

const formData = reactive(defaultForm())

const { validationErrors, touchField, touch, resetValidation, hasError } =
  useFormValidation({ title: { required: rules.required } }, formData)

// Highlighted tags can only be picked from the tags in the list
watch(() => formData.tagNames, names => {
  formData.highlighted = formData.highlighted.filter(name => names.includes(name))
})

const closeDrawer = () => emit('update:isDrawerOpen', false)

const handleSubmit = async () => {
  touch()
  if (hasError.value) return

  const names = [...new Set(formData.tagNames.map(name => name.trim()).filter(Boolean))]

  const payload: Partial<Skill> = {
    title: formData.title.trim(),
    subtitle: formData.subtitle.trim(),
    fullWidth: formData.fullWidth,
    tags: names.map(name => ({ name, highlight: formData.highlighted.includes(name) })),
  }

  isSaving.value = true
  try {
    if (currentItem.value) {
      await props.service.update(currentItem.value._id, payload)
      showSuccess('Skill category updated')
    }
    else {
      await props.service.store({ ...payload, order: props.nextOrder })
      showSuccess('Skill category added')
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

const edit = (item: Skill) => {
  currentItem.value = item
  Object.assign(formData, {
    title: item.title ?? '',
    subtitle: item.subtitle ?? '',
    fullWidth: !!item.fullWidth,
    tagNames: (item.tags ?? []).map(tag => tag.name),
    highlighted: (item.tags ?? []).filter(tag => tag.highlight).map(tag => tag.name),
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
    :width="560"
    location="end"
    class="scrollable-content"
    :model-value="props.isDrawerOpen"
    @update:model-value="(val: boolean) => emit('update:isDrawerOpen', val)"
  >
    <DrawerHeaderSection
      icon="layers"
      subtitle="A group of tags in the skills section"
      :title="currentItem ? 'Edit skill category' : 'Add skill category'"
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
                v-model="formData.title"
                :error-messages="validationErrors('title')"
                @input="touchField('title')"
              >
                <template #label>
                  Title <span class="text-red">*</span>
                </template>
              </VTextField>
            </VCol>
            <VCol cols="12">
              <VTextField
                v-model="formData.subtitle"
                label="Subtitle"
              />
            </VCol>
            <VCol cols="12">
              <VSwitch
                v-model="formData.fullWidth"
                label="Full width row"
              />
            </VCol>
            <VCol cols="12">
              <VCombobox
                v-model="formData.tagNames"
                label="Tags"
                placeholder="Type and press Enter to add"
                chips
                multiple
                closable-chips
                clearable
              />
            </VCol>
            <VCol cols="12">
              <VSelect
                v-model="formData.highlighted"
                :items="formData.tagNames"
                label="Highlighted tags"
                hint="Shown in gold on the site"
                persistent-hint
                chips
                multiple
                closable-chips
                :disabled="!formData.tagNames.length"
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
