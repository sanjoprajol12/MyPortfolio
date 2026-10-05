<script setup lang="ts">
import SiteService from '@/services/portfolio/SiteService'
import MessageService from '@/services/portfolio/MessageService'
import type { Message, Overview } from '@/types/portfolio'
import { avatarText, formatDate } from '@/utils/formatters'

const siteService = new SiteService()
const messageService = new MessageService()
const router = useRouter()
const authUser = useAuthUser().authUserData

const isLoading = ref(false)
const overview = ref<Overview | null>(null)
const recentMessages = ref<Message[]>([])

const greeting = computed(() => {
  const hour = new Date().getHours()

  if (hour < 12)
    return { text: 'Good morning', icon: 'sun' }
  if (hour < 18)
    return { text: 'Good afternoon', icon: 'cloud-sun' }

  return { text: 'Good evening', icon: 'moon' }
})

const today = formatDate(new Date().toISOString(), { weekday: 'long', month: 'long', day: 'numeric' })

const statCards = computed(() => [
  {
    title: 'Unread messages',
    value: overview.value?.unread ?? 0,
    desc: 'Waiting for a reply',
    icon: 'mail',
    iconColor: 'error',
    to: 'messages',
  },
  {
    title: 'Total messages',
    value: overview.value?.totalMessages ?? 0,
    desc: 'From the contact form',
    icon: 'inbox',
    iconColor: 'info',
    to: 'messages',
  },
  {
    title: 'Projects',
    value: overview.value?.projects ?? 0,
    desc: 'Shown in the projects section',
    icon: 'folder-git-2',
    iconColor: 'primary',
    to: 'projects',
  },
  {
    title: 'Experience',
    value: overview.value?.experience ?? 0,
    desc: 'Roles in the timeline',
    icon: 'briefcase',
    iconColor: 'success',
    to: 'experience',
  },
])

const quickLinks = [
  { title: 'Hero & site', subtitle: 'Name, headline, photo, stats', icon: 'layout', route: 'hero' },
  { title: 'About', subtitle: 'Story and sidebar rows', icon: 'user-round', route: 'about' },
  { title: 'Skills', subtitle: 'Categories and tags', icon: 'layers', route: 'skills' },
  { title: 'Experience', subtitle: 'Work history', icon: 'briefcase', route: 'experience' },
  { title: 'Projects', subtitle: 'Featured work', icon: 'folder-git-2', route: 'projects' },
  { title: 'Contact info', subtitle: 'Email, phone, profiles', icon: 'contact', route: 'contact' },
  { title: 'Resume & CV', subtitle: 'PDF content and options', icon: 'file-text', route: 'resume' },
]

const getDashboard = async () => {
  isLoading.value = true
  try {
    const [stats, messages] = await Promise.all([siteService.overview(), messageService.list()])

    overview.value = stats

    // The API returns messages newest first
    recentMessages.value = messages.slice(0, 5)
  }
  catch (error) {
    showError(error)
  }
  finally {
    isLoading.value = false
  }
}

onMounted(getDashboard)
</script>

