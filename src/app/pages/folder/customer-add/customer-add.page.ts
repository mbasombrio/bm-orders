import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel,
  IonInput, IonButton, IonSelect, IonSelectOption, IonSpinner, IonGrid,
  IonRow, IonCol, IonIcon, IonBackButton, IonTextarea, IonNote, IonFooter,
  AlertController, NavController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkOutline, arrowBackOutline } from 'ionicons/icons';
import { Customer } from 'src/app/models/customer';
import { Branch } from 'src/app/models/branch';
import { ClientsService } from 'src/app/services/clients.service';
import { SqliteClientsService } from 'src/app/services/sqlite-clients.service';
import { AuthService } from 'src/app/services/auth.service';
import { BmToastService } from 'src/app/services/bm-toast.service';

@Component({
  selector: 'app-customer-add',
  templateUrl: './customer-add.page.html',
  styleUrls: ['./customer-add.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonFooter,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel,
    IonInput, IonButton, IonSelect, IonSelectOption, IonSpinner, IonGrid,
    IonRow, IonCol, IonIcon, IonBackButton, IonTextarea, IonNote,
    CommonModule, FormsModule, ReactiveFormsModule
  ]
})
export class CustomerAddPage implements OnInit {
  customer = signal<Customer>(new Customer());
  loading = signal<boolean>(false);
  branches = signal<Branch[]>([]);
  title = signal<string>('Nuevo Cliente');
  isEdit = signal<boolean>(false);

  customerForm: FormGroup = this.initForm();
  ivaOptions: string[] = [];

  constructor(
    public clientsService: ClientsService,
    private sqliteClientsService: SqliteClientsService,
    private authService: AuthService,
    private navController: NavController,
    private activatedRoute: ActivatedRoute,
    private alertController: AlertController,
    private bmToast: BmToastService
  ) {
    addIcons({ checkmarkOutline, arrowBackOutline });
    this.ivaOptions = Object.keys(this.clientsService.ivaSituation);
  }

  async ngOnInit() {
    this.loading.set(true);

    // Load user branches
    const user = await this.authService.getIdentity();
    if (user?.branches && user.branches.length > 0) {
      this.branches.set(user.branches);
    }

    // Check if editing
    const id = this.activatedRoute.snapshot.params['id'];
    if (id) {
      this.title.set('Editar Cliente');
      this.isEdit.set(true);
      this.loadCustomer(Number(id));
    } else {
      this.loading.set(false);
    }
  }

  loadCustomer(id: number) {
    this.clientsService.getCustomerById(id).subscribe({
      next: (customer) => {
        this.customer.set({ ...customer });
        this.customerForm = this.initForm();
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.showToast('Cliente no encontrado', 'danger');
        this.navController.navigateBack('/customers');
      }
    });
  }

  initForm(): FormGroup {
    const c = { ...this.customer() };
    return new FormGroup({
      name: new FormControl(c.name || null, Validators.required),
      lastName: new FormControl(c.lastName || null),
      dni: new FormControl(c.dni || null, Validators.required),
      email: new FormControl(c.email || null),
      cellphone: new FormControl(c.cellphone || null),
      address: new FormControl(c.address || null),
      zipCode: new FormControl(c.zipCode || null),
      district: new FormControl(c.district || null),
      city: new FormControl(c.city || null),
      state: new FormControl(c.state || null),
      branch: new FormControl(c.branch ? c.branch.id : 0),
      listPrice: new FormControl(`${c.listPrice}` || '1'),
      ivaSituation: new FormControl(c.ivaSituation || 'CONSUMIDOR_FINAL'),
      observation: new FormControl(c.observation || null),
      customerType: new FormControl(c.customerType || 'MINORISTA'),
      checkingAccountEnabled: new FormControl(c.checkingAccountEnabled || false),
      ctaCteLimitAmount: new FormControl(c.ctaCteLimitAmount || null),
      userName: new FormControl(c.userName || null, this.conditionalRequired),
      password: new FormControl(c.password || null, [this.conditionalRequired, Validators.minLength(4)]),
    }, { validators: this.validateUserNameAndPassword });
  }

