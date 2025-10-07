import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlertController, ToastController } from '@ionic/angular';
import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonHeader, IonIcon, IonMenuButton, IonProgressBar, IonSpinner, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addSharp, alertCircleSharp, businessSharp, checkmarkCircleSharp, informationCircleSharp, peopleSharp } from 'ionicons/icons';
import { Article } from 'src/app/models/article';
import { Branch } from 'src/app/models/branch';
import { Customer } from 'src/app/models/customer';
import { ResponseDTO } from 'src/app/models/response';
import { User } from 'src/app/models/user';
import { ClientsService } from 'src/app/services/clients.service';
import { ItemsService } from 'src/app/services/items.service';
import { SqliteArticlesService } from 'src/app/services/sqlite-articles.service';
import { SqliteClientsService } from 'src/app/services/sqlite-clients.service';
import { SqliteBranchService } from 'src/app/services/sqllite-branch.service';

@Component({
  selector: 'app-articles',
  templateUrl: './articles.page.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonSpinner,
    IonIcon,
    IonProgressBar
  ]
})
export class ArticlesPage {

  isLoading = signal<boolean>(false);
  loadingMessage = signal<string>('Importando artículos...');
  itemsService = inject(ItemsService);
  sqliteArticlesService = inject(SqliteArticlesService);
  sqliteClientsService = inject(SqliteClientsService);
  sqliteBranches = inject(SqliteBranchService);
  clientsService = inject(ClientsService);
  toastController = inject(ToastController);
  alertController = inject(AlertController);

  constructor() {
    addIcons({
      'people-sharp': peopleSharp,
      'information-circle-sharp': informationCircleSharp,
      'add-sharp': addSharp,
      'checkmark-circle-sharp': checkmarkCircleSharp,
      'alert-circle-sharp': alertCircleSharp,
      'business-sharp': businessSharp
    });
  }

  async importClients() {
    this.isLoading.set(true);
    this.loadingMessage.set('Importando clientes...');

    let loadingAlert: HTMLIonAlertElement | null = null;
    try {
      loadingAlert = await this.alertController.create({
        header: 'Importando...',
        message: 'Esta operación puede tardar unos minutos.',
        buttons: []
      });
      await loadingAlert.present();
    } catch (e: any) {
      console.error('Could not create loading alert', e);
    }

    this.clientsService.getCustomers().subscribe({
      next: async (response: ResponseDTO<Customer>) => {
        await loadingAlert?.dismiss();
        console.log('Clients imported successfully:', response.rows);
        this.loadingMessage.set('Guardando clientes en base de datos local...');

        try {
          if (response.rows.length === 0) {
            await this.showSuccessToast(`No se encontraron clientes para importar.`);
            this.isLoading.set(false);
          } else {
            const saveResult = await this.sqliteClientsService.replaceAllClients(response.rows);
            this.isLoading.set(false);
            this.loadingMessage.set('Importando clientes...');

            if (saveResult.errors.length > 0) {
              await this.showWarningAlert(
                'Importación parcial de clientes',
                `${saveResult.success} clientes guardados exitosamente. ${saveResult.errors.length} errores encontrados.`,
                saveResult.errors
              );
            } else {
              await this.showSuccessToast(`Base de datos actualizada: ${saveResult.success} clientes importados exitosamente`);
            }
          }
        } catch (error) {
          this.isLoading.set(false);
          this.loadingMessage.set('Importando clientes...');
          console.error('Error updating clients database:', error);
          await this.showErrorAlert('Error al actualizar base de datos de clientes', error, () => this.importClients());
        }
      },
      error: async (error) => {
        await loadingAlert?.dismiss();
        this.isLoading.set(false);
        this.loadingMessage.set('Importando clientes...');
        console.error('Import error:', error);
        await this.showErrorAlert('Error al importar clientes', error, () => this.importClients());
      }
    });
  }

  async importArticles() {
    this.isLoading.set(true);

    let loadingAlert: HTMLIonAlertElement | null = null;
    try {
      loadingAlert = await this.alertController.create({
        header: 'Importando...',
        message: 'Esta operación puede tardar unos minutos.',
        buttons: []
      });
      await loadingAlert.present();
    } catch (e: any) {
      console.error('Could not create loading alert', e);
    }

    this.itemsService.getArticles().subscribe({
      next: async (response: Article[]) => {
        await loadingAlert?.dismiss();
        console.log('Articles imported successfully:', response);
        this.loadingMessage.set('Guardando artículos en base de datos local...');

        try {
          const saveResult = await this.sqliteArticlesService.replaceAllArticles(response);
          this.isLoading.set(false);
          this.loadingMessage.set('Importando artículos...');

          if (saveResult.errors.length > 0) {
            await this.showWarningAlert(
              'Importación parcial',
              `${saveResult.success} artículos guardados exitosamente. ${saveResult.errors.length} errores encontrados.`,
              saveResult.errors
            );
          } else {
            await this.showSuccessToast(`Base de datos actualizada: ${saveResult.success} artículos importados exitosamente`);
          }
        } catch (error) {
          this.isLoading.set(false);
          this.loadingMessage.set('Importando artículos...');
          console.error('Error updating articles database:', error);
          await this.showErrorAlert('Error al actualizar base de datos', error, () => this.importArticles());
        }
      },
      error: async (error) => {
        await loadingAlert?.dismiss();
        this.isLoading.set(false);
        this.loadingMessage.set('Importando artículos...');
        console.error('Import error:', error);
        await this.showImportErrorAlert(error);
      }
    });
  }