<template>
  <section>
    <!-- Welcome banner -->
    <VCard
      flat
      class="welcome-banner mb-6"
    >
      <VCardText class="d-flex flex-wrap align-center justify-space-between gap-4 pa-6">
        <div class="d-flex align-center gap-4">
          <VAvatar
            size="56"
            rounded="lg"
            class="welcome-banner__icon"
          >
            <VIcon
              :icon="greeting.icon"
              size="30"
            />
          </VAvatar>
          <div>
            <div class="welcome-banner__date">
              <VIcon
                icon="calendar"
                size="14"
                class="me-1"
              />
              {{ today }}
            </div>
            <h1 class="welcome-banner__title">
              {{ greeting.text }}{{ authUser?.username ? `, ${authUser.username}` : '' }}
            </h1>
            <p class="welcome-banner__text">
              Changes you save here go live on your portfolio straight away.
            </p>
          </div>
        </div>

        <div class="d-flex flex-wrap gap-2">
          <VBtn
            variant="flat"
            color="surface"
            class="welcome-banner__primary-btn"
            prepend-icon="mail"
            @click="router.push({ name: 'messages' })"
          >
            Open inbox
          </VBtn>
          <VBtn
            variant="outlined"
            class="welcome-banner__outline"
            prepend-icon="refresh-cw"
            :loading="isLoading"
            @click="getDashboard"
          >
            Refresh
          </VBtn>
        </div>
      </VCardText>
    </VCard>

    <!-- Stats -->
    <VRow class="mb-2">
      <VCol
        v-for="card in statCards"
        :key="card.title"
        cols="12"
        sm="6"
        lg="3"
      >
        <VSkeletonLoader
          v-if="isLoading && !overview"
          type="article"
          class="admin-card"
        />
        <CardStatisticsWithIcon
          v-else
          v-bind="card"
        />
      </VCol>
    </VRow>

    <VRow>
      <!-- Recent messages -->
      <VCol
        cols="12"
        lg="7"
      >
        <VCard
          flat
          class="admin-card h-100"
        >
          <PageHeader
            title="Recent messages"
            subtitle="Latest messages from the contact form"
            icon="mail"
            size="small"
          >
            <template #actions>
              <VBtn
                variant="text"
                size="small"
                append-icon="arrow-right"
                @click="router.push({ name: 'messages' })"
              >
                View all
              </VBtn>
            </template>
          </PageHeader>
          <VDivider />
          <VList
            v-if="recentMessages.length"
            lines="two"
            class="py-2"
          >
            <VListItem
              v-for="message in recentMessages"
              :key="message._id"
              link
              class="px-5"
              @click="router.push({ name: 'messages', query: { id: message._id } })"
            >
              <template #prepend>
                <VBadge
                  dot
                  color="error"
                  :model-value="!message.read"
                  location="top start"
                  offset-x="2"
                  offset-y="2"
                >
                  <VAvatar
                    color="primary"
                    variant="tonal"
                  >
                    {{ avatarText(message.name) }}
                  </VAvatar>
                </VBadge>
              </template>
              <VListItemTitle :class="{ 'font-weight-bold': !message.read }">
                {{ message.name }}
              </VListItemTitle>
              <VListItemSubtitle>{{ message.message }}</VListItemSubtitle>
              <template #append>
                <span class="text-caption text-disabled text-no-wrap ms-2">{{ formatDate(message.createdAt) }}</span>
              </template>
            </VListItem>
          </VList>
          <div
            v-else-if="isLoading"
            class="pa-5"
          >
            <VSkeletonLoader type="list-item-avatar-two-line@3" />
          </div>
          <EmptyState
            v-else
            icon="mail-open"
            title="No messages yet"
            text="Messages from your site's contact form will appear here."
            compact
          />
        </VCard>
      </VCol>

      <!-- Quick links -->
      <VCol
        cols="12"
        lg="5"
      >
        <VCard
          flat
          class="admin-card h-100"
        >
          <PageHeader
            title="Edit content"
            subtitle="Jump to a section of your portfolio"
            icon="layout-grid"
            size="small"
          />
          <VDivider />
          <VCardText class="pa-4 d-flex flex-column gap-2">
            <div
              v-for="link in quickLinks"
              :key="link.route"
              class="quick-link hover-tint d-flex align-center gap-3 pa-3 rounded-lg cursor-pointer"
              role="link"
              tabindex="0"
              @click="router.push({ name: link.route })"
              @keydown.enter="router.push({ name: link.route })"
            >
              <VAvatar
                color="primary"
                variant="tonal"
                rounded="lg"
                size="36"
              >
                <VIcon
                  :icon="link.icon"
                  size="20"
                />
              </VAvatar>
              <div class="flex-grow-1">
                <div class="text-body-1 text-high-emphasis font-weight-medium">
                  {{ link.title }}
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  {{ link.subtitle }}
                </div>
              </div>
              <VIcon
                icon="chevron-right"
                class="quick-link__chevron text-disabled"
              />
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </section>
</template>

<style lang="scss" scoped>
.welcome-banner {
  overflow: hidden;
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-primary-darken-1)) 100%) !important;
  color: rgb(var(--v-theme-on-primary));

  // Global heading/text colours would otherwise win over the inherited on-primary colour
  &__icon,
  &__date,
  &__title,
  &__text {
    color: rgb(var(--v-theme-on-primary)) !important;
  }

  &__icon {
    background-color: rgba(var(--v-theme-on-primary), 0.16) !important;
  }

  &__date {
    display: flex;
    align-items: center;
    font-size: 0.8125rem;
    opacity: 0.85;
  }

  &__title {
    margin: 0.125rem 0;
    font-size: 1.5rem;
    font-weight: 600;
    line-height: 2rem;
  }

  &__text {
    margin: 0;
    font-size: 0.9375rem;
    opacity: 0.9;
  }

  &__primary-btn {
    color: rgb(var(--v-theme-primary-darken-1)) !important;
  }

  &__outline {
    border-color: rgba(var(--v-theme-on-primary), 0.5) !important;
    color: rgb(var(--v-theme-on-primary)) !important;
  }
}

.quick-link {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));

  &:hover .quick-link__chevron {
    color: rgb(var(--v-theme-primary)) !important;
    transform: translateX(2px);
  }

  &__chevron {
    transition: transform 0.2s ease;
  }
}
</style>
