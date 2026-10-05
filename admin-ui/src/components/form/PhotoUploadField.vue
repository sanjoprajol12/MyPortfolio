<!--
  Profile photo upload. POST /admin/upload stores the image on the site document
  (hero.photoUrl, as a data URL) and returns it, so there is nothing else to save.
-->
<script setup lang="ts">
import SiteService from '@/services/portfolio/SiteService'

const props = defineProps<{
  photoUrl?: string
}>()

const emit = defineEmits<{ (e: 'uploaded', photoUrl: string): void }>()

const siteService = new SiteService()

const isUploading = ref(false)
const hasPreviewError = ref(false)
const fileInputKey = ref(0)

// Relative paths such as "images/profile.jpg" are served from the site root
const previewUrl = computed(() => {
  const url = props.photoUrl || ''
  if (!url || /^(https?:|data:|blob:|\/)/i.test(url)) return url

  return `/${url}`
})

watch(() => props.photoUrl, () => {
  hasPreviewError.value = false
})

const handleFileSelection = async (file: File | File[] | null) => {
  const selectedFile = Array.isArray(file) ? (file[0] ?? null) : file
  if (!selectedFile) return

  isUploading.value = true
  try {
    const { photoUrl } = await siteService.uploadPhoto(selectedFile)

    emit('uploaded', photoUrl)
    showSuccess('Photo uploaded')
  }
  catch (error) {
    showError(error)
  }
  finally {
    isUploading.value = false

    // Reset the picker so the same file can be chosen again
    fileInputKey.value++
  }
}
</script>

<template>
  <div class="d-flex flex-column flex-sm-row align-sm-center gap-4">
    <VAvatar
      size="104"
      rounded="lg"
      variant="tonal"
      color="secondary"
      class="photo-preview flex-shrink-0"
    >
      <VImg
        v-if="previewUrl && !hasPreviewError"
        :src="previewUrl"
        cover
        @error="hasPreviewError = true"
      />
      <VIcon
        v-else
        icon="image"
        size="32"
      />
    </VAvatar>

    <div class="flex-grow-1">
      <VFileInput
        :key="fileInputKey"
        accept="image/*"
        :loading="isUploading"
        :disabled="isUploading"
        label="Upload new photo"
        prepend-inner-icon="upload"
        @update:model-value="handleFileSelection"
      />
      <div class="text-caption text-disabled mt-2">
        JPG, PNG or WEBP up to 5MB. It replaces the current photo as soon as it uploads.
      </div>
    </div>
  </div>
</template>

<style scoped>
.photo-preview {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
