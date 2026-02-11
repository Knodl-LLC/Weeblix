<template>
  <div class="page-container">
    <div class="page-header">
      <h1>Управление конфигурациями</h1>
      <div class="header-actions">
        <el-button type="primary" @click="handleRefresh" :loading="configsStore.loading">
          <el-icon><Refresh /></el-icon>
          Обновить
        </el-button>
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          Создать конфигурацию
        </el-button>
      </div>
    </div>

    <el-card>
      <el-table
        :data="configsStore.configs"
        v-loading="configsStore.loading"
        style="width: 100%"
        stripe
      >
        <el-table-column prop="id" label="ID конфигурации" width="300" />
        <el-table-column label="Параметры" min-width="400">
          <template #default="{ row }">
            <div class="params-preview">
              <code>{{ formatParams(row.params) }}</code>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Действия" width="250" fixed="right">
          <template #default="{ row }">
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

    <!-- Config Form Dialog -->
    <el-dialog
      v-model="formDialogVisible"
      :title="isEditing ? 'Редактирование конфигурации' : 'Создание конфигурации'"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="configForm"
        :rules="formRules"
        label-position="top"
      >
        <el-form-item label="ID конфигурации" prop="id">
          <el-input
            v-model="configForm.id"
            :disabled="isEditing"
            placeholder="Введите уникальный ID конфигурации"
          />
        </el-form-item>

        <el-form-item label="Параметры (JSON)" prop="paramsJson">
          <el-input
            v-model="configForm.paramsJson"
            type="textarea"
            :rows="15"
            placeholder='{"key": "value", "number": 123}'
          />
          <div v-if="jsonError" class="json-error">
            <el-alert type="error" :closable="false">
              {{ jsonError }}
            </el-alert>
          </div>
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
  Edit,
  Delete,
} from '@element-plus/icons-vue'
import type { ActModConf } from '~/utils/api-client'

definePageMeta({
  layout: 'default',
})

const configsStore = useConfigsStore()
const { showSuccess, showError } = useNotification()
const { confirmDelete } = useConfirm()

const formDialogVisible = ref(false)
const formRef = ref<FormInstance>()
const isEditing = ref(false)
const jsonError = ref('')

interface ConfigFormData {
  id: string
  paramsJson: string
}

const configForm = reactive<ConfigFormData>({
  id: '',
  paramsJson: '{}',
})

const formRules: FormRules = {
  id: [{ required: true, message: 'Пожалуйста, введите ID конфигурации', trigger: 'blur' }],
  paramsJson: [
    { required: true, message: 'Пожалуйста, введите параметры', trigger: 'blur' },
  ],
}

const formatParams = (params: any) => {
  if (!params || typeof params !== 'object') return '{}'
  try {
    return JSON.stringify(params, null, 2)
  } catch {
    return '{}'
  }
}

const validateJson = () => {
  try {
    JSON.parse(configForm.paramsJson)
    jsonError.value = ''
    return true
  } catch (error: any) {
    jsonError.value = `Ошибка JSON: ${error.message}`
    return false
  }
}

const handleRefresh = async () => {
  try {
    await configsStore.fetchConfigs()
    showSuccess('Список конфигураций обновлён')
  } catch (error: any) {
    showError(error.message || 'Не удалось обновить список конфигураций')
  }
}

const handleCreate = () => {
  isEditing.value = false
  configForm.id = ''
  configForm.paramsJson = '{\n  \n}'
  jsonError.value = ''
  formDialogVisible.value = true
}

const handleEdit = (config: ActModConf) => {
  isEditing.value = true
  configForm.id = config.id || ''
  configForm.paramsJson = formatParams(config.params)
  jsonError.value = ''
  formDialogVisible.value = true
}

const handleSave = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid && validateJson()) {
      try {
        const params = JSON.parse(configForm.paramsJson)
        const config: ActModConf = {
          id: configForm.id,
          params,
        }
        await configsStore.saveConfig(config.id!, config)
        showSuccess(`Конфигурация "${config.id}" сохранена`)
        formDialogVisible.value = false
      } catch (error: any) {
        showError(error.message || 'Не удалось сохранить конфигурацию')
      }
    }
  })
}

const handleDelete = async (config: ActModConf) => {
  const confirmed = await confirmDelete(config.id)
  if (confirmed) {
    try {
      await configsStore.deleteConfig(config.id!)
      showSuccess(`Конфигурация "${config.id}" удалена`)
    } catch (error: any) {
      showError(error.message || 'Не удалось удалить конфигурацию')
    }
  }
}

onMounted(async () => {
  if (configsStore.configs.length === 0) {
    await handleRefresh()
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

.params-preview {
  max-height: 100px;
  overflow: auto;
  background-color: #f5f7fa;
  padding: 8px;
  border-radius: 4px;

  code {
    font-family: 'Courier New', Courier, monospace;
    font-size: 12px;
    white-space: pre-wrap;
    word-wrap: break-word;
  }
}

.json-error {
  margin-top: 8px;
}
</style>
