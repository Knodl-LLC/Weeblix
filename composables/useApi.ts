import { ApiClient, NevalyashkaApi } from '~/utils/api-client'

let apiClientInstance: ApiClient | null = null
let nevalyashkaApiInstance: NevalyashkaApi | null = null

export const useApi = () => {
  const config = useRuntimeConfig()
  const nodeStore = useNodeStore()

  // Get base URL from node store or config
  const baseURL = computed(() => nodeStore.currentNodeUrl || config.public.apiBaseUrl)

  // Initialize or update API client
  if (!apiClientInstance) {
    apiClientInstance = new ApiClient(baseURL.value)
    nevalyashkaApiInstance = new NevalyashkaApi(apiClientInstance)
  } else {
    // Update base URL if changed
    if (apiClientInstance.getBaseURL() !== baseURL.value) {
      apiClientInstance.setBaseURL(baseURL.value)
    }
  }

  // Watch for base URL changes
  watch(baseURL, (newBaseURL) => {
    if (apiClientInstance && apiClientInstance.getBaseURL() !== newBaseURL) {
      apiClientInstance.setBaseURL(newBaseURL)
    }
  })

  return {
    client: apiClientInstance,
    api: nevalyashkaApiInstance!,
  }
}
