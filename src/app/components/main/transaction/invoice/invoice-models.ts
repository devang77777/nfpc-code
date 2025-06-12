import { OrderItemsPayload, OrderModel } from 'src/app/components/main/transaction/orders/order-models';
import { customerInfo } from '../delivery/delivery-model';

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
  customer?: any;
  customerObj?: any;
  user?: any;
  salesman_user?: any;
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
  "salesman"?: {
    "id": number;
    "name": string;
    "firstname": string;
    "lastname": string;
  };
  "customer_info"?: customerInfo;
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
  "delivery_details": ApiDeliveryDetails[];
  "depot": {
    id: number;
    depot_name: string;
  };

  storage_location_id?: number
}

interface ApiDeliveryDetails {
  batch_number: number | null;
  created_at: string | null;
  deleted_at: string | null;
  delivery_id: number;
  discount_id: number | null;
  id: number;
  is_free: boolean;
  is_item_poi: boolean;
  item: ApiDeliveryDetailsItems[];
  item_discount_amount: number;
  item_excise: number;
  item_grand_total: number;
  item_gross: number;
  item_id: number;
  item_net: number;
  item_price: number;
  item_qty: number;
  item_uom: ApiDeliveryDetailsItemsUoms[];
  item_uom_id: number;
  item_vat: number;
  promotion_id: number | null;
  updated_at: string | null;
  uuid: string;
}

interface ApiDeliveryDetailsItems {
  brand_id: number;
  created_at: string | null;
  current_stage: string;
  current_stage_comment: string;
  deleted_at: string | null;
  id: number;
  is_tax_apply: boolean;
  item_barcode: string;
  item_code: string;
  item_description: string;
  item_excise: number;
  item_group_id: number;
  item_major_category_id: number;
  item_name: string;
  item_shelf_life: number;
  item_vat_percentage: number;
  item_weight: number;
  lower_unit_item_price: number;
  lower_unit_item_upc: number;
  lower_unit_uom_id: number;
  organisation_id: number;
  status: number;
  stock_keeping_unit: boolean;
  updated_at: string;
  uuid: string;
};

interface ApiDeliveryDetailsItemsUoms {
  code: string;
  created_at: string;
  deleted_at: string;
  id: number;
  name: string;
  organisation_id: number;
  status: boolean;
  updated_at: string;
  uuid: string;
}

export interface InvoiceModel {
  id: number;
  uuid: string;
  order_type_id: number;
  payment_term_id: number;
  customer: {
    customer_id: number;
    customer_name: string;
  };
  depot: {
    depot_id: number;
    depot_name: string;
  };
  items: OrderItemsPayload[];
  status: string;
  customer_note: string;
  description: string;
  due_date: string;
  order_number: string;
  gross_total: number;
  invoice_total: number;
  vat: number;
  excise: number;
  net_total: number;
  discount: number;
  user?: {
    firstname: string,
    id: number,
    lastname: string,
    parent_id: number
  },
  invoice_date: string;
};

export interface InvoiceAPIPayload {
  "customer_id": number;
  "order_id": number;
  "order_type_id": number;
  "delivery_id": number;
  "invoice_type": number;
  "invoice_number": string;
  "invoice_date": string | null;
  "payment_term_id": number;
  "invoice_due_date": string;
  "items": [
    {
      "item_id": number;
      "item_uom_id": number;
      "discount_id": number;
      "is_free": boolean;
      "is_item_poi": boolean;
      "promotion_id": number | null;
      "item_qty": number;
      "item_price": number;
      "item_gross": number;
      "item_discount_amount": number;
      "item_vat": number;
      "item_net": number;
      "item_excise": number;
      "item_grand_total": number;
    }
  ],
  "total_qty": number;
  "total_gross": number;
  "total_discount_amount": number;
  "total_net": number;
  "total_vat": number;
  "total_excise": number;
  "grand_total": number;
  "current_stage_comment": string;
  "source": number;
}

export function apiInvoiceOrderMapper(order: ApiDeliveryModel): any {
  console.log(order);
  const items: OrderItemsPayload[] = order.delivery_details.map(apiItem => {
    const newItem: OrderItemsPayload = {
      item: {
        id: apiItem?.item[0]?.id,
        name: apiItem.item[0]?.item_name
      },
      item_id: apiItem.item[0]?.id,
      item_qty: apiItem?.item_qty.toString(),
      item_uom_id: apiItem.item_uom[0]?.id.toString(),
      uom_info: apiItem?.item_uom[0],
      item_price: Number(apiItem?.item_price),
      item_discount_amount: Number(apiItem?.item_discount_amount),
      item_vat: Number(apiItem?.item_vat),
      item_excise: Number(apiItem?.item_excise),
      item_grand_total: Number(apiItem?.item_grand_total),
      item_net: Number(apiItem?.item_net),
      discount_id: apiItem?.discount_id,
      is_free: Boolean(apiItem?.is_free),
      is_item_poi: Boolean(apiItem?.is_item_poi),
      item_gross: apiItem && apiItem.item_gross ? Number(apiItem?.item_gross) : 0
    };

    return newItem;
  });

  const newOrder: OrderModel = {
    id: order.id,
    uuid: order.uuid,
    order_type_id: order.order_type_id,
    order_type_info: order.order_type,
    payment_term_id: order.payment_term_id,
    payment_term_info: order.payment_term,
    customerObj: { id: order.user?.customer_info?.id, user: order.user, user_id: order.user?.customer_info?.user_id, customer_code: order.user?.customer_info?.customer_code },
    customer: order.user
      ? {
        customer_id: order.user?.customer_info?.id,
        user_id: order.user?.customer_info?.user_id,
        customer_name: order.user
          ? order.user?.firstname + ' ' + order.user?.lastname
          : 'Unknown',
      }
      : undefined,
    depot: order.depot ? {
      depot_id: order.depot_id,
      depot_name: order.depot ? order.depot.depot_name : 'Unknown'
    } : undefined,
    salesman: order.salesman_user
      ? {
        salesman_id: order.salesman_user.id,
        salesman_name: order.salesman_user ? order.salesman_user.firstname + " " + order.salesman_user.lastname : '',
      }
      : null,
    status: order.status,
    salesman_id: order.salesman.id,
    current_stage: order.current_stage,
    current_stage_comment: order.current_stage_comment,
    approval_status: '',
    customer_note: order.any_comment,
    order_date: order.order_date,
    order_number: order.order_number,
    delivery_date: order.delivery_date,
    due_date: order.due_date,
    gross_total: Number(order.grand_total),
    total_vat: Number(order.total_vat),
    total_excise: Number(order.total_excise),
    total_net: Number(order.total_net),
    total_discount_amount: Number(order.total_discount_amount),
    grand_total: Number(order.grand_total),
    items,
    storage_location_id: order.storage_location_id
  };

  return newOrder;
}