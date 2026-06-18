import * as signalR from '@microsoft/signalr'

const BASE_URL = import.meta.env.VITE_BFF_OPERACIONAL_URL || 'http://localhost:5159'
const TENANT_ID = import.meta.env.VITE_TENANT_ID || '00000000-0000-0000-0000-000000000001'

class SignalRService {
  private connection: signalR.HubConnection | null = null
  private listeners: Map<string, Set<(data: string) => void>> = new Map()

  async connect() {
    if (this.connection?.state === signalR.HubConnectionState.Connected) return

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${BASE_URL}/hubs/orders`, {
        headers: { 'X-Tenant-Id': TENANT_ID }
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(signalR.LogLevel.Warning)
      .build()

    this.connection.on('OrdersUpdated', (data: string) => {
      this.listeners.get('OrdersUpdated')?.forEach(cb => cb(data))
    })

    this.connection.onreconnected(async () => {
      await this.connection!.invoke('JoinTenant', TENANT_ID)
      await this.fetchAndNotify()
    })

    await this.connection.start()
    await this.connection.invoke('JoinTenant', TENANT_ID)
    await this.fetchAndNotify()
  }

  private async fetchAndNotify() {
    try {
      const response = await fetch(`${BASE_URL}/api/orders`, {
        headers: { 'X-Tenant-Id': TENANT_ID }
      })
      const orders = await response.json()
      const data = JSON.stringify(orders)
      this.listeners.get('OrdersUpdated')?.forEach(cb => cb(data))
    } catch (e) {
      console.error('Erro ao buscar pedidos iniciais:', e)
    }
  }

  async joinTable(tableId: string) {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke('JoinTable', TENANT_ID, tableId)
    }
  }

  async leaveTable(tableId: string) {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke('LeaveTable', TENANT_ID, tableId)
    }
  }

  onOrdersUpdated(callback: (data: string) => void) {
    if (!this.listeners.has('OrdersUpdated')) {
      this.listeners.set('OrdersUpdated', new Set())
    }
    this.listeners.get('OrdersUpdated')!.add(callback)
    return () => this.listeners.get('OrdersUpdated')?.delete(callback)
  }

  get state() {
    return this.connection?.state
  }
}

export const signalRService = new SignalRService()