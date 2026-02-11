<template>
  <div class="page-container">
    <div class="page-header">
      <h1>Управление реестрами</h1>
      <div class="header-actions">
        <el-button type="primary" @click="handleRefresh" :loading="registersStore.loading">
          <el-icon><Refresh /></el-icon>
          Обновить
        </el-button>
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          Добавить реестр
        </el-button>
      </div>
    </div>

    <el-row :gutter="24">
      <el-col
        v-for="register in registersStore.registers"
        :key="register.id"
        :span="12"
        class="mb-4"
      >
        <el-card class="register-card">
          <template #header>
            <div class="card-header">
              <div>
                <h3>{{ register.id }}</h3>
                <div class="register-url">{{ register.url }}</div>
              </div>
              <div class="header-actions">
                <el-button
                  size="small"
                  @click="handleViewModules(register)"
                >
                  <el-icon><Box /></el-icon>
                  Модули
                </el-button>
                <el-button
                  size="small"
                  type="danger"
                  @click="handleDelete(register)"
                >
                  <el-icon><Delete /></el-icon>
                  Удалить
                </el-button>
              </div>
            </div>
          </template>

          <el-descriptions :column="1" border>
            <el-descriptions-item label="ID">{{ register.id }}</el-descriptions-item>
            <el-descriptions-item label="URL">{{ register.url }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>

    <el-empty
      v-if="registersStore.registers.length === 0 && !registersStore.loading"
      description="Нет подключенных реестров"
    />

    <!-- Register Form Dialog -->
    <el-dialog
      v-model="formDialogVisible"
      :title="isEditing ? 'Редактирование реестра' : 'Добавление реестра'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="registerForm"
        :rules="formRules"
        label-position="top"
      >
        <el-form-item label="ID реестра" prop="id">
          <el-input
            v-model="registerForm.id"
            :disabled="isEditing"
            placeholder="Введите уникальный ID реестра"
          />
        </el-form-item>

        <el-form-item label="URL реестра" prop="url">
          <el-input
            v-model="registerForm.url"
            placeholder="http://example.com/registry"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="formDialogVisible = false">Отмена</el-button>
        <el-button type="primary" @click="handleSave">
          Сохранить
        </el-button>
      </template>
    </el-dialog>

    <!-- Registry Modules Dialog -->
    <el-dialog
      v-model="modulesDialogVisible"
      title="Модули в реестре"
      width="80%"
      :close-on-click-modal="false"
    >
      <div v-if="selectedRegister">
        <el-alert
          type="info"
          :closable="false"
          class="mb-4"
        >
          Реестр: <strong>{{ selectedRegister.id }}</strong> ({{ selectedRegister.url }})
        </el-alert>

        <el-table
          :data="registryModules"
          v-loading="loadingModules"
          stripe
        >
          <el-table-column prop="id" label="ID модуля" width="200" />
          <el-table-column label="Конфигурация по умолчанию" width="200">
            <template #default="{ row }">
              <el-tag v-if="row.config_default" type="success">Есть</el-tag>
              <el-tag v-else type="info">Нет</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="Действия" width="200">
            <template #default="{ row }">
              <el-button
                size="small"
                type="primary"
                @click="handleAddModule(row)"
              >
                <el-icon><Download /></el-icon>
                Добавить на ноду
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import {
  Refresh,
  Plus,
  Box,
  Delete,
  Download,
} from '@element-plus/icons-vue'
import type { Register, ActMod } from '~/utils/api-client'

definePageMeta({
  layout: 'default',
})

const registersStore = useRegistersStore()
const modulesStore = useModulesStore()
const { showSuccess, showError } = useNotification()
const { confirmDelete } = useConfirm()

const formDialogVisible = ref(false)
const modulesDialogVisible = ref(false)
const formRef = ref<FormInstance>()
const isEditing = ref(false)
const selectedRegister = ref<Register | null>(null)
const loadingModules = ref(false)

const registerForm = reactive<Register>({
  id: '',
  url: '',
})

const formRules: FormRules = {
  id: [{ required: true, message: 'Пожалуйста, введите ID реестра', trigger: 'blur' }],
  url: [
    { required: true, message: 'Пожалуйста, введите URL реестра', trigger: 'blur' },
  ],
}

const registryModules = computed(() => {
  if (!selectedRegister.value) return []
  return registersStore.getRegisterModules(selectedRegister.value.id!)
})

const handleRefresh = async () => {
  try {
    await registersStore.fetchRegisters()
    showSuccess('Список реестров обновлён')
  } catch (error: any) {
    showError(error.message || 'Не удалось обновить список реестров')
  }
}

const handleCreate = () => {
  isEditing.value = false
  registerForm.id = ''
  registerForm.url = ''
  formDialogVisible.value = true
}

const handleSave = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await registersStore.saveRegister(registerForm.id!, registerForm)
        showSuccess(`Реестр "${registerForm.id}" сохранён`)
        formDialogVisible.value = false
      } catch (error: any) {
        showError(error.message || 'Не удалось сохранить реестр')
      }
    }
  })
}

const handleDelete = async (register: Register) => {
  const confirmed = await confirmDelete(register.id)
  if (confirmed) {
    try {
      await registersStore.deleteRegister(register.id!)
      showSuccess(`Реестр "${register.id}" удалён`)
    } catch (error: any) {
      showError(error.message || 'Не удалось удалить реестр')
    }
  }
}

const handleViewModules = async (register: Register) => {
  selectedRegister.value = register
  loadingModules.value = true
  modulesDialogVisible.value = true

  try {
    await registersStore.fetchModulesFromRegistry(register.id!)
  } catch (error: any) {
    showError(error.message || 'Не удалось загрузить модули из реестра')
  } finally {
    loadingModules.value = false
  }
}

const handleAddModule = async (module: ActMod) => {
  if (!selectedRegister.value) return

  try {
    await modulesStore.addModuleFromRegistry(selectedRegister.value.id!, module.id!)
    showSuccess(`Модуль "${module.id}" добавлен на ноду`)
  } catch (error: any) {
    showError(error.message || 'Не удалось добавить модуль')
  }
}

onMounted(async () => {
  if (registersStore.registers.length === 0) {
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

.register-card {
  height: 100%;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;

    h3 {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 600;
    }

    .register-url {
      font-size: 14px;
      color: var(--el-text-color-secondary);
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }
  }
}

.mb-4 {
  margin-bottom: 24px;
}
</style>
