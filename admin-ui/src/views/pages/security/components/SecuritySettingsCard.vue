<script setup lang="ts">
const props = defineProps<{
  isMfaEnabled: boolean
  recoveryCodesRemaining: number
  isLoading: boolean
  isSyncing: boolean
}>()

defineEmits<{
  (e: 'openMfaSetup'): void
  (e: 'deactivateMfa'): void
  (e: 'regenerateRecoveryCodes'): void
}>()
</script>

<template>
  <VCard
    flat
    class="admin-card"
  >
    <PageHeader
      title="Two-step verification"
      subtitle="Ask for a code from your phone every time you sign in"
      icon="shield-check"
      size="small"
    />

    <VDivider />

    <VProgressLinear
      v-if="props.isSyncing"
      indeterminate
      height="2"
    />

    <VCardText class="pa-5">
      <div class="d-flex align-start gap-4 flex-wrap flex-sm-nowrap">
        <VAvatar
          :color="props.isMfaEnabled ? 'success' : 'secondary'"
          variant="tonal"
          rounded="lg"
          size="44"
          class="flex-shrink-0"
        >
          <VIcon
            :icon="props.isMfaEnabled ? 'shield-check' : 'shield-off'"
            size="24"
          />
        </VAvatar>

        <div class="flex-grow-1">
          <div class="d-flex align-center gap-2 mb-1">
            <span class="text-body-1 font-weight-medium">Authenticator app</span>
            <VChip
              size="x-small"
              :color="props.isMfaEnabled ? 'success' : 'secondary'"
            >
              {{ props.isMfaEnabled ? 'On' : 'Off' }}
            </VChip>
          </div>
          <p class="text-body-2 text-medium-emphasis mb-0">
            <template v-if="props.isMfaEnabled">
              Signing in needs your password and a code from your authenticator app.
              {{ props.recoveryCodesRemaining }} recovery {{ props.recoveryCodesRemaining === 1 ? 'code' : 'codes' }} left.
            </template>
            <template v-else>
              Protects your account even if someone learns your password.
            </template>
          </p>
        </div>

        <div class="d-flex flex-column gap-2 flex-shrink-0">
          <VBtn
            v-if="!props.isMfaEnabled"
            :loading="props.isLoading"
            :disabled="props.isSyncing"
            prepend-icon="shield-check"
            @click="$emit('openMfaSetup')"
          >
            Turn on
          </VBtn>
          <template v-else>
            <VBtn
              variant="tonal"
              :disabled="props.isLoading || props.isSyncing"
              prepend-icon="refresh-cw"
              @click="$emit('regenerateRecoveryCodes')"
            >
              New recovery codes
            </VBtn>
            <VBtn
              color="error"
              variant="tonal"
              :loading="props.isLoading"
              :disabled="props.isSyncing"
              prepend-icon="shield-off"
              @click="$emit('deactivateMfa')"
            >
              Turn off
            </VBtn>
          </template>
        </div>
      </div>
    </VCardText>
  </VCard>
</template>
