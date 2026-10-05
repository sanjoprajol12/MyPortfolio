<script setup lang="ts">
import { toDottedPaths } from '@/services/portfolio/SiteService'
import type { Award, Certification, Education, Language, Resume } from '@/types/portfolio'

const resumeForm = reactive<Resume>({
  headline: '',
  summary: '',
  location: '',
  website: '',
  includePhoto: false,
  showDownloadButtons: true,
  includeProjectsOnResume: false,
  resumeProjectLimit: 3,
  education: [],
  certifications: [],
  languages: [],
  awards: [],
  interests: [],
})

const { isLoading, isSaving, save } = useSiteDocument(site => {
  const resume = site.resume

  Object.assign(resumeForm, {
    headline: resume?.headline ?? '',
    summary: resume?.summary ?? '',
    location: resume?.location ?? '',
    website: resume?.website ?? '',
    includePhoto: !!resume?.includePhoto,

    // Matches the public site: the buttons show unless explicitly turned off
    showDownloadButtons: resume?.showDownloadButtons !== false,
    includeProjectsOnResume: !!resume?.includeProjectsOnResume,
    resumeProjectLimit: resume?.resumeProjectLimit ?? 3,
    education: (resume?.education ?? []).map(row => ({ degree: row.degree ?? '', school: row.school ?? '', years: row.years ?? '', details: row.details ?? '' })),
    certifications: (resume?.certifications ?? []).map(row => ({ name: row.name ?? '', issuer: row.issuer ?? '', year: row.year ?? '' })),
    languages: (resume?.languages ?? []).map(row => ({ name: row.name ?? '', level: row.level ?? '' })),
    awards: (resume?.awards ?? []).map(row => ({ name: row.name ?? '', year: row.year ?? '', details: row.details ?? '' })),
    interests: [...(resume?.interests ?? [])],
  })
})

const newEducation = (): Education => ({ degree: '', school: '', years: '', details: '' })
const newCertification = (): Certification => ({ name: '', issuer: '', year: '' })
const newLanguage = (): Language => ({ name: '', level: '' })
const newAward = (): Award => ({ name: '', year: '', details: '' })

// The PDF generator skips rows without these, so empty rows are dropped on save
const saveResume = () => save(toDottedPaths('resume', {
  ...resumeForm,
  resumeProjectLimit: Math.max(1, Number(resumeForm.resumeProjectLimit) || 3),
  education: resumeForm.education.filter(row => row.degree.trim() || row.school.trim()),
  certifications: resumeForm.certifications.filter(row => row.name.trim()),
  languages: resumeForm.languages.filter(row => row.name.trim()),
  awards: resumeForm.awards.filter(row => row.name.trim()),
  interests: resumeForm.interests.map(item => item.trim()).filter(Boolean),
}), 'Resume & CV saved')

const previews = [
  { title: 'Resume PDF', href: '/api/resume.pdf', icon: 'download' },
  { title: 'CV PDF', href: '/api/cv.pdf', icon: 'download' },
  { title: 'Resume page', href: '/resume.html', icon: 'external-link' },
]
</script>

