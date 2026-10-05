<script setup lang="ts">
import MessageService from '@/services/portfolio/MessageService'
import type { Message } from '@/types/portfolio'
import { avatarText, formatDate } from '@/utils/formatters'

const messageService = new MessageService()
const $confirm = useConfirm()
const route = useRoute()

const isLoading = ref(false)
const messages = ref<Message[]>([])

const search = ref('')
const readFilter = ref<'all' | 'unread' | 'read'>('all')
const currentPage = ref(1)
const itemsPerPage = 10

const selectedMessage = ref<Message | null>(null)
const isDialogVisible = ref(false)
const isMarking = ref(false)

const filterOptions = [
  { title: 'All messages', value: 'all' },
  { title: 'Unread', value: 'unread' },
  { title: 'Read', value: 'read' },
]

const tableHeaders = [
  { title: 'From', label: 'name' },
  { title: 'Message', label: 'message' },
  { title: 'Received', label: 'createdAt' },
  { title: 'Actions', label: 'actions', textAlign: 'center' as const },
]

const unreadCount = computed(() => messages.value.filter(message => !message.read).length)

const filteredMessages = computed(() => {
  const term = search.value.trim().toLowerCase()

  return messages.value.filter(message => {
    if (readFilter.value === 'unread' && message.read) return false
    if (readFilter.value === 'read' && !message.read) return false
    if (!term) return true

    return [message.name, message.email, message.message].some(text => text?.toLowerCase().includes(term))
  })
})

const pageCount = computed(() => Math.max(1, Math.ceil(filteredMessages.value.length / itemsPerPage)))

const pagedMessages = computed(() =>
  filteredMessages.value.slice((currentPage.value - 1) * itemsPerPage, currentPage.value * itemsPerPage),
)

watch([search, readFilter], () => {
  currentPage.value = 1
})

// Stay on a page that still exists after deleting its last message
watch(pageCount, count => {
  if (currentPage.value > count) currentPage.value = count
})

const formatReceived = (value: string) =>
  formatDate(value, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })

const getMessages = async () => {
  isLoading.value = true
  try {
    messages.value = await messageService.list()
  }
  catch (error) {
    showError(error)
    messages.value = []
  }
  finally {
    isLoading.value = false
  }
}

const openMessage = (message: Message) => {
  selectedMessage.value = message
  isDialogVisible.value = true
}

const markRead = async (message: Message) => {
  isMarking.value = true
  try {
    const updated = await messageService.markRead(message._id)

    messages.value = messages.value.map(item => (item._id === updated._id ? updated : item))
    if (selectedMessage.value?._id === updated._id)
      selectedMessage.value = updated
    showSuccess('Marked as read')
  }
  catch (error) {
    showError(error)
  }
  finally {
    isMarking.value = false
  }
}

const deleteMessage = (message: Message) => {
  $confirm?.({
    message: `Delete the message from ${message.name}? This cannot be undone.`,
    button: { no: 'No', yes: 'Yes' },
    callback: async (ok: boolean) => {
      if (!ok) return
      try {
        await messageService.destroy(message._id)
        messages.value = messages.value.filter(item => item._id !== message._id)
        if (selectedMessage.value?._id === message._id)
          isDialogVisible.value = false
        showSuccess('Message deleted')
      }
      catch (error) {
        showError(error)
      }
    },
  })
}

const replyHref = (message: Message) => `mailto:${message.email}`

onMounted(async () => {
  await getMessages()

  // The dashboard links straight to a message with ?id=
  const id = route.query.id
  const linked = typeof id === 'string' ? messages.value.find(message => message._id === id) : undefined

  if (linked) openMessage(linked)
})
</script>

