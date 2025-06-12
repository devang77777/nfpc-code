
import { ApiOrderCustomerInfo } from 'src/app/components/main/transaction/orders/order-models';



export interface ApiGrnModel {
  "id": number;
  "uuid": string;
  "organisation_id": number;
  "customer_id": number;
  "depot_id": null;
  "order_type_id": number;
  "grn_number": string;
  "grn_date": string;
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
  "grn_remark": string;
  "current_stage": string;
  "current_stage_comment": string;
  "sign_image": string;
  "source": number;
  "status": string
  "created_at": string;
  "updated_at": string;
  "deleted_at": string;
  source_warehouse: {

    id: number,
    name: string
  };
  destination_warehouse: {

    id: number;
    name: string;

  };
  "salesman"?: {
    "id": number;
    "name": string;
  };
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
  "order_details": ApiGrnDetails[];
  "customer_info": ApiOrderCustomerInfo;
  "depot": {
    id: number;
    name: string;
  };
}

export interface ApiGrnDetails {
  "id": number;
  "uuid": string;
  "order_id": number;
  "item_id": number;
  "item_uom_id": number;
  "discount_id": number;
  "is_free": number;
  "is_item_poi": number;
  "promotion_id": number;
  "item_qty": string;
  "item_code": string;
  "item_price": string;
  "item_discount_amount": string;
  "item_vat": string;
  "item_net": string;
  "item_excise": string;
  "item_grand_total": string;
  "created_at": string;
  "updated_at": string;
  "deleted_at": string;

  "item": {
    "id": number;
    "item_code": string;
    "item_name": string;
  };
  "item_uom": {
    "id": number;
    "name": string;
    "code": string;
  };
}

export interface GrnModel {
  id: number;
  uuid: string;
  order_type_id: number;
  goodreceiptnotedetail?: string;
  order_type_info?: {
    "id": number;
    "name": string;
    "description": string;
  };
  payment_term_id: number;
  payment_term_info?: {
    "id": number;
    "name": string;
    "number_of_days": number;
  };
  customer: {
    customer_id: number;
    customer_name: string;
  };
  depot: {
    depot_id: number;
    depot_name: string;
  };
  salesman?: {
    salesman_id: number;
    salesman_name: string;
  };
  source_warehouse: {
    id: number;
    name: string

  };
  destination_warehouse: {
    id: number
    name: string

  };
  status: string;
  current_stage: string;
  grn_remark: string;
  current_stage_comment: string;
  approval_status: number;
  customer_note: string;
  grn_date: string;
  grn_number: string;
  delivery_date: string;
  due_date: string;
  gross_total: number;
  total_vat: number;
  total_excise: number;
  total_net: number;
  total_discount_amount: number;
  grand_total: number;
  items: GrnItemsPayload[];
  need_to_approve?: string;
  objectid?: string
}

export interface GrnItemsPayload {
  item: {
    id: number;
    name: string;
    item_code: string;
  };
  id?: number;
  item_qty: string;
  item_uom_id: string;
  item_code: string;
  reason?: string;
  reason_id?: string;
  reason_type?: string;
  discount_id?: number;
  promotion_id?: number;
  is_free?: boolean;
  is_item_poi?: boolean;
  return_reason_id?: number;
  item_id?: number;
  original_item_qty?: string;
  uom_info?: {
    "id": number;
    "name": string;
    "code": string;
  };
  returnReason?: string;
}

export function apiGrnMapper(order: ApiGrnModel): GrnModel {
  const items: GrnItemsPayload[] = order.order_details.map(apiItem => {
    const newItem: GrnItemsPayload = {
      item: {
        id: apiItem.item.id,
        name: apiItem.item.item_name,
        item_code: apiItem.item.item_code
      },
      item_id: apiItem.item.id,
      item_qty: apiItem.item_qty,
      item_code: apiItem.item_code,
      item_uom_id: apiItem.item_uom.id.toString(),
      uom_info: apiItem.item_uom,
      discount_id: apiItem.discount_id,
      is_free: Boolean(apiItem.is_free),
      is_item_poi: Boolean(apiItem.is_item_poi)
    };

    return newItem;
  });

  const newOrder: GrnModel = {
    id: order.id,
    uuid: order.uuid,
    order_type_id: order.order_type_id,
    order_type_info: order.order_type,
    payment_term_id: order.payment_term_id,
    payment_term_info: order.payment_term,
    customer: order.customer_id ? {
      customer_id: order.customer_id,
      customer_name: order.customer_info ? order.customer_info.user.display_name : 'Unknown'
    } : undefined,
    depot: order.depot ? {
      depot_id: order.depot_id,
      depot_name: order.depot ? order.depot.name : 'Unknown'
    } : undefined,
    salesman: order.salesman ? {
      salesman_id: order.salesman.id,
      salesman_name: order.salesman ? order.salesman.name : ''
    } : null,
    source_warehouse: {

      id: order.source_warehouse.id,
      name: order.source_warehouse.name

    },
    destination_warehouse: {

      id: order.destination_warehouse.id,
      name: order.destination_warehouse.name

    },
    status: order.status,
    grn_remark: order.grn_remark,
    current_stage: order.current_stage,
    current_stage_comment: order.current_stage_comment,
    approval_status: 0,
    customer_note: order.any_comment,
    grn_date: order.grn_date,
    grn_number: order.grn_number,
    delivery_date: order.delivery_date,
    due_date: order.due_date,
    gross_total: Number(order.grand_total),
    total_vat: Number(order.total_vat),
    total_excise: Number(order.total_excise),
    total_net: Number(order.total_net),
    total_discount_amount: Number(order.total_discount_amount),
    grand_total: Number(order.grand_total),
    items
  };

  return newOrder;
}
