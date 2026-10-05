<script setup lang="ts">
import ExperienceForm from './ExperienceForm.vue'
import type { Experience } from '@/types/portfolio'

const { service, isLoading, items, nextOrder, fetchItems, saveOrder, confirmDelete } = useOrderedCollection<Experience>('experience')

const isDrawerVisible = ref(false)
const experienceFormRef = ref()

const tableHeaders = [
  { title: 'Role', label: 'role' },
  { title: 'Date', label: 'date' },
  { title: 'Stack', label: 'stack' },
  { title: 'Actions', label: 'actions', textAlign: 'center' as const },
]

const openAddDrawer = () => {
  isDrawerVisible.value = true
}

const editExperience = (item: Experience) => {
  isDrawerVisible.value = true
  nextTick(() => experienceFormRef.value?.edit(item))
}

const deleteExperience = (item: Experience) => confirmDelete(item, `Delete the "${item.role}" role?`, 'Role deleted')
</script>

<template>
  <section>
    <VCard
      flat
      class="admin-card"
    >
      <PageHeader
        title="Experience"
        icon="briefcase"
      >
        <template #subtitle>
          Jobs, internships and freelance work. Drag rows to reorder.
        </template>
        <template #actions>
          <VBtn
            prepend-icon="plus"
            @click="openAddDrawer"
          >
            Add role
          </VBtn>
        </template>
      </PageHeader>

      <VDivider />

      <CustomTable
        :header="tableHeaders"
        :data="items"
        :loading="isLoading"
        :paginate="false"
        checkbox-label="_id"
        empty-table-text="No roles yet"
        draggable-sort
        @sort-items="saveOrder"
      >
        <template #role="{ row: item }">
          <div
            class="d-flex align-center gap-3 cursor-pointer"
            @click="editExperience(item)"
          >
            <VIcon
              size="small"
              icon="grip-vertical"
              class="text-disabled"
            />
            <div>
              <div class="title-hover font-weight-medium">
                {{ item.role }}
              </div>
              <div
                v-if="item.company"
                class="text-caption text-disabled"
              >
                {{ item.company }}
              </div>
            </div>
          </div>
        </template>

        <template #date="{ row: item }">
          <span class="text-no-wrap">{{ item.date || '-' }}</span>
        </template>

        <template #stack="{ row: item }">
          <div class="d-flex flex-wrap gap-1 py-2">
            <VChip
              v-for="tech in item.stack"
              :key="tech"
              size="x-small"
              variant="tonal"
            >
              {{ tech }}
            </VChip>
            <span v-if="!item.stack?.length">-</span>
          </div>
        </template>

        <template #actions="{ row: item }">
          <RowActions
            @edit="editExperience(item)"
            @delete="deleteExperience(item)"
          />
        </template>
      </CustomTable>
    </VCard>

    <ExperienceForm
      ref="experienceFormRef"
      v-model:is-drawer-open="isDrawerVisible"
      :service="service"
      :next-order="nextOrder"
      @refresh="fetchItems"
    />
  </section>
</template>