  prepareCustomer() {
    const current = { ...this.customer() };
    const f = this.customerForm.value;

    current.name = f.name;
    current.lastName = f.lastName;
    current.dni = f.dni;
    current.email = f.email;
    current.cellphone = f.cellphone;
    current.address = f.address;
    current.zipCode = f.zipCode;
    current.district = f.district;
    current.city = f.city;
    current.state = f.state;
    if (current.branch) {
      current.branch.id = f.branch;
    }
    current.listPrice = Number(f.listPrice);
    current.ivaSituation = f.ivaSituation;
    current.observation = f.observation;
    current.customerType = f.customerType;
    current.checkingAccountEnabled = f.checkingAccountEnabled;
    current.ctaCteLimitAmount = f.ctaCteLimitAmount;
    current.userName = f.userName;
    current.password = f.password;
    current.enabled = true;

    this.customer.set(current);
  }

  trySave() {
    this.customerForm.markAllAsTouched();

    if (this.customerForm.invalid) {
      this.showToast('Por favor complete todos los campos requeridos', 'warning');
      return;
    }

    this.loading.set(true);
    const userName = this.customerForm.get('userName')?.value;

    if (!userName) {
      this.saving();
      return;
    }

    // Check username uniqueness
    const queryCustomer = { ...new Customer(), userName: userName };
    this.clientsService.searchCustomers('0', queryCustomer).subscribe({
      next: (result) => {
        const rows = result.rows.filter(c => c.id !== this.customer().id);
        if (rows.length > 0) {
          this.loading.set(false);
          this.showToast(`El usuario "${userName}" no está disponible`, 'danger');
        } else {
          this.saving();
        }
      },
      error: () => {
        this.saving();
      }
    });
  }

  saving() {
    if (this.customer().id) {
      this.update();
    } else {
      this.add();
    }
  }

  add() {
    this.prepareCustomer();
    this.clientsService.saveCustomer(this.customer()).subscribe({
      next: async (savedCustomer: any) => {
        const customerToStore = savedCustomer || this.customer();
        await this.sqliteClientsService.saveCustomer(customerToStore);
        await this.showAlert('Cliente creado correctamente');
        this.navController.navigateBack('/customers');
      },
      error: (error) => this.showError(error)
    });
  }

  update() {
    this.prepareCustomer();
    this.clientsService.updateCustomer(this.customer()).subscribe({
      next: async (updatedCustomer: any) => {
        const customerToStore = updatedCustomer || this.customer();
        await this.sqliteClientsService.saveCustomer(customerToStore);
        await this.showAlert('Cliente actualizado correctamente');
        this.navController.navigateBack('/customers');
      },
      error: (error) => this.showError(error)
    });
  }

  async showError(error: any) {
    this.loading.set(false);
    const message = error?.message?.includes('409') || error?.status === 409
      ? 'DNI/CUIT existente'
      : 'Ha ocurrido un error al procesar la solicitud';
    await this.showToast(message, 'danger');
  }

  conditionalRequired(control: AbstractControl) {
    if (!control.value) return null;
    return (control.value && control.value.trim() !== '') ? null : { required: true };
  }

  validateUserNameAndPassword(c: AbstractControl): ValidationErrors | null {
    const userName = c.get('userName')?.value;
    const password = c.get('password')?.value;
    if ((userName && !password) || (!userName && password)) {
      return { passwordAndUserNameMismatch: true };
    }
    return null;
  }

  private async showToast(message: string, type: 'success' | 'warning' | 'danger') {
    if (type === 'danger') await this.bmToast.error(message);
    else if (type === 'warning') await this.bmToast.warning(message);
    else await this.bmToast.success(message);
  }

  private async showAlert(message: string) {
    await this.bmToast.success(message);
  }
}
