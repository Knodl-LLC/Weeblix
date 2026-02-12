<template>
  <div class="page-container">
    <div class="page-header">
      <h1>Управление сервисами</h1>
      <div class="header-actions">
        <el-button type="success" @click="handleStartAll">
          <el-icon><VideoPlay /></el-icon>
          Запустить все
        </el-button>
        <el-button type="danger" @click="handleStopAll">
          <el-icon><VideoPause /></el-icon>
          Остановить все
        </el-button>
        <el-button type="primary" @click="handleRefresh" :loading="servicesStore.loading">
          <el-icon><Refresh /></el-icon>
          Обновить
        </el-button>
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          Создать сервис
        </el-button>
      </div>
    </div>

    <el-card>
      <el-table
        :data="servicesStore.services"
        v-loading="servicesStore.loading"
        style="width: 100%"
        stripe
      >
        <el-table-column prop="id" label="ID сервиса" width="200" />
        <el-table-column prop="module" label="Модуль" width="200" />
        <el-table-column label="Статус" width="120">
          <template #default="{ row }">
            <el-tag v-if="isRunning(row.id)" type="success">
              <el-icon><VideoPlay /></el-icon>
              Запущен
            </el-tag>
            <el-tag v-else type="info">
              <el-icon><VideoPause /></el-icon>
              Остановлен
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Входные каналы" width="200">
          <template #default="{ row }">
            <el-tag
              v-for="channel in row.channels?.in || []"
              :key="channel"
              size="small"
              class="mr-1"
            >
              {{ channel }}
            </el-tag>
            <span v-if="!row.channels?.in?.length" class="text-secondary">—</span>
          </template>
        </el-table-column>
        <el-table-column label="Выходные каналы" width="200">
          <template #default="{ row }">
            <el-tag
              v-for="channel in row.channels?.out || []"
              :key="channel"
              size="small"
              type="success"
              class="mr-1"
            >
              {{ channel }}
            </el-tag>
            <span v-if="!row.channels?.out?.length" class="text-secondary">—</span>
          </template>
        </el-table-column>
        <el-table-column label="Действия" width="350" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="!isRunning(row.id)"
              size="small"
              type="success"
              @click="handleStart(row)"
            >
              <el-icon><VideoPlay /></el-icon>
              Запустить
            </el-button>
            <el-button
              v-else
              size="small"
              type="warning"
              @click="handleStop(row)"
            >
              <el-icon><VideoPause /></el-icon>
              Остановить
            </el-button>
            <el-button size="small" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              Изменить
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="handleDelete(row)"
            >
              <el-icon><Delete /></el-icon>
              Удалить
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Service Form Dialog -->
    <el-dialog
      v-model="formDialogVisible"
      :title="isEditing ? 'Редактирование сервиса' : 'Создание сервиса'"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="serviceForm"
        :rules="formRules"
        label-position="top"
      >
        <el-form-item label="ID сервиса" prop="id">
          <el-input
            v-model="serviceForm.id"
            :disabled="isEditing"
            placeholder="Введите уникальный ID сервиса"
          />
        </el-form-item>

        <el-form-item label="Модуль" prop="module">
          <el-select
            v-model="serviceForm.module"
            placeholder="Выберите модуль"
            style="width: 100%"
          >
            <el-option
              v-for="module in modulesStore.modules"
              :key="module.id"
              :label="module.id"
              :value="module.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="ID конфигурации">
          <el-select
            v-model="serviceForm.config"
            placeholder="Выберите конфигурацию (опционально)"
            clearable
            style="width: 100%"
          >
            <el-option
              v-for="config in configsStore.configs"
              :key="config.id"
              :label="config.id"
              :value="config.id"
            />
          </el-select>
        </el-form-item>

        <el-divider>Каналы</el-divider>

        <el-form-item label="Входные каналы">
          <el-select
            v-model="serviceForm.channels.in"
            multiple
            filterable
            allow-create
            placeholder="Добавьте входные каналы"
            style="width: 100%"
          >
            <el-option v-for="ch in servicesStore.allChannels" :key="ch" :label="ch" :value="ch" />
          </el-select>
        </el-form-item>

        <el-form-item label="Выходные каналы">
          <el-select
            v-model="serviceForm.channels.out"
            multiple
            filterable
            allow-create
            placeholder="Добавьте выходные каналы"
            style="width: 100%"
          >
            <el-option v-for="ch in servicesStore.allChannels" :key="ch" :label="ch" :value="ch" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="formDialogVisible = false">Отмена</el-button>
        <el-button type="primary" @click="handleSave">
          Сохранить
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import {
  Refresh,
  Plus,
  VideoPlay,
  VideoPause,
  Edit,
  Delete,
} from '@element-plus/icons-vue'
import type { ActServ } from '~/utils/api-client'

