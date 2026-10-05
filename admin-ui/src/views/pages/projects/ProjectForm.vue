<script setup lang="ts">
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import type CollectionService from '@/services/portfolio/CollectionService'
import type { Project, ProjectStatusKind } from '@/types/portfolio'
import { rules } from '@/composable/validation/useRules'

interface Props {
  isDrawerOpen: boolean
  service: CollectionService<Project>
  nextOrder: number
}
interface Emit {
  (e: 'update:isDrawerOpen', value: boolean): void
  (e: 'refresh'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emit>()

const isSaving = ref(false)
const currentItem = ref<Project | null>(null)

const statusOptions: { title: string, value: ProjectStatusKind }[] = [
  { title: 'None', value: 'none' },
  { title: 'Live (green)', value: 'live' },
  { title: 'Type (teal)', value: 'type' },
]

const defaultForm = () => ({
  title: '',
  description: '',
  liveUrl: '',
  githubUrl: '',
  statusKind: 'none' as ProjectStatusKind,
  statusLabel: '',
  techs: [] as string[],
  features: [] as string[],
})

const formData = reactive(defaultForm())

const optionalUrl = rules.custom(
  (value: string) => !value || /^https?:\/\/\S+$/i.test(value),
  'Enter a full URL starting with http:// or https://',
)

const formValidationRules = {
  title: { required: rules.required },
  liveUrl: { optionalUrl },
  githubUrl: { optionalUrl },
}

const { validationErrors, touchField, touch, resetValidation, hasError } =
  useFormValidation(formValidationRules, formData)

const closeDrawer = () => emit('update:isDrawerOpen', false)

const cleanList = (list: string[]) => list.map(item => item.trim()).filter(Boolean)

const handleSubmit = async () => {
  touch()
  if (hasError.value) return

  const payload: Partial<Project> = {
    title: formData.title.trim(),
    description: formData.description.trim(),
    liveUrl: formData.liveUrl.trim(),
    githubUrl: formData.githubUrl.trim(),
    statusKind: formData.statusKind,
    statusLabel: formData.statusLabel.trim(),
    techs: cleanList(formData.techs),
    features: cleanList(formData.features),
  }

  isSaving.value = true
  try {
    if (currentItem.value) {
      await props.service.update(currentItem.value._id, payload)
      showSuccess('Project updated')
    }
    else {
      await props.service.store({ ...payload, order: props.nextOrder })
      showSuccess('Project added')
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

const edit = (item: Project) => {
  currentItem.value = item
  Object.assign(formData, {
    title: item.title ?? '',
    description: item.description ?? '',
    liveUrl: item.liveUrl ?? '',
    githubUrl: item.githubUrl ?? '',
    statusKind: item.statusKind ?? 'none',
    statusLabel: item.statusLabel ?? '',
    techs: [...(item.techs ?? [])],
    features: [...(item.features ?? [])],
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
    :width="720"
    location="end"
    class="scrollable-content"
    :model-value="props.isDrawerOpen"
    @update:model-value="(val: boolean) => emit('update:isDrawerOpen', val)"
  >
    <DrawerHeaderSection
      icon="folder-git-2"
      subtitle="A card in the projects section"
      :title="currentItem ? 'Edit project' : 'Add project'"
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
              <SectionLabel
                title="Overview"
                icon="file-text"
              />
            </VCol>
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
              <VTextarea
                v-model="formData.description"
                label="Description"
                rows="3"
                auto-grow
              />
            </VCol>
            <VCol cols="12">
              <VCombobox
                v-model="formData.techs"
                label="Techs"
                placeholder="Type and press Enter to add"
                chips
                multiple
                closable-chips
                clearable
              />
            </VCol>

            <VCol cols="12">
              <SectionLabel
                title="Badge"
                icon="tag"
              />
            </VCol>
            <VCol
              cols="12"
              md="5"
            >
              <VSelect
                v-model="formData.statusKind"
                :items="statusOptions"
                label="Badge type"
              />
            </VCol>
            <VCol
              cols="12"
              md="7"
            >
              <VTextField
                v-model="formData.statusLabel"
                label="Badge label"
                :placeholder="formData.statusKind === 'live' ? 'Defaults to ● Live' : 'Required for a type badge'"
                :disabled="formData.statusKind === 'none'"
              />
            </VCol>

            <VCol cols="12">
              <SectionLabel
                title="Links"
                icon="globe"
              />
            </VCol>
            <VCol
              cols="12"
              md="6"
            >
              <VTextField
                v-model="formData.liveUrl"
                label="Live URL"
                placeholder="https://"
                prepend-inner-icon="globe"
                :error-messages="validationErrors('liveUrl')"
                @input="touchField('liveUrl')"
              />
            </VCol>
            <VCol
              cols="12"
              md="6"
            >
              <VTextField
                v-model="formData.githubUrl"
                label="GitHub URL"
                placeholder="https://github.com/..."
                prepend-inner-icon="github"
                :error-messages="validationErrors('githubUrl')"
                @input="touchField('githubUrl')"
              />
            </VCol>

            <VCol cols="12">
              <SectionLabel
                title="Features"
                icon="list-checks"
              />
            </VCol>
            <VCol cols="12">
              <StringListField
                v-model="formData.features"
                add-label="Add feature"
                empty-text="No features yet."
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
