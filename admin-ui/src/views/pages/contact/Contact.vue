<script setup lang="ts">
import { toDottedPaths } from '@/services/portfolio/SiteService'
import type { ContactInfo } from '@/types/portfolio'
import { rules } from '@/composable/validation/useRules'

const contactForm = reactive<ContactInfo>({
  intro: '',
  email: '',
  phone: '',
  availability: '',
  website: '',
  linkedinUrl: '',
  linkedinHandle: '',
  githubUrl: '',
  githubHandle: '',
})

const { isLoading, isSaving, save } = useSiteDocument(site => {
  (Object.keys(contactForm) as (keyof ContactInfo)[]).forEach(key => {
    contactForm[key] = site.contact?.[key] ?? ''
  })
})

const optionalUrl = rules.custom(
  (value: string) => !value || /^https?:\/\/\S+$/i.test(value),
  'Enter a full URL starting with http:// or https://',
)

const formValidationRules = {
  email: { email: rules.email },
  website: { optionalUrl },
  linkedinUrl: { optionalUrl },
  githubUrl: { optionalUrl },
}

const { validationErrors, touchField, touch, hasError } = useFormValidation(formValidationRules, contactForm)

const saveContact = () => {
  touch()
  if (hasError.value) return

  save(toDottedPaths('contact', { ...contactForm }), 'Contact info saved')
}
</script>

<template>
  <section>
    <VCard
      flat
      class="admin-card"
    >
      <PageHeader
        title="Contact info"
        icon="contact"
      >
        <template #subtitle>
          Links and labels in the contact section. Email, phone and profiles also appear on the resume.
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
            <VTextarea
              v-model="contactForm.intro"
              label="Intro"
              rows="3"
              auto-grow
            />
          </VCol>

          <VCol cols="12">
            <SectionLabel
              title="Details"
              icon="mail"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <VTextField
              v-model="contactForm.email"
              label="Email"
              type="email"
              prepend-inner-icon="mail"
              :error-messages="validationErrors('email')"
              @input="touchField('email')"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <VTextField
              v-model="contactForm.phone"
              label="Phone"
              prepend-inner-icon="smartphone"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <VTextField
              v-model="contactForm.availability"
              label="Availability text"
              prepend-inner-icon="clock"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <VTextField
              v-model="contactForm.website"
              label="Website / portfolio URL"
              placeholder="https://"
              prepend-inner-icon="globe"
              :error-messages="validationErrors('website')"
              @input="touchField('website')"
            />
          </VCol>

          <VCol cols="12">
            <SectionLabel
              title="Profiles"
              icon="users"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <VTextField
              v-model="contactForm.linkedinUrl"
              label="LinkedIn URL"
              placeholder="https://linkedin.com/in/..."
              prepend-inner-icon="linkedin"
              :error-messages="validationErrors('linkedinUrl')"
              @input="touchField('linkedinUrl')"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <VTextField
              v-model="contactForm.linkedinHandle"
              label="LinkedIn handle"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <VTextField
              v-model="contactForm.githubUrl"
              label="GitHub URL"
              placeholder="https://github.com/..."
              prepend-inner-icon="github"
              :error-messages="validationErrors('githubUrl')"
              @input="touchField('githubUrl')"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <VTextField
              v-model="contactForm.githubHandle"
              label="GitHub handle"
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
              @click="saveContact"
            >
              Save changes
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>
  </section>
</template>
