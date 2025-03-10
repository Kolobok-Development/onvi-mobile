import { IAmount } from '@a2seven/yoo-checkout';

export class ReciptDto {
  phone: string;
  items: Item[];
}

export class Item {
  description: string;
  amount: IAmount;
  quantity: string;
  vat_code: number;
  payment_subject: string;
  payment_mode: string;
}
