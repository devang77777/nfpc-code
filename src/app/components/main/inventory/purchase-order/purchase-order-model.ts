import { ApiOrderDetails, OrderItemsPayload } from '../../transaction/orders/order-models';



export interface ApiPurchaseOrderModel {
  "id": number;
  "uuid": string;
  "organisation_id": number;
  "vendor_id": number;
  "depot_id": null;
  "order_type_id": number;
  "purchase_order_number": string;
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
  "reference_number": string;
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
  "vendor_info": ApiPurchaseOrderCustomerInfo;
  "depot": {
    id: number;
    name: string;
  };
}

export interface ApiPurchaseOrderCustomerInfo {
  id: number;
  vendor_id: number;
  user: {
    id: number;
    firstname: string;
    lastname: string;
    display_name: string;
  };
}

export interface PurchaseOrderModel {
  id: number;
  uuid: string;
  order_type_id: number;
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
  vendor: {
   id: number;
    vendor_name: string;
  };
  status: number;
  reference_number: string;
  current_stage: string;
  current_stage_comment: string;
  approval_status: number;
  customer_note: string;
  order_date: string;
  delivery_date: string;
  due_date: string;
  purchase_order_number: string;
  gross_total: number;
  total_vat: number;
  total_excise: number;
  total_net: number;
  total_discount_amount: number;
  grand_total: number;
  items: OrderItemsPayload[];
  purchase_order_date:string;
  expected_delivery_date:string
}

export function apiPurchaseOrderMapper(order: ApiPurchaseOrderModel): PurchaseOrderModel {
  const items: OrderItemsPayload[] = order.order_details.map(apiItem => {
    const newItem: OrderItemsPayload = {
      item: {
        id: apiItem.item.id,
        name: apiItem.item.item_name
      },
      item_id: apiItem.item.id,
      item_qty: apiItem.item_qty,
      item_uom_id: apiItem.item_uom.id.toString(),
      uom_info: apiItem.item_uom,
      item_price: Number(apiItem.item_price),
      item_discount_amount: Number(apiItem.item_discount_amount),
      item_vat: Number(apiItem.item_vat),
      item_excise: Number(apiItem.item_excise),
      item_grand_total: Number(apiItem.item_grand_total),
      item_net: Number(apiItem.item_net),
      discount_id: apiItem.discount_id,
      is_free: Boolean(apiItem.is_free),
      is_item_poi: Boolean(apiItem.is_item_poi),
      item_gross: Number(apiItem.item_gross)
    };

    return newItem;
  });

  const newOrder: PurchaseOrderModel = {
    id: order.id,
    uuid: order.uuid,
    order_type_id: order.order_type_id,
    order_type_info: order.order_type,
    payment_term_id: order.payment_term_id,
    payment_term_info: order.payment_term,
    vendor: order.id ? {
      id: order.id,
      vendor_name: order.vendor_info ? order.vendor_info.user.display_name : 'Unknown'
    } : undefined,
    reference_number: order.reference_number,
    status: order.status,
    current_stage: order.current_stage,
    current_stage_comment: order.current_stage_comment,
    approval_status: 0,
    customer_note: order.any_comment,
    order_date: order.order_date,
    purchase_order_number: order.purchase_order_number,
    delivery_date: order.delivery_date,
    due_date: order.due_date,
    gross_total: Number(order.grand_total),
    total_vat: Number(order.total_vat),
    total_excise: Number(order.total_excise),
    total_net: Number(order.total_net),
    total_discount_amount: Number(order.total_discount_amount),
    grand_total: Number(order.grand_total),
     purchase_order_date: order.order_date,
     expected_delivery_date: order.delivery_date,
    items

  };

  return newOrder;
}
