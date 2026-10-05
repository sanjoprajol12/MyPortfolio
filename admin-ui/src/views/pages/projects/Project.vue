<script setup lang="ts">
import ProjectForm from './ProjectForm.vue'
import type { Project } from '@/types/portfolio'

const { service, isLoading, items, nextOrder, fetchItems, saveOrder, confirmDelete } = useOrderedCollection<Project>('projects')

const isDrawerVisible = ref(false)
const projectFormRef = ref()

const tableHeaders = [
  { title: 'Project', label: 'title' },
  { title: 'Badge', label: 'status' },
  { title: 'Techs', label: 'techs' },
  { title: 'Links', label: 'links' },
  { title: 'Actions', label: 'actions', textAlign: 'center' as const },
]

// Mirrors the badge logic in js/portfolio.js: "live" falls back to a default label,
// "type" only shows when it has a label
const badgeLabel = (item: Project) => {
  if (item.statusKind === 'live') return item.statusLabel || '● Live'
  if (item.statusKind === 'type') return item.statusLabel

  return ''
}

const openAddDrawer = () => {
  isDrawerVisible.value = true
}

const editProject = (item: Project) => {
  isDrawerVisible.value = true
  nextTick(() => projectFormRef.value?.edit(item))
}

const deleteProject = (item: Project) => confirmDelete(item, `Delete the "${item.title}" project?`, 'Project deleted')
</script>

<template>
  <section>
    <VCard
      flat
      class="admin-card"
    >
      <PageHeader
        title="Projects"
        icon="folder-git-2"
      >
        <template #subtitle>
          Featured projects. A live URL makes the card clickable. Drag rows to reorder.
        </template>
        <template #actions>
          <VBtn
            prepend-icon="plus"
            @click="openAddDrawer"
          >
            Add project
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
        empty-table-text="No projects yet"
        draggable-sort
        @sort-items="saveOrder"
      >
        <template #title="{ row: item }">
          <div
            class="d-flex align-center gap-3 cursor-pointer"
            @click="editProject(item)"
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
              <div class="text-caption text-disabled text-truncate-2">
                {{ item.description }}
              </div>
            </div>
          </div>
        </template>

        <template #status="{ row: item }">
          <VChip
            v-if="badgeLabel(item)"
            size="small"
            :color="item.statusKind === 'live' ? 'success' : 'info'"
            variant="tonal"
          >
            {{ badgeLabel(item) }}
          </VChip>
          <span v-else>-</span>
        </template>

        <template #techs="{ row: item }">
          <div class="d-flex flex-wrap gap-1 py-2">
            <VChip
              v-for="tech in item.techs"
              :key="tech"
              size="x-small"
              variant="tonal"
            >
              {{ tech }}
            </VChip>
            <span v-if="!item.techs?.length">-</span>
          </div>
        </template>

        <template #links="{ row: item }">
          <div class="d-flex gap-1">
            <IconBtn
              v-if="item.liveUrl"
              size="small"
              :href="item.liveUrl"
              target="_blank"
              rel="noopener noreferrer"
            >
              <VIcon icon="external-link" />
              <VTooltip activator="parent">
                Live site
              </VTooltip>
            </IconBtn>
            <IconBtn
              v-if="item.githubUrl"
              size="small"
              :href="item.githubUrl"
              target="_blank"
              rel="noopener noreferrer"
            >
              <VIcon icon="github" />
              <VTooltip activator="parent">
                Repository
              </VTooltip>
            </IconBtn>
            <span v-if="!item.liveUrl && !item.githubUrl">-</span>
          </div>
        </template>

        <template #actions="{ row: item }">
          <RowActions
            @edit="editProject(item)"
            @delete="deleteProject(item)"
          />
        </template>
      </CustomTable>
    </VCard>

    <ProjectForm
      ref="projectFormRef"
      v-model:is-drawer-open="isDrawerVisible"
      :service="service"
      :next-order="nextOrder"
      @refresh="fetchItems"
    />
  </section>
</template>
