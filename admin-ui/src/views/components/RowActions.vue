<!-- The edit / delete menu at the end of a list row. -->
<script setup lang="ts">
defineEmits<{
  (e: 'edit'): void
  (e: 'delete'): void
}>()
</script>

<template>
  <IconBtn
    size="small"
    color="medium-emphasis"
    aria-label="Actions"
  >
    <VIcon
      size="24"
      icon="ellipsis"
    />
    <VMenu activator="parent">
      <VList>
        <VListItem
          link
          @click="$emit('edit')"
        >
          <template #prepend>
            <VIcon
              size="small"
              icon="pencil"
            />
          </template>
          <VListItemTitle>Edit</VListItemTitle>
        </VListItem>

        <VListItem
          link
          @click="$emit('delete')"
        >
          <template #prepend>
            <VIcon
              size="small"
              color="error"
              icon="trash-2"
            />
          </template>
          <VListItemTitle class="text-error">
            Delete
          </VListItemTitle>
        </VListItem>
      </VList>
    </VMenu>
  </IconBtn>
</template>
