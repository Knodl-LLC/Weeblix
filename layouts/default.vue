<template>
  <el-container class="app-container">
    <el-header class="app-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="app-title">Неваляшка</h1>
        </div>
        <div class="header-center">
          <el-tag v-if="nodeStore.isConnected" type="success" effect="dark">
            <el-icon><Connection /></el-icon>
            <span class="ml-2">{{ nodeStore.currentNodeUrl }}</span>
          </el-tag>
          <el-tag v-else type="info" effect="dark">
            <el-icon><Close /></el-icon>
            <span class="ml-2">Не подключено</span>
          </el-tag>
        </div>
        <div class="header-right">
          <el-button
            v-if="nodeStore.isConnected"
            type="danger"
            plain
            @click="handleDisconnect"
          >
            Отключиться
          </el-button>
        </div>
      </div>
    </el-header>

    <el-container class="main-container">
      <el-aside v-if="nodeStore.isConnected" width="240px" class="app-sidebar">
        <el-menu
          :default-active="currentRoute"
          router
          class="sidebar-menu"
        >
          <el-menu-item index="/">
            <el-icon><HomeFilled /></el-icon>
            <span>Главная</span>
          </el-menu-item>
          <el-menu-item index="/modules">
            <el-icon><Box /></el-icon>
            <span>Модули</span>
          </el-menu-item>
          <el-menu-item index="/services">
            <el-icon><Setting /></el-icon>
            <span>Сервисы</span>
          </el-menu-item>
          <el-menu-item index="/configs">
            <el-icon><Document /></el-icon>
            <span>Конфигурации</span>
          </el-menu-item>
          <el-menu-item index="/registers">
            <el-icon><FolderOpened /></el-icon>
            <span>Реестры</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-main class="app-main">
        <slot />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import {
  Connection,
  Close,
  HomeFilled,
  Box,
  Setting,
  Document,
  FolderOpened,
} from '@element-plus/icons-vue'

const nodeStore = useNodeStore()
const route = useRoute()
const router = useRouter()
const { showSuccess } = useNotification()

const currentRoute = computed(() => route.path)

const handleDisconnect = () => {
  nodeStore.disconnectFromNode()
  showSuccess('Отключено от ноды')
  router.push('/')
}
</script>

<style scoped lang="scss">
.app-container {
  height: 100vh;
  width: 100%;
}

.app-header {
  background-color: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color);
  display: flex;
  align-items: center;
  padding: 0 24px;
}

.header-content {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  flex: 0 0 auto;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.header-right {
  flex: 0 0 auto;
}

.app-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
}

.main-container {
  height: calc(100vh - 60px);
}

.app-sidebar {
  background-color: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color);
  overflow-y: auto;
}

.sidebar-menu {
  border-right: none;
}

.app-main {
  background-color: var(--el-fill-color-light);
  overflow-y: auto;
}

.ml-2 {
  margin-left: 8px;
}
</style>
