import { Injectable, inject } from '@angular/core';
import { ToastController, AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class PwaService {
  private promptEvent: any;
  private toastController = inject(ToastController);
  private alertController = inject(AlertController);

  constructor() {
    window.addEventListener('beforeinstallprompt', (event: any) => {
      event.preventDefault();
      this.promptEvent = event;
    });
  }

  private isIos(): boolean {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent);
  }

  private isInStandaloneMode(): boolean {
    return ('standalone' in window.navigator) && (window.navigator as any).standalone;
  }

  public async install(): Promise<void> {
    if (this.isInStandaloneMode()) {
      const toast = await this.toastController.create({
        message: 'La aplicación ya está instalada',
        duration: 3000,
        position: 'bottom',
        color: 'primary'
      });
      await toast.present();
      return;
    }

    if (this.isIos()) {
      await this.showIosInstallInstructions();
      return;
    }

    if (this.promptEvent) {
      this.promptEvent.prompt();
      this.promptEvent.userChoice.then(async (choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('Usuario aceptó la instalación');
        } else {
          console.log('Usuario rechazó la instalación');
        }
        this.promptEvent = null;
      });
    } else {
      const toast = await this.toastController.create({
        message: 'La instalación no está disponible en este navegador o la app ya está instalada',
        duration: 4000,
        position: 'bottom',
        color: 'warning'
      });
      await toast.present();
    }
  }

  private async showIosInstallInstructions(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Instalar App',
      message: `
        <p>Para instalar esta aplicación en tu iPhone/iPad:</p>
        <ol style="text-align: left; padding-left: 20px;">
          <li>Toca el botón de compartir <ion-icon name="share-outline"></ion-icon></li>
          <li>Desplázate y selecciona "Añadir a pantalla de inicio"</li>
          <li>Toca "Añadir" en la esquina superior derecha</li>
        </ol>
      `,
      buttons: ['Entendido']
    });
    await alert.present();
  }

  public canInstall(): boolean {
    return true;
  }
}
