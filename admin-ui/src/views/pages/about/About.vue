<script setup lang="ts">
import type { AboutMeta } from '@/types/portfolio'

const aboutForm = reactive({
  paragraphs: [] as string[],
  meta: [] as AboutMeta[],
})

const { isLoading, isSaving, save } = useSiteDocument(site => {
  aboutForm.paragraphs = [...(site.about?.paragraphs ?? [])]
  aboutForm.meta = (site.about?.meta ?? []).map(row => ({ key: row.key ?? '', value: row.value ?? '', highlight: !!row.highlight }))
})

const newMeta = (): AboutMeta => ({ key: '', value: '', highlight: false })

const saveAbout = () => save({
  about: {
    paragraphs: aboutForm.paragraphs.map(text => text.trim()).filter(Boolean),
    meta: aboutForm.meta.filter(row => row.key.trim() || row.value.trim()),
  },
}, 'About saved')
</script>

<template>
  <section>
    <VCard
      flat
      class="admin-card"
    >
      <PageHeader
        title="About"
        icon="user-round"
      >
        <template #subtitle>
          Wrap words in **double asterisks** to make them bold on the site.
        </template>
      </PageHeader>

      <VDivider />

      <VProgressLinear
        v-if="isLoading"
        indeterminate
      />

      <VCardText>
        <VRow>
          <VCol cols="12">
            <SectionLabel
              title="Paragraphs"
              icon="file-text"
            />
          </VCol>
          <VCol cols="12">
            <StringListField
              v-model="aboutForm.paragraphs"
              multiline
              add-label="Add paragraph"
              empty-text="No paragraphs yet."
            />
          </VCol>

          <VCol cols="12">
            <SectionLabel
              title="Sidebar rows"
              icon="list-checks"
              subtitle="Highlighted rows are styled in gold. A row with the key &quot;Education&quot; is also used on the resume when it has no education entries."
            />
          </VCol>
          <VCol cols="12">
            <ListEditor
              v-model="aboutForm.meta"
              :new-item="newMeta"
              add-label="Add row"
              empty-text="No sidebar rows yet."
            >
              <template #default="{ item }">
                <VRow dense>
                  <VCol
                    cols="12"
                    sm="4"
                  >
                    <VTextField
                      v-model="item.key"
                      label="Key"
                      density="compact"
                    />
                  </VCol>
                  <VCol
                    cols="12"
                    sm="5"
                  >
                    <VTextField
                      v-model="item.value"
                      label="Value"
                      density="compact"
                    />
                  </VCol>
                  <VCol
                    cols="12"
                    sm="3"
                    class="d-flex align-center"
                  >
                    <VSwitch
                      v-model="item.highlight"
                      label="Highlight"
                      density="compact"
                    />
                  </VCol>
                </VRow>
              </template>
            </ListEditor>
          </VCol>

          <VCol
            cols="12"
            class="d-flex justify-end"
          >
            <VBtn
              :loading="isSaving"
              :disabled="isLoading"
              prepend-icon="save"
              @click="saveAbout"
            >
              Save changes
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>
  </section>
</template>
