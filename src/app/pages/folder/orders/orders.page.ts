import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { BasketService } from './../../../services/basket.service';

import { IonButton, IonButtons, IonCard, IonCardContent, IonChip, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList, IonMenuButton, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addSharp, businessOutline, carOutline, createOutline, receiptOutline, sendOutline, storefrontOutline, trashOutline } from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { BasketOrder } from 'src/app/models/basket-order';
import { Carrito } from 'src/app/models/carrito';
import { AuthService } from 'src/app/services/auth.service';
import { OrderEditDataService } from 'src/app/services/order-edit-data.service';
import { SqliteOrdersService } from 'src/app/services/sqlite-orders.service';
import { toLong } from 'src/app/utils/money.util';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonButton,
    IonIcon,
    IonContent,
    IonCard,
    IonCardContent,
    IonList,
    IonItemSliding,
    IonItem,
    IonLabel,
    IonChip,
    IonItemOptions,
    IonItemOption,
    IonFab,
    IonFabButton
  ]
})
export class OrdersPage implements OnInit, OnDestroy {
  readonly authService = inject(AuthService);
  readonly basketService = inject(BasketService);
  readonly status_Pending = 'Pending';


  orders: BasketOrder[] = [];
  orderResponse = {
    rows: this.orders,
    pagination: {
      count: 0,
      page: 1,
      pages: 1,
      size: 25
    }
  };

  private ordersSubscription?: Subscription;
  router = inject(Router);

  constructor(
    private alertController: AlertController,
    private sqliteOrdersService: SqliteOrdersService,
    private orderEditDataService: OrderEditDataService,
    private loadingController: LoadingController
  ) {
    addIcons({ addSharp, receiptOutline, createOutline, trashOutline, sendOutline, businessOutline, carOutline, storefrontOutline })
  }

  ngOnInit() {
    // No need to call initializeOrders here, ionViewWillEnter will handle it
  }

  ionViewWillEnter() {
    this.initializeOrders();
  }

  ngOnDestroy() {
    if (this.ordersSubscription) {
      this.ordersSubscription.unsubscribe();
    }
  }

  private async initializeOrders() {
    this.ordersSubscription = this.sqliteOrdersService.getOrdersObservable().subscribe(orders => {
      this.orders = orders;
      this.orderResponse.rows = orders;
      this.orderResponse.pagination.count = orders.length;
      this.orderResponse.pagination.pages = Math.ceil(orders.length / this.orderResponse.pagination.size);
    });
    // Also load orders initially in case the observable doesn't emit immediately
    const initialOrders = await this.sqliteOrdersService.getOrders();
    this.orders = initialOrders;
    this.orderResponse.rows = initialOrders;
    this.orderResponse.pagination.count = initialOrders.length;
    this.orderResponse.pagination.pages = Math.ceil(initialOrders.length / this.orderResponse.pagination.size);
  }

  BasketOrderState = {
    Open: 'Abierto',
    Closed: 'Cerrado',
    Pending: 'Pendiente',
    Delivered: 'Entregado',
    Canceled: 'Cancelado',
    Invoiced: 'Facturado',
    cancelled: 'Cancelado',
    Approved: 'Aprobado',
  };

  toShowMoney = (value: number) => (value ? value : 0);

  showTotal(element: any) {
    let total = Number(this.toShowMoney(element.totalAmount));
    if (element.deliveryAmount > 1) {
      total += Number(element.deliveryAmount);
    }
    return total;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Invoiced':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'en-proceso':
        return 'primary';
      case 'cancelled':
        return 'danger';
      default:
        return 'medium';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'completado':
        return 'Completado';
      case 'pendiente':
        return 'Pendiente';
      case 'en-proceso':
        return 'En Proceso';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  }

  getDeliveryType(order: any): string {
    // Si hay información de entrega a domicilio y tiene dirección, es envío
    if (order.customerDelivery && order.customerDelivery.address && order.customerDelivery.address.trim() !== '') {
      return 'Envío';
    }
    // Si el cliente tiene dirección pero no hay customerDelivery específico
    if (order.customer && order.customer.address && order.customer.address.trim() !== '') {
      return 'Envío';
    }
    // Si hay monto de delivery mayor a 0, probablemente es envío
    if (order.deliveryAmount && order.deliveryAmount > 0) {
      return 'Envío';
    }
    // Por defecto es retiro
    return 'Retiro';
  }

  getDeliveryTypeColor(order: any): string {
    const deliveryType = this.getDeliveryType(order);
    return deliveryType === 'Envío' ? 'tertiary' : 'secondary';
  }

  getBranchName(order: any): string {
    if (order.branch && order.branch.businessName) {
      return order.branch.businessName;
    }
    return 'Sucursal Principal';
  }

  viewOrderDetails(order: any) {
    console.log('Ver detalles de la orden:', order);
    // Aquí puedes implementar la navegación a los detalles de la orden
  }

  async editOrder(order: BasketOrder) {
    console.log('Order to edit:', order);
    this.orderEditDataService.setOrder(order);
    this.router.navigate(['add-order']);
  }

