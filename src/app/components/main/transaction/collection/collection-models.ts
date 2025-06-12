import { OrderModel } from 'src/app/components/main/transaction/orders/order-models';

export interface CollectionModel {
  id: number;
  uuid: string;
 customer:Customer;
  payment_date: string;
  payment_mode_id: number;
  payemnt_type: string;
  collection_number: string;
  collection_amount: number;
  need_to_approve: string;
  objectid: string;
  invoices: OrderModel[];
}

export interface InfoModal {
  id: number;
  name: string;
}
export interface Customer {
  id: number;
  firstname: string;
  lastname: string;
}
