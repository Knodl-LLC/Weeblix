import { defineStore } from 'pinia'
import type { Register, ActMod } from '~/utils/api-client'

export interface RegistersState {
  registers: Register[]
  loading: boolean
  selectedRegister: Register | null
  registerModules: Record<string, ActMod[]>
}

export const useRegistersStore = defineStore('registers', {
  state: (): RegistersState => ({
    registers: [],
    loading: false,
    selectedRegister: null,
    registerModules: {},
  }),

  getters: {
    getRegisterById: (state) => (id: string) => {
      return state.registers.find((reg) => reg.id === id)
    },
    getRegisterModules: (state) => (registerId: string) => {
      return state.registerModules[registerId] || []
    },
    registersCount: (state) => state.registers.length,
  },

  actions: {
    async fetchRegisters() {
      this.loading = true
      try {
        const { api } = useApi()
        this.registers = await api.getRegisters()
      } catch (error) {
        console.error('Failed to fetch registers:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchRegister(id: string) {
      try {
        const { api } = useApi()
        const register = await api.getRegister(id)
        this.selectedRegister = register
        return register
      } catch (error) {
        console.error('Failed to fetch register:', error)
        throw error
      }
    },

    async saveRegister(id: string, register: Register) {
      try {
        const { api } = useApi()
        await api.saveRegister(id, register)
        await this.fetchRegisters()
      } catch (error) {
        console.error('Failed to save register:', error)
        throw error
      }
    },

    async deleteRegister(id: string) {
      try {
        const { api } = useApi()
        await api.deleteRegister(id)
        this.registers = this.registers.filter((reg) => reg.id !== id)
        delete this.registerModules[id]
      } catch (error) {
        console.error('Failed to delete register:', error)
        throw error
      }
    },

    async fetchModulesFromRegistry(registerId: string) {
      try {
        const { api } = useApi()
        const modules = await api.getModulesFromRegistry(registerId)
        this.registerModules[registerId] = modules
        return modules
      } catch (error) {
        console.error('Failed to fetch modules from registry:', error)
        throw error
      }
    },

    selectRegister(register: Register | null) {
      this.selectedRegister = register
    },
  },
})
