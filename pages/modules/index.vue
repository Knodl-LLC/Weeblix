<template>
  <div class="page-container">
    <div class="page-header">
      <h1>Управление модулями</h1>
      <div class="header-actions">
        <el-button type="primary" @click="handleRefresh" :loading="modulesStore.loading">
          <el-icon><Refresh /></el-icon>
          Обновить
        </el-button>
      </div>
    </div>

    <el-card>
      <el-table
        :data="modulesStore.modules"
        v-loading="modulesStore.loading"
        style="width: 100%"
        stripe
      >
        <el-table-column prop="id" label="ID модуля" width="200" />
        <el-table-column label="Реестр" width="250">
          <template #default="{ row }">
            <el-tag v-if="row.from_reg" type="info">{{ row.from_reg }}</el-tag>
            <el-tag v-else type="warning">Локальный</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Конфигурация по умолчанию" width="200">
          <template #default="{ row }">
            <el-tag v-if="row.config_default" type="success">Есть</el-tag>
            <el-tag v-else type="info">Нет</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Действия" width="380" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleViewCode(row)">
              <el-icon><View /></el-icon>
              Код
            </el-button>
            <el-button size="small" type="warning" @click="handleEditCode(row)">
              <el-icon><Edit /></el-icon>
              Редактировать
            </el-button>
            <el-button size="small" type="primary" @click="handleCopy(row)">
              <el-icon><CopyDocument /></el-icon>
              Копировать
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

    <!-- Code Viewer Dialog -->
    <el-dialog
      v-model="codeDialogVisible"
      title="Код модуля"
      width="80%"
      :close-on-click-modal="false"
    >
      <div v-if="selectedModule">
        <el-descriptions :column="1" border class="mb-4">
          <el-descriptions-item label="ID">{{ selectedModule.id }}</el-descriptions-item>
          <el-descriptions-item label="Реестр">
            {{ selectedModule.from_reg || 'Локальный' }}
          </el-descriptions-item>
        </el-descriptions>

        <el-divider>Программный код (Elixir)</el-divider>

        <div class="code-viewer">
          <pre>{{ decodedCode }}</pre>
        </div>
      </div>
    </el-dialog>

    <!-- Code Editor Dialog -->
    <el-dialog
      v-model="editDialogVisible"
      title="Редактирование кода модуля"
      width="85%"
      :close-on-click-modal="false"
      @close="handleEditClose"
    >
      <div v-if="editingModule">
        <el-descriptions :column="2" border class="mb-4">
          <el-descriptions-item label="ID модуля">{{ editingModule.id }}</el-descriptions-item>
          <el-descriptions-item label="Реестр">
            {{ editingModule.from_reg || 'Локальный' }}
          </el-descriptions-item>
        </el-descriptions>

        <el-divider>Программный код (Elixir)</el-divider>

        <div class="code-editor-container">
          <el-input
            v-model="editCode"
            type="textarea"
            :rows="25"
            placeholder="Введите код модуля на Elixir..."
            class="code-editor"
            resize="vertical"
          />
        </div>
      </div>
      <template #footer>
        <el-button @click="editDialogVisible = false">Отмена</el-button>
        <el-button
          type="primary"
          @click="handleSaveCode"
          :loading="saving"
        >
          Сохранить
        </el-button>
      </template>
    </el-dialog>

    <!-- Copy Module Dialog -->
    <el-dialog
      v-model="copyDialogVisible"
      title="Копирование модуля"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="copyForm" label-position="top">
        <el-form-item label="Исходный модуль">
          <el-input v-model="copyForm.from" disabled />
        </el-form-item>
        <el-form-item label="Новый ID модуля">
          <el-input
            v-model="copyForm.to"
            placeholder="Введите новый ID для копии модуля"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="copyDialogVisible = false">Отмена</el-button>
        <el-button
          type="primary"
          @click="handleConfirmCopy"
          :disabled="!copyForm.to"
        >
          Копировать
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import {
  Refresh,
  View,
  Edit,
  CopyDocument,
  Delete,
} from '@element-plus/icons-vue'
import type { ActMod } from '~/utils/api-client'

definePageMeta({
  layout: 'default',
})

const modulesStore = useModulesStore()
const { showSuccess, showError } = useNotification()
const { confirmDelete } = useConfirm()

const codeDialogVisible = ref(false)
const editDialogVisible = ref(false)
const copyDialogVisible = ref(false)
const selectedModule = ref<ActMod | null>(null)
const editingModule = ref<ActMod | null>(null)
const editCode = ref('')
const saving = ref(false)

const copyForm = reactive({
  from: '',
  to: '',
})

const decodedCode = computed(() => {
  if (!selectedModule.value?.base64) return ''
  return modulesStore.decodeModuleCode(selectedModule.value.base64)
})

const handleRefresh = async () => {
  try {
    await modulesStore.fetchModules()
    showSuccess('Список модулей обновлён')
  } catch (error: any) {
    showError(error.message || 'Не удалось обновить список модулей')
  }
}

const handleViewCode = (module: ActMod) => {
  selectedModule.value = module
  codeDialogVisible.value = true
}

const handleEditCode = (module: ActMod) => {
  editingModule.value = module
  editCode.value = module.base64
    ? modulesStore.decodeModuleCode(module.base64)
    : ''
  editDialogVisible.value = true
}

const handleEditClose = () => {
  editingModule.value = null
  editCode.value = ''
}

const handleSaveCode = async () => {
  if (!editingModule.value) return

  saving.value = true
  try {
    const encodedCode = modulesStore.encodeModuleCode(editCode.value)
    const updatedModule: ActMod = {
      ...editingModule.value,
      base64: encodedCode,
    }
    await modulesStore.saveModule(editingModule.value.id!, updatedModule)
    showSuccess(`Код модуля "${editingModule.value.id}" сохранён`)
    editDialogVisible.value = false
  } catch (error: any) {
    showError(error.message || 'Не удалось сохранить код модуля')
  } finally {
    saving.value = false
  }
}

const handleCopy = (module: ActMod) => {
  copyForm.from = module.id || ''
  copyForm.to = ''
  copyDialogVisible.value = true
}

const handleConfirmCopy = async () => {
  try {
    await modulesStore.copyModule(copyForm.from, copyForm.to)
    showSuccess(`Модуль "${copyForm.from}" скопирован как "${copyForm.to}"`)
    copyDialogVisible.value = false
  } catch (error: any) {
    showError(error.message || 'Не удалось скопировать модуль')
  }
}

const handleDelete = async (module: ActMod) => {
  const confirmed = await confirmDelete(module.id)
  if (confirmed) {
    try {
      await modulesStore.removeModule(module.id!)
      showSuccess(`Модуль "${module.id}" удалён`)
    } catch (error: any) {
      showError(error.message || 'Не удалось удалить модуль')
    }
  }
}

onMounted(async () => {
  if (modulesStore.modules.length === 0) {
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

.code-viewer {
  background-color: #f5f7fa;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  padding: 16px;
  max-height: 500px;
  overflow: auto;

  pre {
    margin: 0;
    font-family: 'Courier New', Courier, monospace;
    font-size: 13px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-wrap: break-word;
  }
}

.code-editor-container {
  .code-editor {
    :deep(.el-textarea__inner) {
      font-family: 'Courier New', Courier, monospace;
      font-size: 13px;
      line-height: 1.6;
      padding: 16px;
      background-color: #1e1e1e;
      color: #d4d4d4;
      border-radius: 4px;
      min-height: 400px;
    }
  }
}

.mb-4 {
  margin-bottom: 16px;
}
</style>
