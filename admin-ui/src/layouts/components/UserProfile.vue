<script setup lang="ts">
import { avatarText } from '@/utils/formatters'
import { useAuthStore } from '@/store/auth'

const authStore = useAuthStore()

const router = useRouter()

const displayName = computed(() => authStore.user?.username || 'Admin')
const roleName = computed(() => authStore.isSuperAdmin ? 'Super admin' : 'Admin')
</script>

<template>
  <VBadge
    dot
    bordered
    location="bottom right"
    offset-x="3"
    offset-y="3"
    color="success"
  >
    <VAvatar
      class="cursor-pointer"
      size="38"
      color="primary"
      variant="tonal"
    >
      <span class="text-body-1 font-weight-medium">{{ avatarText(displayName) }}</span>

      <VMenu
        activator="parent"
        width="230"
        location="bottom end"
        offset="15px"
      >
        <VList>
          <!-- Mini header -->
          <VListItem>
            <div class="d-flex gap-2 align-center">
              <VListItemAction>
                <VBadge
                  dot
                  location="bottom right"
                  offset-x="3"
                  offset-y="3"
                  color="success"
                >
                  <VAvatar
                    color="primary"
                    variant="tonal"
                  >
                    <span>{{ avatarText(displayName) }}</span>
                  </VAvatar>
                </VBadge>
              </VListItemAction>
              <div>
                <h6 class="text-h6 font-weight-medium">
                  {{ displayName }}
                </h6>
                <VListItemSubtitle class="text-disabled">
                  {{ roleName }}
                </VListItemSubtitle>
              </div>
            </div>
          </VListItem>

          <VDivider class="my-1" />

          <VListItem @click="router.push({ name: 'account' })">
            <template #prepend>
              <VIcon
                size="22"
                icon="user-cog"
              />
            </template>
            <VListItemTitle>My account</VListItemTitle>
          </VListItem>

          <VListItem @click="router.push({ name: 'security' })">
            <template #prepend>
              <VIcon
                size="22"
                icon="shield-check"
              />
            </template>
            <VListItemTitle>Security</VListItemTitle>
          </VListItem>

          <VDivider class="my-1" />

          <!-- Logout -->
          <VListItem>
            <VBtn
              block
              color="error"
              size="small"
              variant="tonal"
              append-icon="log-out"
              @click="authStore.logout"
            >
              Sign out
            </VBtn>
          </VListItem>
        </VList>
      </VMenu>
    </VAvatar>
  </VBadge>
</template>
