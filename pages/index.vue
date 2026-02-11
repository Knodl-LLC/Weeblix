<template>
  <div class="page-container">
    <el-card v-if="!nodeStore.isConnected" class="connection-card">
      <template #header>
        <div class="card-header">
          <h2>Подключение к ноде</h2>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @submit.prevent="handleConnect"
      >
        <el-form-item label="URL ноды" prop="url">
          <el-input
            v-model="form.url"
            placeholder="http://localhost:4000"
            clearable
          >
            <template #prepend>
              <el-icon><Link /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            :loading="connecting"
            @click="handleConnect"
            style="width: 100%"
          >
            Подключиться
          </el-button>
        </el-form-item>
      </el-form>

      <el-divider v-if="nodeStore.savedNodes.length > 0">
        Сохранённые ноды
      </el-divider>

      <div v-if="nodeStore.savedNodes.length > 0" class="saved-nodes">
        <el-card
          v-for="node in nodeStore.savedNodes"
          :key="node.url"
          class="node-card"
          shadow="hover"
        >
          <div class="node-info">
            <div class="node-details">
              <div class="node-name">{{ node.name }}</div>
              <div class="node-url">{{ node.url }}</div>
              <div v-if="node.lastConnected" class="node-last-connected">
                Последнее подключение: {{ formatDate(node.lastConnected) }}
              </div>
            </div>
            <div class="node-actions">
              <el-button
                type="primary"
                size="small"
                :loading="connecting && form.url === node.url"
                @click="handleConnectToSaved(node.url)"
              >
                Подключиться
              </el-button>
              <el-button
                type="danger"
                size="small"
                plain
                @click="handleRemoveNode(node.url)"
              >
                Удалить
              </el-button>
            </div>
          </div>
        </el-card>
      </div>
    </el-card>

    <div v-else class="dashboard">
      <el-row :gutter="24">
        <el-col :span="6">
          <el-card class="stat-card">
            <el-statistic title="Модули" :value="modulesStore.modulesCount">
              <template #prefix>
                <el-icon><Box /></el-icon>
              </template>
            </el-statistic>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <el-statistic title="Сервисы" :value="servicesStore.servicesCount">
              <template #prefix>
                <el-icon><Setting /></el-icon>
              </template>
            </el-statistic>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <el-statistic
              title="Запущенные сервисы"
              :value="servicesStore.runningServicesCount"
            >
              <template #prefix>
                <el-icon style="color: var(--el-color-success)"><VideoPlay /></el-icon>
              </template>
            </el-statistic>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <el-statistic title="Конфигурации" :value="configsStore.configsCount">
              <template #prefix>
                <el-icon><Document /></el-icon>
              </template>
            </el-statistic>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="24" class="mt-4">
        <el-col :span="12">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>Быстрые действия</span>
              </div>
            </template>
            <div class="quick-actions">
              <el-button type="primary" @click="router.push('/modules')">
                <el-icon><Box /></el-icon>
                Управление модулями
              </el-button>
              <el-button type="success" @click="router.push('/services')">
                <el-icon><Setting /></el-icon>
                Управление сервисами
              </el-button>
              <el-button type="info" @click="router.push('/configs')">
                <el-icon><Document /></el-icon>
                Управление конфигурациями
              </el-button>
              <el-button type="warning" @click="router.push('/registers')">
                <el-icon><FolderOpened /></el-icon>
                Управление реестрами
              </el-button>
            </div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>Информация о ноде</span>
              </div>
            </template>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="URL">
                {{ nodeStore.currentNodeUrl }}
              </el-descriptions-item>
              <el-descriptions-item label="Статус">
                <el-tag type="success">Подключено</el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import {
  Link,
  Box,
  Setting,
  Document,
  FolderOpened,
  VideoPlay,
} from '@element-plus/icons-vue'
import dayjs from 'dayjs'

const nodeStore = useNodeStore()
const modulesStore = useModulesStore()
const servicesStore = useServicesStore()
const configsStore = useConfigsStore()
const router = useRouter()
const { showSuccess, showError } = useNotification()
const { confirmDelete } = useConfirm()

const formRef = ref<FormInstance>()
const connecting = ref(false)

const form = reactive({
  url: 'http://localhost:4000',
})

const rules: FormRules = {
  url: [
    { required: true, message: 'Пожалуйста, введите URL ноды', trigger: 'blur' },
    {
      pattern: /^https?:\/\/.+/,
      message: 'URL должен начинаться с http:// или https://',
      trigger: 'blur',
    },
  ],
}

const handleConnect = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      connecting.value = true
      try {
        await nodeStore.connectToNode(form.url)
        showSuccess('Успешно подключено к ноде')
        await loadDashboardData()
      } catch (error: any) {
        showError(error.message || 'Не удалось подключиться к ноде')
      } finally {
        connecting.value = false
      }
    }
  })
}

const handleConnectToSaved = async (url: string) => {
  form.url = url
  await handleConnect()
}

const handleRemoveNode = async (url: string) => {
  const confirmed = await confirmDelete(url)
  if (confirmed) {
    nodeStore.removeNode(url)
    showSuccess('Нода удалена из сохранённых')
  }
}

const loadDashboardData = async () => {
  try {
    await Promise.all([
      modulesStore.fetchModules(),
      servicesStore.fetchServices(),
      servicesStore.fetchRunningServices(),
      configsStore.fetchConfigs(),
    ])
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
  }
}

const formatDate = (date: Date) => {
  return dayjs(date).format('DD.MM.YYYY HH:mm')
}

// Load dashboard data if already connected
onMounted(async () => {
  if (nodeStore.isConnected) {
    await loadDashboardData()
  }
})
</script>

<style scoped lang="scss">
.page-container {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.connection-card {
  max-width: 600px;
  margin: 100px auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
  }
}

.saved-nodes {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.node-card {
  cursor: pointer;
  transition: all 0.3s;
}

.node-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.node-details {
  flex: 1;
}

.node-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.node-url {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
}

.node-last-connected {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.node-actions {
  display: flex;
  gap: 8px;
}

.dashboard {
  .stat-card {
    margin-bottom: 24px;
  }

  .quick-actions {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .el-button {
      justify-content: flex-start;
    }
  }
}

.mt-4 {
  margin-top: 24px;
}
</style>