definePageMeta({
  layout: 'default',
})

const servicesStore = useServicesStore()
const modulesStore = useModulesStore()
const configsStore = useConfigsStore()
const { showSuccess, showError } = useNotification()
const { confirmDelete, confirmAction } = useConfirm()

const formDialogVisible = ref(false)
const formRef = ref<FormInstance>()
const isEditing = ref(false)

const serviceForm = reactive<ActServ>({
  id: '',
  module: '',
  config: '',
  channels: {
    in: [],
    out: [],
  },
  config_data: {},
})

const formRules: FormRules = {
  id: [{ required: true, message: 'Пожалуйста, введите ID сервиса', trigger: 'blur' }],
  module: [{ required: true, message: 'Пожалуйста, выберите модуль', trigger: 'change' }],
}

const isRunning = (serviceId: string) => {
  return servicesStore.isServiceRunning(serviceId)
}

const handleRefresh = async () => {
  try {
    await Promise.all([
      servicesStore.fetchServices(),
      servicesStore.fetchRunningServices(),
    ])
    showSuccess('Список сервисов обновлён')
  } catch (error: any) {
    showError(error.message || 'Не удалось обновить список сервисов')
  }
}

const handleCreate = () => {
  isEditing.value = false
  Object.assign(serviceForm, {
    id: '',
    module: '',
    config: '',
    channels: { in: [], out: [] },
    config_data: {},
  })
  formDialogVisible.value = true
}

const handleEdit = (service: ActServ) => {
  isEditing.value = true
  Object.assign(serviceForm, {
    ...service,
    channels: {
      in: service.channels?.in || [],
      out: service.channels?.out || [],
    },
  })
  formDialogVisible.value = true
}

const handleSave = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await servicesStore.saveService(serviceForm.id!, serviceForm)
        showSuccess(`Сервис "${serviceForm.id}" сохранён`)
        formDialogVisible.value = false
      } catch (error: any) {
        showError(error.message || 'Не удалось сохранить сервис')
      }
    }
  })
}

const handleDelete = async (service: ActServ) => {
  const confirmed = await confirmDelete(service.id)
  if (confirmed) {
    try {
      await servicesStore.deleteService(service.id!)
      showSuccess(`Сервис "${service.id}" удалён`)
    } catch (error: any) {
      showError(error.message || 'Не удалось удалить сервис')
    }
  }
}

const handleStart = async (service: ActServ) => {
  try {
    await servicesStore.startService(service.id!)
    showSuccess(`Сервис "${service.id}" запущен`)
  } catch (error: any) {
    showError(error.message || 'Не удалось запустить сервис')
  }
}

const handleStop = async (service: ActServ) => {
  const confirmed = await confirmAction('остановить', service.id)
  if (confirmed) {
    try {
      await servicesStore.stopService(service.id!)
      showSuccess(`Сервис "${service.id}" остановлен`)
    } catch (error: any) {
      showError(error.message || 'Не удалось остановить сервис')
    }
  }
}

const handleStartAll = async () => {
  const confirmed = await confirmAction('запустить все сервисы')
  if (confirmed) {
    try {
      await servicesStore.startAllServices()
      showSuccess('Все сервисы запущены')
    } catch (error: any) {
      showError(error.message || 'Не удалось запустить все сервисы')
    }
  }
}

const handleStopAll = async () => {
  const confirmed = await confirmAction('остановить все сервисы')
  if (confirmed) {
    try {
      await servicesStore.stopAllServices()
      showSuccess('Все сервисы остановлены')
    } catch (error: any) {
      showError(error.message || 'Не удалось остановить все сервисы')
    }
  }
}

onMounted(async () => {
  if (servicesStore.services.length === 0) {
    await handleRefresh()
  }
  if (modulesStore.modules.length === 0) {
    await modulesStore.fetchModules()
  }
  if (configsStore.configs.length === 0) {
    await configsStore.fetchConfigs()
  }
})
</script>

<style scoped lang="scss">
.page-container {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  h1 {
    margin: 0;
    font-size: 28px;
    font-weight: 600;
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }
}

.mr-1 {
  margin-right: 4px;
}

.text-secondary {
  color: var(--el-text-color-secondary);
}
</style>