<template>
  <section>
    <VCard
      flat
      class="admin-card"
    >
      <PageHeader
        title="Messages"
        icon="mail"
      >
        <template #badge>
          <VChip
            v-if="unreadCount"
            size="small"
            color="error"
            variant="tonal"
          >
            {{ unreadCount }} unread
          </VChip>
        </template>
        <template #subtitle>
          Messages sent from the contact form on your site.
        </template>
        <template #actions>
          <VBtn
            variant="tonal"
            prepend-icon="refresh-cw"
            :loading="isLoading"
            @click="getMessages"
          >
            Refresh
          </VBtn>
        </template>
      </PageHeader>

      <VDivider />

      <VCardText>
        <VRow>
          <VCol
            cols="12"
            md="8"
          >
            <VTextField
              v-model="search"
              placeholder="Search name, email or message"
              prepend-inner-icon="search"
              clearable
              clear-icon="x"
              density="compact"
            />
          </VCol>
          <VCol
            cols="12"
            md="4"
          >
            <VSelect
              v-model="readFilter"
              :items="filterOptions"
              density="compact"
            />
          </VCol>
        </VRow>
      </VCardText>

      <VDivider />

      <CustomTable
        :header="tableHeaders"
        :data="pagedMessages"
        :loading="isLoading"
        :total="filteredMessages.length"
        :current-page="currentPage"
        :page-count="pageCount"
        :items-per-page="itemsPerPage"
        :empty-table-text="messages.length ? 'No messages match your search' : 'No messages yet'"
        @page-change="(page: number) => currentPage = page"
      >
        <template #name="{ row: item }">
          <div
            class="d-flex align-center gap-3 cursor-pointer py-2"
            @click="openMessage(item)"
          >
            <VBadge
              dot
              color="error"
              :model-value="!item.read"
              location="top start"
              offset-x="2"
              offset-y="2"
            >
              <VAvatar
                color="primary"
                variant="tonal"
                size="38"
              >
                {{ avatarText(item.name) }}
              </VAvatar>
            </VBadge>
            <div class="min-w-0">
              <div
                class="title-hover"
                :class="item.read ? 'font-weight-medium' : 'font-weight-bold'"
              >
                {{ item.name }}
              </div>
              <div class="text-caption text-disabled">
                {{ item.email }}
              </div>
            </div>
          </div>
        </template>

        <template #message="{ row: item }">
          <div
            class="text-truncate-2 cursor-pointer"
            @click="openMessage(item)"
          >
            {{ item.message }}
          </div>
        </template>

        <template #createdAt="{ row: item }">
          <span class="text-no-wrap text-body-2">{{ formatReceived(item.createdAt) }}</span>
        </template>

        <template #actions="{ row: item }">
          <div class="d-flex justify-center gap-1">
            <IconBtn
              size="small"
              @click="openMessage(item)"
            >
              <VIcon icon="eye" />
              <VTooltip activator="parent">
                Open
              </VTooltip>
            </IconBtn>
            <IconBtn
              size="small"
              color="error"
              @click="deleteMessage(item)"
            >
              <VIcon icon="trash-2" />
              <VTooltip activator="parent">
                Delete
              </VTooltip>
            </IconBtn>
          </div>
        </template>
      </CustomTable>
    </VCard>

    <VDialog
      v-model="isDialogVisible"
      max-width="640"
    >
      <VCard
        v-if="selectedMessage"
        class="admin-card"
      >
        <DrawerHeaderSection
          icon="mail"
          :title="selectedMessage.name"
          :subtitle="selectedMessage.email"
          @cancel="isDialogVisible = false"
        />

        <VDivider />

        <VCardText>
          <div class="d-flex flex-wrap align-center gap-2 mb-4 text-body-2 text-medium-emphasis">
            <VIcon
              icon="clock"
              size="16"
            />
            {{ formatReceived(selectedMessage.createdAt) }}
            <VChip
              size="x-small"
              :color="selectedMessage.read ? 'secondary' : 'error'"
              variant="tonal"
            >
              {{ selectedMessage.read ? 'Read' : 'Unread' }}
            </VChip>
          </div>
          <p class="message-body text-body-1 text-high-emphasis mb-0">
            {{ selectedMessage.message }}
          </p>
        </VCardText>

        <VDivider />

        <VCardActions class="pa-4 flex-wrap gap-2">
          <VBtn
            color="error"
            variant="text"
            prepend-icon="trash-2"
            @click="deleteMessage(selectedMessage)"
          >
            Delete
          </VBtn>
          <VSpacer />
          <VBtn
            v-if="!selectedMessage.read"
            variant="tonal"
            prepend-icon="mail-open"
            :loading="isMarking"
            @click="markRead(selectedMessage)"
          >
            Mark read
          </VBtn>
          <VBtn
            variant="flat"
            prepend-icon="reply"
            :href="replyHref(selectedMessage)"
          >
            Reply
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </section>
</template>

<style scoped>
.message-body {
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
}

.min-w-0 {
  min-inline-size: 0;
}
</style>
