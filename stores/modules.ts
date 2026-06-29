import { defineStore } from 'pinia'
import type { ActMod } from '~/utils/api-client'

export interface ModulesState {
  modules: ActMod[]
  loading: boolean
  selectedModule: ActMod | null
}

export const useModulesStore = defineStore('modules', {
  state: (): ModulesState => ({
    modules: [],
    loading: false,
    selectedModule: null,
  }),

  getters: {
    getModuleById: (state) => (id: string) => {
      return state.modules.find((mod) => mod.id === id)
    },
    modulesCount: (state) => state.modules.length,
  },

  actions: {
    async fetchModules() {
      this.loading = true
      try {
        const { api } = useApi()
        this.modules = await api.getModules()
      } catch (error) {
        console.error('Failed to fetch modules:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async addModuleFromRegistry(regId: string, modId: string) {
      try {
        const { api } = useApi()
        const module = await api.addModuleFromRegistry(regId, modId)
        this.modules.push(module)
        return module
      } catch (error) {
        console.error('Failed to add module:', error)
        throw error
      }
    },

    async removeModule(modId: string) {
      try {
        const { api } = useApi()
        await api.removeModule(modId)
        this.modules = this.modules.filter((mod) => mod.id !== modId)
      } catch (error) {
        console.error('Failed to remove module:', error)
        throw error
      }
    },

    async copyModule(modFrom: string, modTo: string) {
      try {
        const { api } = useApi()
        const module = await api.copyModule(modFrom, modTo)
        this.modules.push(module)
        return module
      } catch (error) {
        console.error('Failed to copy module:', error)
        throw error
      }
    },

    async saveModule(modId: string, module: ActMod) {
      try {
        const { api } = useApi()
        await api.saveModule(modId, module)
        await this.fetchModules()
      } catch (error) {
        console.error('Failed to save module:', error)
        throw error
      }
    },

    encodeModuleCode(code: string): string {
      try {
        const encoder = new TextEncoder()
        const bytes = encoder.encode(code)
        let binaryString = ''
        for (let i = 0; i < bytes.length; i++) {
          binaryString += String.fromCharCode(bytes[i])
        }
        return btoa(binaryString)
      } catch (error) {
        console.error('Failed to encode module code:', error)
        return ''
      }
    },

    selectModule(module: ActMod | null) {
      this.selectedModule = module
    },

      decodeModuleCode(base64Code: string): string {
          try {
              // Step 1: Use atob() to get raw bytes from Base64
              const binaryString = atob(base64Code);

              // Step 2: Convert binary string to UTF-8 using TextDecoder
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                  bytes[i] = binaryString.charCodeAt(i);
              }

              const decoder = new TextDecoder('utf-8');
              return decoder.decode(bytes);
          } catch (error) {
              console.error('Failed to decode module code:', error)
              return 'Ошибка декодирования кода модуля'
          }
      },
  },
})
