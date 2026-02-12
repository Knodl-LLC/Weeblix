import { defineStore } from 'pinia'
import { useConfigsStore } from './configs'
import type { ActServ } from '~/utils/api-client'

export interface ServicesState {
  services: ActServ[]
  runningServices: ActServ[]
  loading: boolean
  selectedService: ActServ | null
}

export const useServicesStore = defineStore('services', {
  state: (): ServicesState => ({
    services: [],
    runningServices: [],
    loading: false,
    selectedService: null,
  }),

  getters: {
    getServiceById: (state) => (id: string) => {
      return state.services.find((srv) => srv.id === id)
    },
    isServiceRunning: (state) => (id: string) => {
      return state.runningServices.some((srv) => srv.id === id)
    },
    servicesCount: (state) => state.services.length,
    runningServicesCount: (state) => state.runningServices.length,
    allChannels: (state) => [...new Set(
        state.services.flatMap(srv => [
            ...Array.from(srv.channels?.in || []),
            ...Array.from(srv.channels?.out || [])
        ])
    )]
  },

  actions: {
    async fetchServices() {
      this.loading = true
      try {
        const { api } = useApi()
        this.services = await api.getServices()
      } catch (error) {
        console.error('Failed to fetch services:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchRunningServices() {
      try {
        const { api } = useApi()
        this.runningServices = await api.getRunningServices()
      } catch (error) {
        console.error('Failed to fetch running services:', error)
        throw error
      }
    },

    async fetchService(id: string) {
      try {
        const { api } = useApi()
        const service = await api.getService(id)
        this.selectedService = service
        return service
      } catch (error) {
        console.error('Failed to fetch service:', error)
        throw error
      }
    },

    async saveService(id: string, service: ActServ) {
      try {
        const { api } = useApi()
        const configsStore = useConfigsStore()
        await api.saveService(id, service)
        await this.fetchServices()
        await configsStore.fetchConfigs()
      } catch (error) {
        console.error('Failed to save service:', error)
        throw error
      }
    },

    async deleteService(id: string) {
      try {
        const { api } = useApi()
        await api.deleteService(id)
        this.services = this.services.filter((srv) => srv.id !== id)
        this.runningServices = this.runningServices.filter((srv) => srv.id !== id)
      } catch (error) {
        console.error('Failed to delete service:', error)
        throw error
      }
    },

    async startService(id: string) {
      try {
        const { api } = useApi()
        this.runningServices = await api.startService(id)
      } catch (error) {
        console.error('Failed to start service:', error)
        throw error
      }
    },

    async stopService(id: string) {
      try {
        const { api } = useApi()
        this.runningServices = await api.stopService(id)
      } catch (error) {
        console.error('Failed to stop service:', error)
        throw error
      }
    },

    async startAllServices() {
      try {
        const { api } = useApi()
        await api.startAllServices()
        await this.fetchRunningServices()
      } catch (error) {
        console.error('Failed to start all services:', error)
        throw error
      }
    },

    async stopAllServices() {
      try {
        const { api } = useApi()
        await api.stopAllServices()
        this.runningServices = []
      } catch (error) {
        console.error('Failed to stop all services:', error)
        throw error
      }
    },

    selectService(service: ActServ | null) {
      this.selectedService = service
    },
  },
})
