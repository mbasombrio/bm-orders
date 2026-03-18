import { Branch } from './branch';
import { User } from './user';

export const ivaSituationConsumidorFinal = 'CONSUMIDOR_FINAL';
export class Customer {
	id?: number | null;
	dni?: string | null;
	name?: string | null;
	lastName?: string | null;
	email?: string | null;
	cellphone?: string | null;
	address?: string | null;
	zipCode?: string | null;
	city?: string | null;
	checkingAccountEnabled?: boolean | null;
	password?: string | null;
	totalRewardPoints?: number | null;
	listPrice?: number | null;
	user?: User;
	alternativePhone?: string | null;
	district?: string | null;
	state?: string | null;
	preferedContactTime?: string | null;
	enabled?: boolean;
	branch?: Branch;
	saldoFavor?: number;
	userName?: string | null;
	observation?: string | null;
	birthdayDate?: Date | null;
	ivaSituation?: string | null;
  status: string | null;
	ctaCteLimitAmount: number | null;
	customerType?: string | null;


	constructor() {
		this.id = null;
		this.dni = null;
		this.name = null;
		this.lastName = null;
		this.email = null;
		this.cellphone = null;
		this.address = null;
		this.zipCode = null;
		this.city = null;
		this.checkingAccountEnabled = null;
		this.password = '';
		this.totalRewardPoints = null;
		this.listPrice = 1;
		this.user = new User();
		this.alternativePhone = null;
		this.district = null;
		this.state = null;
		this.preferedContactTime = null;
		this.enabled = true;
		this.branch = new Branch();
		this.saldoFavor = 0;
		this.userName = null;
		this.observation = null;
		this.birthdayDate = null;
		this.ivaSituation = ivaSituationConsumidorFinal;
    this.status = null;
		this.ctaCteLimitAmount = null;
		this.customerType = null;
	}
}

export class CustomerFilter {
	public name: string;
	public lastname: string;
	public dni: string;
	public checking_account_enable: boolean;
	public onlyenabled: boolean;
	public birth_month: string;
  public page: number;

	constructor() {
		this.name = '';
		this.lastname = '';
		this.dni = '';
		this.checking_account_enable = false;
		this.onlyenabled = true;
		this.birth_month = 'TODOS';
    this.page = 1;
	}
}