  async deleteOrder(order: any) {
    const alert = await this.alertController.create({
      header: 'Confirmar Eliminación',
      message: `¿Está seguro de que desea eliminar el pedido #${order.id}?<br><br>Cliente: ${order.customer.name} ${order.customer.lastName}<br>Total: ${this.showTotal(order)}`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              await this.sqliteOrdersService.deleteOrder(order.id);
              this.showToast(`Pedido #${order.id} eliminado exitosamente`);
            } catch (error) {
              console.error('Error deleting order:', error);
              this.showToast('Error al eliminar el pedido');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async changeOrderStatus(order: any) {
    const alert = await this.alertController.create({
      header: 'Cambiar Estado del Pedido',
      message: `Estado actual: ${this.getStatusText(order.state)}`,
      inputs: [
        {
          name: 'status',
          type: 'radio',
          label: 'Pendiente',
          value: 'Pending',
          checked: order.state === 'Pending'
        },
        {
          name: 'status',
          type: 'radio',
          label: 'En Proceso',
          value: 'en-proceso',
          checked: order.state === 'en-proceso'
        },
        {
          name: 'status',
          type: 'radio',
          label: 'Facturado',
          value: 'Invoiced',
          checked: order.state === 'Invoiced'
        },
        {
          name: 'status',
          type: 'radio',
          label: 'Cancelado',
          value: 'cancelled',
          checked: order.state === 'cancelled'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: async (data) => {
            if (data && data !== order.state) {
              try {
                order.state = data;
                await this.sqliteOrdersService.updateOrder(order);
                this.showToast(`Estado del pedido #${order.id} actualizado a ${this.getStatusText(data)}`);
              } catch (error) {
                console.error('Error updating order status:', error);
                this.showToast('Error al actualizar el estado del pedido');
              }
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async editCustomer(order: any) {
    const alert = await this.alertController.create({
      header: 'Editar Información del Cliente',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Nombre',
          value: order.customer.name
        },
        {
          name: 'lastName',
          type: 'text',
          placeholder: 'Apellido',
          value: order.customer.lastName
        },
        {
          name: 'email',
          type: 'email',
          placeholder: 'Email',
          value: order.customer.email
        },
        {
          name: 'cellphone',
          type: 'tel',
          placeholder: 'Teléfono',
          value: order.customer.cellphone
        },
        {
          name: 'address',
          type: 'text',
          placeholder: 'Dirección',
          value: order.customer.address
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: async (data) => {
            try {
              if (data.name) order.customer.name = data.name;
              if (data.lastName) order.customer.lastName = data.lastName;
              if (data.email) order.customer.email = data.email;
              if (data.cellphone) order.customer.cellphone = data.cellphone;
              if (data.address) order.customer.address = data.address;

              await this.sqliteOrdersService.updateOrder(order);
              this.showToast(`Información del cliente actualizada para el pedido #${order.id}`);
            } catch (error) {
              console.error('Error updating customer info:', error);
              this.showToast('Error al actualizar la información del cliente');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async editOrderDetails(order: any) {
    const totalInCents = order.totalAmount;
    const totalInPesos = this.toShowMoney(totalInCents);

    const alert = await this.alertController.create({
      header: 'Editar Detalles del Pedido',
      inputs: [
        {
          name: 'type',
          type: 'text',
          placeholder: 'Tipo de pedido',
          value: order.type
        },
        {
          name: 'totalAmount',
          type: 'number',
          placeholder: 'Monto total',
          value: totalInPesos
        },
        {
          name: 'deliveryAmount',
          type: 'number',
          placeholder: 'Costo de envío',
          value: order.deliveryAmount
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: async (data) => {
            try {
              if (data.type) order.type = data.type;
              if (data.totalAmount) order.totalAmount = parseFloat(data.totalAmount);
              if (data.deliveryAmount) order.deliveryAmount = parseFloat(data.deliveryAmount);

              await this.sqliteOrdersService.updateOrder(order);
              this.showToast(`Detalles del pedido #${order.id} actualizados`);
            } catch (error) {
              console.error('Error updating order details:', error);
              this.showToast('Error al actualizar los detalles del pedido');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async showToast(message: string) {


    // You could also show an alert as a simple notification
    const alert = await this.alertController.create({
      message: message,
      buttons: ['OK']
    });

    await alert.present();

    // Auto dismiss after 2 seconds
    setTimeout(() => {
      alert.dismiss();
    }, 2000);
  }

  addNewOrder() {
    this.orderEditDataService.clearOrder();
    this.router.navigate(['add-order']);
  }

  async sendOrder(order: BasketOrder) {
    const alert = await this.alertController.create({
      header: 'Enviar Pedido',
      message: `¿Está seguro de que desea enviar el pedido #${order.id}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Enviar',
          handler: () => {
            // Implement send logic here
            this.saveOrder(order);
            this.showToast(`Pedido #${order.id} enviado (funcionalidad pendiente)`);
          }
        }
      ]
    });
    await alert.present();
  }

  async saveOrder(order: BasketOrder) {

    console.log(order)

    const loading = await this.loadingController.create({
      message: 'Guardando pedido...',
    });
    await loading.present();

    const cart: Carrito = {
      ...new Carrito(),
      listadoArticulos: order.items.map(item => ({
        ...item,
        unitPrice: toLong(item.unitPrice * 100),
      })),
      user: this.authService.getIdentity() || null,
      customer: order.customer,
      customerDelivery: order.customerDelivery,
      branch: order.branch,
      deliveryAmount: order.deliveryAmount,
      observation: order.observation,
      state: this.status_Pending
    }
    this.basketService.makeOrder(cart).subscribe({
      next: async () => {
        await loading.dismiss();
        try {
          if (order.id) {
            await this.sqliteOrdersService.deleteOrder(order.id);
            this.orders = await this.sqliteOrdersService.getOrders();
            this.orderResponse.rows = this.orders;
            this.showToast(`Pedido #${order.id} guardado y eliminado localmente.`);
          } else {
            this.showToast('Pedido guardado, pero no se pudo eliminar localmente por falta de ID.');
          }
        } catch (error) {
          console.error('Error deleting order from SQLite:', error);
          this.showToast('Pedido guardado, pero hubo un error al eliminarlo localmente.');
        }
      },
      error: async (err) => {
        await loading.dismiss();
        this.showToast(`Error al guardar el pedido`);
      }
    })
  }
}
