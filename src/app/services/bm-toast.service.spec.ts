import { TestBed } from '@angular/core/testing';
import { BmToastService } from './bm-toast.service';
import { ToastController } from '@ionic/angular';

describe('BmToastService', () => {
  let service: BmToastService;
  let toastControllerSpy: jasmine.SpyObj<ToastController>;
  let mockToast: jasmine.SpyObj<HTMLIonToastElement>;

  beforeEach(() => {
    mockToast = jasmine.createSpyObj('HTMLIonToastElement', ['present']);
    mockToast.present.and.resolveTo();

    toastControllerSpy = jasmine.createSpyObj('ToastController', ['create']);
    toastControllerSpy.create.and.resolveTo(mockToast);

    TestBed.configureTestingModule({
      providers: [
        BmToastService,
        { provide: ToastController, useValue: toastControllerSpy },
      ]
    });
    service = TestBed.inject(BmToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('success', () => {
    it('should create toast with success config', async () => {
      await service.success('Operacion exitosa');

      expect(toastControllerSpy.create).toHaveBeenCalledWith(
        jasmine.objectContaining({
          message: 'Operacion exitosa',
          icon: 'checkmark-outline',
          cssClass: 'bm-toast bm-toast-success',
          position: 'bottom',
          duration: 3500,
        })
      );
      expect(mockToast.present).toHaveBeenCalled();
    });
  });

  describe('error', () => {
    it('should create toast with error config', async () => {
      await service.error('Algo salio mal');

      expect(toastControllerSpy.create).toHaveBeenCalledWith(
        jasmine.objectContaining({
          message: 'Algo salio mal',
          icon: 'close-outline',
          cssClass: 'bm-toast bm-toast-error',
        })
      );
      expect(mockToast.present).toHaveBeenCalled();
    });
  });

  describe('warning', () => {
    it('should create toast with warning config', async () => {
      await service.warning('Cuidado');

      expect(toastControllerSpy.create).toHaveBeenCalledWith(
        jasmine.objectContaining({
          message: 'Cuidado',
          icon: 'warning-outline',
          cssClass: 'bm-toast bm-toast-warning',
        })
      );
      expect(mockToast.present).toHaveBeenCalled();
    });
  });
});
