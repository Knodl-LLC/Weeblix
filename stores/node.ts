import { defineStore } from 'pinia'

export interface SavedNode {
  url: string
  name: string
  lastConnected?: Date
}

export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting'

export interface NodeState {
  currentNodeUrl: string | null
  connectionStatus: ConnectionStatus
  savedNodes: SavedNode[]
}

export const useNodeStore = defineStore('node', {
  state: (): NodeState => ({
    currentNodeUrl: null,
    connectionStatus: 'disconnected',
    savedNodes: [],
  }),

  getters: {
    isConnected: (state) => state.connectionStatus === 'connected',
    currentNode: (state) => {
      if (!state.currentNodeUrl) return null
      return state.savedNodes.find((node) => node.url === state.currentNodeUrl) || null
    },
  },

  actions: {
    async connectToNode(url: string) {
      this.connectionStatus = 'connecting'
      this.currentNodeUrl = url

      try {
        // Test connection by making a simple request
        const { api } = useApi()
        await api.getServices()

        this.connectionStatus = 'connected'

        // Update saved nodes
        const existingNode = this.savedNodes.find((node) => node.url === url)
        if (existingNode) {
          existingNode.lastConnected = new Date()
        } else {
          this.savedNodes.push({
            url,
            name: url,
            lastConnected: new Date(),
          })
        }

        // Persist to localStorage
        this.persistNodes()

        return true
      } catch (error) {
        this.connectionStatus = 'disconnected'
        this.currentNodeUrl = null
        throw error
      }
    },

    disconnectFromNode() {
      this.currentNodeUrl = null
      this.connectionStatus = 'disconnected'
    },

    updateNodeName(url: string, name: string) {
      const node = this.savedNodes.find((n) => n.url === url)
      if (node) {
        node.name = name
        this.persistNodes()
      }
    },

    removeNode(url: string) {
      this.savedNodes = this.savedNodes.filter((node) => node.url !== url)
      if (this.currentNodeUrl === url) {
        this.disconnectFromNode()
      }
      this.persistNodes()
    },

    loadNodes() {
      if (process.client) {
        const saved = localStorage.getItem('nevalyashka_nodes')
        if (saved) {
          try {
            this.savedNodes = JSON.parse(saved)
          } catch (error) {
            console.error('Failed to load saved nodes:', error)
          }
        }
      }
    },

    persistNodes() {
      if (process.client) {
        localStorage.setItem('nevalyashka_nodes', JSON.stringify(this.savedNodes))
      }
    },
  },
})