  private async showSuccessToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'top',
      color: 'success',
      icon: 'checkmark-circle-sharp'
    });
    await toast.present();
  }

  private async showErrorAlert(title: string, error: any, retryFunction: () => void) {
    const errorMessage = error?.message || error?.error?.message || 'Error desconocido';
    const alert = await this.alertController.create({
      header: title,
      message: `Se produjo un error: ${errorMessage}`,
      buttons: [
        {
          text: 'Reintentar',
          handler: retryFunction
        },
        {
          text: 'Cerrar',
          role: 'cancel'
        }
      ]
    });
    await alert.present();
  }


  private async showWarningAlert(title: string, message: string, errors: string[]) {
    const errorList = errors.slice(0, 5).join('\n');
    const moreErrors = errors.length > 5 ? `\n... y ${errors.length - 5} errores más` : '';
    const alert = await this.alertController.create({
      header: title,
      message: `${message}\n\nDetalles de errores:\n${errorList}${moreErrors}`,
      buttons: [
        {
          text: 'Ver en consola',
          handler: () => {
            console.warn('Errores de importación:', errors);
          }
        },
        {
          text: 'Aceptar',
          role: 'cancel'
        }
      ]
    });
    await alert.present();
  }

  private async showImportErrorAlert(error: any) {
    const errorMessage = error.message || 'Error desconocido';
    const isTimeoutError = errorMessage.includes('tardó demasiado') || errorMessage.includes('Tiempo de espera');
    const alert = await this.alertController.create({
      header: isTimeoutError ? 'Timeout en la importación' : 'Error de importación',
      message: errorMessage,
      buttons: [
        {
          text: 'Reintentar',
          handler: () => {
            this.importArticles();
          }
        },
        {
          text: 'Importar por lotes',
          handler: () => {
            this.importArticlesPaginated();
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel'
        }
      ]
    });
    await alert.present();
  }

  async importArticlesPaginated() {
    this.isLoading.set(true);
    this.loadingMessage.set('Importando artículos por lotes...');
    try {
      await this.sqliteArticlesService.clearAllArticles();
      let allArticles: Article[] = [];
      let page = 0;
      let hasMore = true;
      while (hasMore) {
        this.loadingMessage.set(`Importando lote ${page + 1}...`);
        try {
          const batch = await this.itemsService.getArticlesPaginated(page, 500).toPromise();
          if (batch && batch.content) {
            allArticles.push(...batch.content);
            hasMore = !batch.last;
            page++;
            await this.sqliteArticlesService.saveMultipleArticles(batch.content);
          } else {
            hasMore = false;
          }
        } catch (batchError) {
          console.error(`Error en lote ${page + 1}:`, batchError);
          hasMore = false;
          if (allArticles.length > 0) {
            await this.showWarningAlert(
              'Importación interrumpida',
              `Se importaron ${allArticles.length} artículos antes del error`,
              [`Error en lote ${page + 1}: ${batchError}`]
            );
          } else {
            await this.showErrorAlert('Error en importación por lotes', batchError, () => this.importArticlesPaginated());
          }
        }
      }
      this.isLoading.set(false);
      this.loadingMessage.set('Importando artículos...');
      if (allArticles.length > 0) {
        await this.showSuccessToast(`Importación por lotes completada: ${allArticles.length} artículos importados`);
      }
    } catch (error) {
      this.isLoading.set(false);
      this.loadingMessage.set('Importando artículos...');
      console.error('Error in paginated import:', error);
      await this.showErrorAlert('Error en importación por lotes', error, () => this.importArticlesPaginated());
    }
  }

  async recreateDatabase() {
    const alert = await this.alertController.create({
      header: 'Recrear Base de Datos',
      message: 'Esto eliminará todos los artículos guardados localmente y recreará la estructura de la base de datos. ¿Continuar?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Recrear',
          handler: async () => {
            this.isLoading.set(true);
            this.loadingMessage.set('Recreando base de datos...');
            try {
              await this.sqliteArticlesService.recreateDatabase();
              this.isLoading.set(false);
              this.loadingMessage.set('Importando artículos...');
              await this.showSuccessToast('Base de datos recreada exitosamente');
            } catch (error) {
              this.isLoading.set(false);
              this.loadingMessage.set('Importando artículos...');
              console.error('Error recreating database:', error);
              await this.showErrorAlert('Error al recrear base de datos', error, () => this.recreateDatabase());
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async importBranches() {
    this.isLoading.set(true);
    this.loadingMessage.set('Importando sucursales...');
    try {
      const { StorageService } = await import('src/app/services/storage.service');
      const storage = inject(StorageService);

      const user = await storage.get('identity');
      if (user) {
        const identity: User = typeof user === 'string' ? JSON.parse(user) : user;
        const branches: Branch[] = identity.branches;
        const saveResult = await this.sqliteBranches.replaceAllbranches(branches);
        this.isLoading.set(false);
        this.loadingMessage.set('Importando clientes...');

        if (saveResult.errors.length > 0) {
          await this.showWarningAlert(
            'Importación parcial de sucursales',
            `${saveResult.success} sucursales guardados exitosamente. ${saveResult.errors.length} errores encontrados.`,
            saveResult.errors
          );
        } else {
          await this.showSuccessToast(`Base de datos actualizada: ${saveResult.success} sucursales importados exitosamente`);
        }

      } else {
        const alert = await this.alertController.create({
          header: "Error",
          message: `No se encontraron sucursales para el usuario`,
          buttons: [
            {
              text: 'Cerrar',
              role: 'cancel'
            }
          ]
        });
        await alert.present();
      }
      this.isLoading.set(false);

    } catch (error) {
      this.isLoading.set(false);
      this.loadingMessage.set('Importando sucursales...');
      console.error('Error updating sucursales:', error);
      await this.showErrorAlert('Error al actualizar datos de sucursales', error, () => this.importBranches());
    }


  }


}
