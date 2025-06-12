import { ApiOrderDetails, ApiOrderCustomerInfo, OrderItemsPayload } from 'src/app/components/main/transaction/orders/order-models';
import { UserInfo } from 'os';



export interface ApiDeliveryModel {
  "id": number;
  "uuid": string;
  "organisation_id": number;
  "customer_id": number;
  "depot_id": null;
  "order_type_id": number;
  "order_number": string;
  "order_date": string;
  "due_date": string;
  "delivery_date": string;
  "payment_term_id": number;
  "total_qty": string;
  "total_discount_amount": string;
  "total_vat": string;
  "total_net": string;
  "total_excise": string;
  "grand_total": string;
  "any_comment": string;
  "current_stage": string;
  "current_stage_comment": string;
  "sign_image": string;
  "source": number;
  "status": number;
  "created_at": string;
  "updated_at": string;
  "deleted_at": string;
  "order_type": {
    "id": number;
    "name": string;
    "description": string;
  };
  "payment_term": {
    "id": number;
    "name": string;
    "number_of_days": number;
  };
  "order_details": ApiOrderDetails[];
  "customer_info": ApiOrderCustomerInfo;
  "depot": {
    id: number;
    name: string;
  };
}

export interface DeliveryModel {
  approval_status: string;
  depot: boolean | null;
  delivery_type?: number;
  lob: any;
  lob_id: any;
  customer?: UserInfos;
  salesman?: SalesManInfo,
  delivery_due_date?: string | null;
  created_at: string;
  current_stage: string;
  current_stage_comment: string;
  customer_id: number;
  open_qty?: string;
  delivery_status?: string;
  customer_info: customerInfo;
  deleted_at: string;
  delivery_date: string;
  delivery_details: DeliveryDetails[];
  delivery_number: number;
  delivery_weight: number;
  grand_total: number;
  id: number;
  invoice?: {};
  storageocation?: any;
  order: OrderDetails;
  order_id: number;
  organisation: {
    id: number;
    org_name: string;
  };
  organisation_id: number;
  payment_term: string;
  payment_term_id: number;
  salesman_id: number;
  salesman_info: SalesManInfo;
  source: number;
  status: number;
  need_to_approve: string;
  objectid: string;
  total_discount_amount: number;
  total_excise: number;
  total_gross: number;
  total_net: number;
  total_qty: number;
  total_vat: number;
  updated_at: string;
  uuid: string;
}

export interface customerInfo {
  customer_id: number;
  customer_name: string;
  balance: number;
  bill_to_payer: number;
  channel_id: number;
  created_at: string | null;
  credit_days: number;
  credit_limit: number;
  current_stage: string;
  current_stage_comment: string | null;
  customer_address_1: string;
  customer_address_2: string;
  customer_category_id: number;
  customer_city: string;
  customer_code: string;
  customer_group_id: number;
  customer_phone: string;
  customer_state: string;
  customer_type_id: number;
  customer_zipcode: string;
  deleted_at: string | null;
  id: number;
  organisation_id: number;
  payer: number;
  region_id: number;
  route_id: number;
  sales_organisation_id: number;
  ship_to_party: number;
  sold_to_party: number;
  status: boolean;
  updated_at: string | null;
  user: UserInfos;
  user_id: number;
  uuid: string;
}

export interface UserInfos {
  api_token: string;
  country_id: number;
  created_at: string | null;
  deleted_at: string | null;
  email: string;
  email_verified_at: number;
  firstname: string;
  display_name?: string;
  id: number;
  is_approved_by_admin: boolean;
  lastname: string;
  mobile: string;
  organisation_id: number;
  parent_id: number;
  role_id: number;
  status: boolean;
  updated_at: string | null;
  usertype: number;
  uuid: string;
}
export interface DeliveryDetails {
  batch_number: number;
  created_at: string | Date;
  deleted_at: null;
  delivery_id: number;
  discount_id: number;
  id: number;
  is_free: boolean;
  is_item_poi: boolean;
  item_discount_amount: number;
  item_excise: number;
  item_grand_total: number;
  item_gross: number;
  item_id: number;
  item_net: number;
  item_price: number;
  item_qty: number;
  item_uom_id: number;
  item_vat: number;
  promotion_id: number;
  updated_at: string;
  uuid: string
}

export interface OrderDetails {
  any_comment: string;
  created_at: string;
  current_stage: string;
  current_stage_comment: string;
  customer_id: number;
  deleted_at: string;
  delivery_date: string;
  depot_id: number | null;
  due_date: string;
  grand_total: number;
  id: number;
  order_date: string;
  order_number: string;
  order_type_id: number;
  organisation_id: number;
  payment_term_id: number;
  sign_image: string;
  source: number;
  status: string;
  total_discount_amount: number;
  total_excise: number;
  total_gross: number;
  total_net: number;
  total_qty: number;
  total_vat: number;
  updated_at: string;
  uuid: string;
};

export interface SalesManInfo {
  api_token: string;
  country_id: number;
  created_at: string | null;
  deleted_at: string | null;
  email: string;
  email_verified_at: string;
  firstname: string;
  id: number;
  is_approved_by_admin: number;
  lastname: string;
  mobile: string;
  organisation_id: number;
  parent_id: number | null;
  role_id: number;
  status: number;
  updated_at: string;
  usertype: number;
  uuid: string;
}