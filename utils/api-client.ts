import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import type { paths } from '~/types/api-schema'

export class ApiClient {
  private client: AxiosInstance
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add any request modifications here (e.g., auth tokens)
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        return response
      },
      (error) => {
        // Centralized error handling
        if (error.response) {
          // Server responded with error status
          console.error('API Error:', error.response.status, error.response.data)
        } else if (error.request) {
          // Request made but no response
          console.error('Network Error:', error.message)
        } else {
          // Something else happened
          console.error('Error:', error.message)
        }
        return Promise.reject(error)
      }
    )
  }

  setBaseURL(baseURL: string) {
    this.baseURL = baseURL
    this.client.defaults.baseURL = baseURL
  }

  getBaseURL(): string {
    return this.baseURL
  }

  // Generic request method
  async request<T>(config: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.request(config)
    return response.data
  }

  // GET request
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'GET', url })
  }

  // POST request
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'POST', url, data })
  }

  // PUT request
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PUT', url, data })
  }

  // DELETE request
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'DELETE', url })
  }
}

// Type-safe API methods based on OpenAPI schema
export type ActMod = paths['/node/module/list']['get']['responses']['200']['content']['application/json'][number]
export type ActServ = paths['/node/service/list']['get']['responses']['200']['content']['application/json'][number]
export type ActModConf = paths['/node/config/list']['get']['responses']['200']['content']['application/json'][number]
export type Register = paths['/node/register/list']['get']['responses']['200']['content']['application/json'][number]

// API Repository
export class NevalyashkaApi {
  constructor(private client: ApiClient) {}

  // Modules
  async getModules(): Promise<ActMod[]> {
    return this.client.get<ActMod[]>('/node/module/list')
  }

  async getModulesFromRegistry(regId: string): Promise<ActMod[]> {
    return this.client.get<ActMod[]>(`/node/module/onreg/${regId}`)
  }

  async addModuleFromRegistry(regId: string, modId: string): Promise<ActMod> {
    return this.client.get<ActMod>(`/node/module/add/${regId}/${modId}`)
  }

  async removeModule(modId: string): Promise<ActMod> {
    return this.client.get<ActMod>(`/node/module/rm/${modId}`)
  }

  async copyModule(modFrom: string, modTo: string): Promise<ActMod> {
    return this.client.get<ActMod>(`/node/module/cp/${modFrom}/${modTo}`)
  }

  // Services
  async getServices(): Promise<ActServ[]> {
    return this.client.get<ActServ[]>('/node/service/list')
  }

  async getRunningServices(): Promise<ActServ[]> {
    return this.client.get<ActServ[]>('/node/running')
  }

  async getService(id: string): Promise<ActServ> {
    return this.client.get<ActServ>(`/node/service/read/${id}`)
  }

  async saveService(id: string, service: ActServ): Promise<string> {
    return this.client.post<string>(`/node/service/put/${id}`, service)
  }

  async deleteService(id: string): Promise<ActServ> {
    return this.client.post<ActServ>(`/node/service/del/${id}`)
  }

  async startService(id: string): Promise<ActServ[]> {
    return this.client.get<ActServ[]>(`/node/start/${id}`)
  }

  async stopService(id: string): Promise<ActServ[]> {
    return this.client.get<ActServ[]>(`/node/stop/${id}`)
  }

  async startAllServices(): Promise<string> {
    return this.client.get<string>('/node/start_all')
  }

  async stopAllServices(): Promise<string> {
    return this.client.get<string>('/node/stop_all')
  }

  // Configs
  async getConfigs(): Promise<ActModConf[]> {
    return this.client.get<ActModConf[]>('/node/config/list')
  }

  async getConfig(id: string): Promise<ActModConf> {
    return this.client.get<ActModConf>(`/node/config/read/${id}`)
  }

  async saveConfig(id: string, config: ActModConf): Promise<string> {
    return this.client.post<string>(`/node/config/put/${id}`, config)
  }

  async deleteConfig(id: string): Promise<ActModConf> {
    return this.client.post<ActModConf>(`/node/config/del/${id}`)
  }

  // Registers
  async getRegisters(): Promise<Register[]> {
    return this.client.get<Register[]>('/node/register/list')
  }

  async getRegister(id: string): Promise<Register> {
    return this.client.get<Register>(`/node/register/read/${id}`)
  }

  async saveRegister(id: string, register: Register): Promise<string> {
    return this.client.post<string>(`/node/register/put/${id}`, register)
  }

  async deleteRegister(id: string): Promise<Register> {
    return this.client.post<Register>(`/node/register/del/${id}`)
  }

  // Registry modules
  async getRegistryModules(): Promise<ActMod[]> {
    return this.client.get<ActMod[]>('/reg/module/list')
  }

  async getRegistryModule(id: string): Promise<ActMod> {
    return this.client.get<ActMod>(`/reg/module/read/${id}`)
  }

  async saveRegistryModule(id: string, module: ActMod): Promise<string> {
    return this.client.post<string>(`/reg/module/put/${id}`, module)
  }

  async deleteRegistryModule(id: string): Promise<ActMod> {
    return this.client.post<ActMod>(`/reg/module/del/${id}`)
  }

  // Registry configs
  async getRegistryConfigs(): Promise<ActModConf[]> {
    return this.client.get<ActModConf[]>('/reg/config/list')
  }

  async getRegistryConfig(id: string): Promise<ActModConf> {
    return this.client.get<ActModConf>(`/reg/config/read/${id}`)
  }

  async saveRegistryConfig(id: string, config: ActModConf): Promise<string> {
    return this.client.post<string>(`/reg/config/put/${id}`, config)
  }

  async deleteRegistryConfig(id: string): Promise<ActModConf> {
    return this.client.post<ActModConf>(`/reg/config/del/${id}`)
  }
}
