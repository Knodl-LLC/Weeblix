import { defineStore } from 'pinia'
import type { ActModConf } from '~/utils/api-client'

export interface ConfigsState {
  configs: ActModConf[]
  loading: boolean
  selectedConfig: ActModConf | null
}

export const useConfigsStore = defineStore('configs', {
  state: (): ConfigsState => ({
    configs: [],
    loading: false,
    selectedConfig: null,
  }),

  getters: {
    getConfigById: (state) => (id: string) => {
      return state.configs.find((cfg) => cfg.id === id)
    },
    configsCount: (state) => state.configs.length,
  },

  actions: {
    async fetchConfigs() {
      this.loading = true
      try {
        const { api } = useApi()
        this.configs = await api.getConfigs()
      } catch (error) {
        console.error('Failed to fetch configs:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchConfig(id: string) {
      try {
        const { api } = useApi()
        const config = await api.getConfig(id)
        this.selectedConfig = config
        return config
      } catch (error) {
        console.error('Failed to fetch config:', error)
        throw error
      }
    },

    async saveConfig(id: string, config: ActModConf) {
      try {
        const { api } = useApi()
        await api.saveConfig(id, config)
        await this.fetchConfigs()
      } catch (error) {
        console.error('Failed to save config:', error)
        throw error
      }
    },

    async deleteConfig(id: string) {
      try {
        const { api } = useApi()
        await api.deleteConfig(id)
        this.configs = this.configs.filter((cfg) => cfg.id !== id)
      } catch (error) {
        console.error('Failed to delete config:', error)
        throw error
      }
    },

    selectConfig(config: ActModConf | null) {
      this.selectedConfig = config
    },
  },
})
