import * as signalR from '@microsoft/signalr'

const BASE_URL = import.meta.env.VITE_BFF_OPERACIONAL_URL || 'http://localhost:5159'

class SignalRService {
  private connection: signalR.HubConnection | null = null
  private listeners: Map<string, Set<(data: string) => void>> = new Map()
  private tenantId: string = '00000000-0000-0000-0000-000000000001'

  setTenantId(tenantId: string) {
    this.tenantId = tenantId
  }

  async connect() {
    if (this.connection) {
      const state = this.connection.state
      if (
        state === signalR.HubConnectionState.Connected ||
        state === signalR.HubConnectionState.Connecting ||
        state === signalR.HubConnectionState.Reconnecting
      ) {
        console.log(`[SignalR] connect() ignorado, estado já é: ${state}`)
        return
      }
    }

    console.log('[SignalR] Iniciando nova conexão...')

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${BASE_URL}/hubs/orders`, {
        headers: { 'X-Tenant-Id': this.tenantId }
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(signalR.LogLevel.Warning)
      .build()

    this.connection.on('OrdersUpdated', (data: string) => {
      console.log(`[SignalR] OrdersUpdated recebido do servidor, ${this.listeners.get('OrdersUpdated')?.size ?? 0} listeners registrados`)
      this.listeners.get('OrdersUpdated')?.forEach(cb => cb(data))
    })

    this.connection.on('PaymentConfirmed', (data: string) => {
      this.listeners.get('PaymentConfirmed')?.forEach(cb => cb(data))
    })

    this.connection.onreconnected(async () => {
      console.log('[SignalR] Reconectado!')
      await this.connection!.invoke('JoinTenant', this.tenantId)
      await this.fetchAndNotify()
    })

    this.connection.onreconnecting(() => {
      console.log('[SignalR] Reconectando...')
    })

    this.connection.onclose((error) => {
      console.log('[SignalR] Conexão fechada.', error)
    })

    try {
      await this.connection.start()
      console.log('[SignalR] Conexão estabelecida com sucesso. State:', this.connection.state)
      await this.connection.invoke('JoinTenant', this.tenantId)
      console.log('[SignalR] JoinTenant concluído')
      await this.fetchAndNotify()
    } catch (e) {
      console.error('[SignalR] Erro ao conectar:', e)
      this.connection = null
    }
  }

  private async fetchAndNotify() {
    try {
      const response = await fetch(`${BASE_URL}/api/orders`, {
        headers: { 'X-Tenant-Id': this.tenantId }
      })
      const orders = await response.json()
      console.log(`[SignalR] fetchAndNotify: ${orders.length} pedidos carregados inicialmente`)
      this.listeners.get('OrdersUpdated')?.forEach(cb => cb(JSON.stringify(orders)))
    } catch (e) {
      console.error('[SignalR] Erro ao buscar pedidos iniciais:', e)
    }
  }

  async joinTable(tableId: string) {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke('JoinTable', this.tenantId, tableId)
      console.log(`[SignalR] JoinTable concluído: ${tableId}`)
    } else {
      console.warn(`[SignalR] joinTable chamado mas connection não está Connected. State: ${this.connection?.state}`)
    }
  }

  async leaveTable(tableId: string) {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke('LeaveTable', this.tenantId, tableId)
      console.log(`[SignalR] LeaveTable concluído: ${tableId}`)
    }
  }

  onOrdersUpdated(callback: (data: string) => void) {
    if (!this.listeners.has('OrdersUpdated')) {
      this.listeners.set('OrdersUpdated', new Set())
    }
    this.listeners.get('OrdersUpdated')!.add(callback)
    console.log(`[SignalR] onOrdersUpdated registrado, total agora: ${this.listeners.get('OrdersUpdated')!.size}`)
    return () => {
      this.listeners.get('OrdersUpdated')?.delete(callback)
      console.log(`[SignalR] onOrdersUpdated removido, total agora: ${this.listeners.get('OrdersUpdated')?.size}`)
    }
  }

  onPaymentConfirmed(callback: (data: string) => void) {
    if (!this.listeners.has('PaymentConfirmed')) {
      this.listeners.set('PaymentConfirmed', new Set())
    }
    this.listeners.get('PaymentConfirmed')!.add(callback)
    return () => this.listeners.get('PaymentConfirmed')?.delete(callback)
  }

  get state() {
    return this.connection?.state
  }
}

export const signalRService = new SignalRService()