<template>
  <section>
    <VCard
      flat
      class="admin-card"
    >
      <PageHeader
        title="Resume & CV"
        icon="file-text"
      >
        <template #subtitle>
          Content for the resume page and the downloadable PDFs. Skills, experience and contact details come from their own pages.
        </template>
        <template #actions>
          <VBtn
            v-for="preview in previews"
            :key="preview.href"
            variant="tonal"
            size="small"
            :href="preview.href"
            target="_blank"
            rel="noopener noreferrer"
            :append-icon="preview.icon"
          >
            {{ preview.title }}
          </VBtn>
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
              title="Header"
              icon="user"
              subtitle="Leave a field empty to reuse the matching hero or contact value."
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <VTextField
              v-model="resumeForm.headline"
              label="Headline"
              placeholder="Defaults to the role on your photo"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <VTextField
              v-model="resumeForm.location"
              label="Location"
              placeholder="Defaults to the hero location label"
            />
          </VCol>
          <VCol cols="12">
            <VTextField
              v-model="resumeForm.website"
              label="Website"
              placeholder="Defaults to the website in contact info"
              prepend-inner-icon="globe"
            />
          </VCol>
          <VCol cols="12">
            <VTextarea
              v-model="resumeForm.summary"
              label="Summary"
              placeholder="Defaults to the hero description"
              rows="3"
              auto-grow
            />
          </VCol>

          <VCol cols="12">
            <SectionLabel
              title="Options"
              icon="settings"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <VSwitch
              v-model="resumeForm.showDownloadButtons"
              label="Show PDF download buttons on the site"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <VSwitch
              v-model="resumeForm.includePhoto"
              label="Include profile photo in the PDFs"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <VSwitch
              v-model="resumeForm.includeProjectsOnResume"
              label="List projects on the resume"
              hint="The CV always lists projects"
              persistent-hint
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <VTextField
              v-model.number="resumeForm.resumeProjectLimit"
              label="Projects on the resume"
              type="number"
              min="1"
              :disabled="!resumeForm.includeProjectsOnResume"
            />
          </VCol>

          <VCol cols="12">
            <SectionLabel
              title="Education"
              icon="graduation-cap"
            />
          </VCol>
          <VCol cols="12">
            <ListEditor
              v-model="resumeForm.education"
              :new-item="newEducation"
              add-label="Add education"
              empty-text="No education entries. The &quot;Education&quot; row from About is used instead."
            >
              <template #default="{ item }">
                <VRow dense>
                  <VCol
                    cols="12"
                    sm="6"
                  >
                    <VTextField
                      v-model="item.degree"
                      label="Degree"
                      density="compact"
                    />
                  </VCol>
                  <VCol
                    cols="12"
                    sm="6"
                  >
                    <VTextField
                      v-model="item.school"
                      label="School"
                      density="compact"
                    />
                  </VCol>
                  <VCol
                    cols="12"
                    sm="4"
                  >
                    <VTextField
                      v-model="item.years"
                      label="Years"
                      density="compact"
                    />
                  </VCol>
                  <VCol
                    cols="12"
                    sm="8"
                  >
                    <VTextField
                      v-model="item.details"
                      label="Details"
                      density="compact"
                    />
                  </VCol>
                </VRow>
              </template>
            </ListEditor>
          </VCol>

          <VCol cols="12">
            <SectionLabel
              title="Certifications"
              icon="badge-check"
            />
          </VCol>
          <VCol cols="12">
            <ListEditor
              v-model="resumeForm.certifications"
              :new-item="newCertification"
              add-label="Add certification"
              empty-text="No certifications yet."
            >
              <template #default="{ item }">
                <VRow dense>
                  <VCol
                    cols="12"
                    sm="5"
                  >
                    <VTextField
                      v-model="item.name"
                      label="Name"
                      density="compact"
                    />
                  </VCol>
                  <VCol
                    cols="12"
                    sm="5"
                  >
                    <VTextField
                      v-model="item.issuer"
                      label="Issuer"
                      density="compact"
                    />
                  </VCol>
                  <VCol
                    cols="12"
                    sm="2"
                  >
                    <VTextField
                      v-model="item.year"
                      label="Year"
                      density="compact"
                    />
                  </VCol>
                </VRow>
              </template>
            </ListEditor>
          </VCol>

          <VCol cols="12">
            <SectionLabel
              title="Languages"
              icon="languages"
            />
          </VCol>
          <VCol cols="12">
            <ListEditor
              v-model="resumeForm.languages"
              :new-item="newLanguage"
              add-label="Add language"
              empty-text="No languages yet."
            >
              <template #default="{ item }">
                <VRow dense>
                  <VCol
                    cols="12"
                    sm="6"
                  >
                    <VTextField
                      v-model="item.name"
                      label="Language"
                      density="compact"
                    />
                  </VCol>
                  <VCol
                    cols="12"
                    sm="6"
                  >
                    <VTextField
                      v-model="item.level"
                      label="Level"
                      placeholder="e.g. Native, Fluent"
                      density="compact"
                    />
                  </VCol>
                </VRow>
              </template>
            </ListEditor>
          </VCol>

          <VCol cols="12">
            <SectionLabel
              title="CV only"
              icon="award"
              subtitle="Awards and interests appear on the CV, not the resume."
            />
          </VCol>
          <VCol cols="12">
            <ListEditor
              v-model="resumeForm.awards"
              :new-item="newAward"
              add-label="Add award"
              empty-text="No awards yet."
            >
              <template #default="{ item }">
                <VRow dense>
                  <VCol
                    cols="12"
                    sm="8"
                  >
                    <VTextField
                      v-model="item.name"
                      label="Award"
                      density="compact"
                    />
                  </VCol>
                  <VCol
                    cols="12"
                    sm="4"
                  >
                    <VTextField
                      v-model="item.year"
                      label="Year"
                      density="compact"
                    />
                  </VCol>
                  <VCol cols="12">
                    <VTextField
                      v-model="item.details"
                      label="Details"
                      density="compact"
                    />
                  </VCol>
                </VRow>
              </template>
            </ListEditor>
          </VCol>
          <VCol cols="12">
            <VCombobox
              v-model="resumeForm.interests"
              label="Interests"
              placeholder="Type and press Enter to add"
              chips
              multiple
              closable-chips
              clearable
            />
          </VCol>

          <VCol
            cols="12"
            class="d-flex justify-end"
          >
            <VBtn
              :loading="isSaving"
              :disabled="isLoading"
              prepend-icon="save"
              @click="saveResume"
            >
              Save changes
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>
  </section>
</template>
