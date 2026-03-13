import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { checkmarkOutline, closeOutline, warningOutline } from 'ionicons/icons';

@Injectable({ providedIn: 'root' })
export class BmToastService {

  constructor(private toastController: ToastController) {
    addIcons({ checkmarkOutline, closeOutline, warningOutline });
  }

  async success(message: string) {
    await this.show(message, 'checkmark-outline', 'bm-toast-success');
  }

  async error(message: string) {
    await this.show(message, 'close-outline', 'bm-toast-error');
  }

  async warning(message: string) {
    await this.show(message, 'warning-outline', 'bm-toast-warning');
  }

  private async show(message: string, icon: string, typeClass: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3500,
      position: 'bottom',
      icon,
      cssClass: `bm-toast ${typeClass}`
    });
    await toast.present();
  }
}
