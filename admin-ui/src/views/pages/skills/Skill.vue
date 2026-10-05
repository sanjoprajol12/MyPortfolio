<script setup lang="ts">
import SkillForm from './SkillForm.vue'
import type { Skill } from '@/types/portfolio'

const { service, isLoading, items, nextOrder, fetchItems, saveOrder, confirmDelete } = useOrderedCollection<Skill>('skills')

const isDrawerVisible = ref(false)
const skillFormRef = ref()

const tableHeaders = [
  { title: 'Category', label: 'title' },
  { title: 'Tags', label: 'tags' },
  { title: 'Layout', label: 'fullWidth' },
  { title: 'Actions', label: 'actions', textAlign: 'center' as const },
]

const openAddDrawer = () => {
  isDrawerVisible.value = true
}

const editSkill = (item: Skill) => {
  isDrawerVisible.value = true
  nextTick(() => skillFormRef.value?.edit(item))
}

const deleteSkill = (item: Skill) => confirmDelete(item, `Delete the "${item.title}" skill category?`, 'Skill category deleted')
</script>

<template>
  <section>
    <VCard
      flat
      class="admin-card"
    >
      <PageHeader
        title="Skills"
        icon="layers"
      >
        <template #subtitle>
          Skill categories and their tags. Drag rows to reorder.
        </template>
        <template #actions>
          <VBtn
            prepend-icon="plus"
            @click="openAddDrawer"
          >
            Add category
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
        empty-table-text="No skill categories yet"
        draggable-sort
        @sort-items="saveOrder"
      >
        <template #title="{ row: item }">
          <div
            class="d-flex align-center gap-3 cursor-pointer"
            @click="editSkill(item)"
          >
            <VIcon
              size="small"
              icon="grip-vertical"
              class="text-disabled"
            />
            <div>
              <div class="title-hover font-weight-medium">
                {{ item.title }}
              </div>
              <div
                v-if="item.subtitle"
                class="text-caption text-disabled"
              >
                {{ item.subtitle }}
              </div>
            </div>
          </div>
        </template>

        <template #tags="{ row: item }">
          <div class="d-flex flex-wrap gap-1 py-2">
            <VChip
              v-for="tag in item.tags"
              :key="tag.name"
              size="x-small"
              :color="tag.highlight ? 'primary' : undefined"
              variant="tonal"
            >
              {{ tag.name }}
            </VChip>
            <span v-if="!item.tags?.length">-</span>
          </div>
        </template>

        <template #fullWidth="{ row: item }">
          {{ item.fullWidth ? 'Full width' : 'Half width' }}
        </template>

        <template #actions="{ row: item }">
          <RowActions
            @edit="editSkill(item)"
            @delete="deleteSkill(item)"
          />
        </template>
      </CustomTable>
    </VCard>

    <SkillForm
      ref="skillFormRef"
      v-model:is-drawer-open="isDrawerVisible"
      :service="service"
      :next-order="nextOrder"
      @refresh="fetchItems"
    />
  </section>
</template>
