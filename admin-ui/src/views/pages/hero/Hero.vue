<script setup lang="ts">
import { toDottedPaths } from '@/services/portfolio/SiteService'
import type { Hero, HeroStat } from '@/types/portfolio'

type HeroFields = Omit<Hero, 'photoUrl'>

const siteForm = reactive({
  firstName: '',
  lastName: '',
  pageTitle: '',
  footerCopy: '',
})

const heroForm = reactive<HeroFields>({
  eyebrow: '',
  eyebrowHighlight: '',
  headlineLine1: '',
  headlineLine2: '',
  headlineLine3: '',
  locationLabel: '',
  description: '',
  photoName: '',
  photoRole: '',
  stats: [],
  primaryStack: [],
})

const photoUrl = ref('')

const { isLoading, isSaving, save } = useSiteDocument(site => {
  const hero = site.hero

  Object.assign(siteForm, {
    firstName: site.firstName ?? '',
    lastName: site.lastName ?? '',
    pageTitle: site.pageTitle ?? '',
    footerCopy: site.footerCopy ?? '',
  })

  Object.assign(heroForm, {
    eyebrow: hero?.eyebrow ?? '',
    eyebrowHighlight: hero?.eyebrowHighlight ?? '',
    headlineLine1: hero?.headlineLine1 ?? '',
    headlineLine2: hero?.headlineLine2 ?? '',
    headlineLine3: hero?.headlineLine3 ?? '',
    locationLabel: hero?.locationLabel ?? '',
    description: hero?.description ?? '',
    photoName: hero?.photoName ?? '',
    photoRole: hero?.photoRole ?? '',
    stats: (hero?.stats ?? []).map(stat => ({ num: stat.num ?? '', label: stat.label ?? '', fullWidth: !!stat.fullWidth })),
    primaryStack: [...(hero?.primaryStack ?? [])],
  })

  photoUrl.value = hero?.photoUrl ?? ''
})

const newStat = (): HeroStat => ({ num: '', label: '', fullWidth: false })

const saveHero = () => save({
  ...siteForm,
  ...toDottedPaths('hero', {
    ...heroForm,
    stats: heroForm.stats.filter(stat => stat.num.trim() || stat.label.trim()),
    primaryStack: heroForm.primaryStack.map(item => item.trim()).filter(Boolean),
  }),
}, 'Hero & site saved')
</script>

<template>
  <section>
    <VRow>
      <VCol
        cols="12"
        lg="8"
      >
        <VCard
          flat
          class="admin-card"
        >
          <PageHeader
            title="Hero & site"
            icon="layout"
          >
            <template #subtitle>
              Your name, the headline at the top of the page and the hero stats.
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
                  title="Site"
                  icon="globe"
                />
              </VCol>
              <VCol
                cols="12"
                md="6"
              >
                <VTextField
                  v-model="siteForm.firstName"
                  label="First name"
                />
              </VCol>
              <VCol
                cols="12"
                md="6"
              >
                <VTextField
                  v-model="siteForm.lastName"
                  label="Last name"
                />
              </VCol>
              <VCol cols="12">
                <VTextField
                  v-model="siteForm.pageTitle"
                  label="Browser tab title"
                />
              </VCol>
              <VCol cols="12">
                <VTextField
                  v-model="siteForm.footerCopy"
                  label="Footer text"
                />
              </VCol>

              <VCol cols="12">
                <SectionLabel
                  title="Headline"
                  icon="type"
                />
              </VCol>
              <VCol
                cols="12"
                md="6"
              >
                <VTextField
                  v-model="heroForm.eyebrow"
                  label="Eyebrow"
                />
              </VCol>
              <VCol
                cols="12"
                md="6"
              >
                <VTextField
                  v-model="heroForm.eyebrowHighlight"
                  label="Eyebrow highlight"
                />
              </VCol>
              <VCol
                cols="12"
                md="4"
              >
                <VTextField
                  v-model="heroForm.headlineLine1"
                  label="Headline line 1"
                />
              </VCol>
              <VCol
                cols="12"
                md="4"
              >
                <VTextField
                  v-model="heroForm.headlineLine2"
                  label="Headline line 2"
                />
              </VCol>
              <VCol
                cols="12"
                md="4"
              >
                <VTextField
                  v-model="heroForm.headlineLine3"
                  label="Headline line 3"
                  hint="Shown in gold italic"
                  persistent-hint
                />
              </VCol>
              <VCol cols="12">
                <VTextField
                  v-model="heroForm.locationLabel"
                  label="Location label"
                />
              </VCol>
              <VCol cols="12">
                <VTextarea
                  v-model="heroForm.description"
                  label="Description"
                  rows="3"
                  auto-grow
                />
              </VCol>
              <VCol cols="12">
                <VCombobox
                  v-model="heroForm.primaryStack"
                  label="Primary stack"
                  placeholder="Type and press Enter to add"
                  chips
                  multiple
                  closable-chips
                  clearable
                />
              </VCol>

              <VCol cols="12">
                <SectionLabel
                  title="Stats"
                  icon="trending-up"
                  subtitle="The figures beside the headline, e.g. 9+ Projects."
                />
              </VCol>
              <VCol cols="12">
                <ListEditor
                  v-model="heroForm.stats"
                  :new-item="newStat"
                  add-label="Add stat"
                  empty-text="No stats yet."
                >
                  <template #default="{ item }">
                    <VRow dense>
                      <VCol
                        cols="12"
                        sm="3"
                      >
                        <VTextField
                          v-model="item.num"
                          label="Number"
                          density="compact"
                        />
                      </VCol>
                      <VCol
                        cols="12"
                        sm="6"
                      >
                        <VTextField
                          v-model="item.label"
                          label="Label"
                          density="compact"
                        />
                      </VCol>
                      <VCol
                        cols="12"
                        sm="3"
                        class="d-flex align-center"
                      >
                        <VSwitch
                          v-model="item.fullWidth"
                          label="Full width"
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
                  @click="saveHero"
                >
                  Save changes
                </VBtn>
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VCol>

      <VCol
        cols="12"
        lg="4"
      >
        <VCard
          flat
          class="admin-card"
        >
          <PageHeader
            title="Profile photo"
            icon="image"
            size="small"
          />

          <VDivider />

          <VCardText>
            <PhotoUploadField
              :photo-url="photoUrl"
              @uploaded="(url: string) => photoUrl = url"
            />
          </VCardText>

          <VDivider />

          <VCardText>
            <VRow>
              <VCol cols="12">
                <VTextField
                  v-model="heroForm.photoName"
                  label="Name on photo"
                />
              </VCol>
              <VCol cols="12">
                <VTextField
                  v-model="heroForm.photoRole"
                  label="Role on photo"
                  hint="Saved with the main form"
                  persistent-hint
                />
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </section>
</template>
