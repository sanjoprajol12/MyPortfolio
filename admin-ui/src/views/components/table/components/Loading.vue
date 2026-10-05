<template>
  <div class="table-loading-overlay">
    <div class="loading-content">
      <VProgressCircular
        color="primary"
        indeterminate
        size="32"
      />
      <span class="loading-text">Loading...</span>
    </div>
  </div>
</template>

<style scoped>
.table-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.loading-text {
  color: #6c757d;
  font-size: 0.875rem;
  font-weight: 500;
}
</style>
