import { Injectable, inject } from '@angular/core';
import { Network } from '@capacitor/network';
import { SqliteOrdersService } from './sqlite-orders.service';
import { OrdersService } from './orders.service';
import { firstValueFrom } from 'rxjs';
import { BmToastService } from './bm-toast.service';

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  private sqliteOrdersService = inject(SqliteOrdersService);
  private ordersService = inject(OrdersService);
  private bmToast = inject(BmToastService);

  constructor() {
    Network.addListener('networkStatusChange', async (status) => {
      if (status.connected) {
        await this.bmToast.success('Conexión recuperada. Sincronizando datos...');
        this.sincronizarPedidosPendientes();
      }
    });
  }

  async sincronizarPedidosPendientes() {
    const pedidosPendientes = await this.sqliteOrdersService.getUnsyncedOrders();
    if (pedidosPendientes.length === 0) {
      console.log('No hay pedidos pendientes para sincronizar.');
      return;
    }

    console.log(`Sincronizando ${pedidosPendientes.length} pedidos...`);
    let successCount = 0;

    for (const pedido of pedidosPendientes) {
      try {
        const result = await firstValueFrom(this.ordersService.syncOrder(pedido));
        if (result && pedido.id) {
          await this.sqliteOrdersService.markOrderAsSynced(pedido.id);
          successCount++;
        }
      } catch (error) {
        console.error(`Error al sincronizar pedido ${pedido.id}:`, error);
      }
    }

    if (successCount > 0) {
      await this.bmToast.success(`${successCount} de ${pedidosPendientes.length} pedidos se han sincronizado correctamente.`);
    }
  }
}
