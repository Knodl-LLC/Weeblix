<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const nodeStore = useNodeStore()

// Load saved nodes on app mount
onMounted(() => {
  nodeStore.loadNodes()
})
</script>
