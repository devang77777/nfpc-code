export interface ApiStockAdjustModel {
  "id": number;
  "uuid": string;
  "organisation_id": number;
  "customer_id": number;
  "depot_id": null;
  "order_type_id": number;
  "reference_number": string;
  "stock_adjustment_date": string;
  "due_date": string;
  "delivery_date": string;
  "total_qty": string;
  "description": string;
  "current_stage": string;
  "current_stage_comment": string;
  "sign_image": string;
  "source": number;
  "status": string;
  "created_at": string;
  "updated_at": string;
  "deleted_at": string;
  "adjustment_mode": string;
  warehouse: {
    warehouse_id: number;
    warehouse_name: string;
  };
  account: {
    account_id: number;
    account_name: string;
  };
  reason: {
    reason_id: number;
    reason_name: string;
  };
  "stock_details": ApiStockAdjustDetails[];
}

export interface ApiStockAdjustDetails {
  "id": number;
  "uuid": string;
  "order_id": number;
  "item_id": number;
  "item_uom_id": number;
  "item_qty": string;
  "available_qty": number;
  "new_qty": number;
  "adjusted_qty": number;
  "available_value": number;
  "new_value": number;
  "adjusted_value": number;
  "item_code": string;
  "created_at": string;
  "updated_at": string;
  "deleted_at": string;
  "item": {
    "id": number;
    "item_name": string;
  };
  "item_uom": {
    "id": number;
    "name": string;
    "code": string;
  };
}

export interface StockAdjustmentModel {
  id: number;
  uuid: string;
  warehouse: {
    warehouse_id: number;
    warehouse_name: string;
  };
  account: {
    account_id: number;
    account_name: string;
  };
  reason: {
    reason_id: number;
    reason_name: string;
  };
  adjustment_mode: string;
  status: string;
  current_stage: string;
  current_stage_comment: string;
  approval_status: number;
  description: string;
  stock_adjustment_date: string;
  reference_number: string;
  delivery_date: string;
  due_date: string;
  items: StockAdjustItemsPayload[];
}

export interface StockAdjustItemsPayload {
  item: {
    id: number;
    name: string;
  };
  id?:number;
  item_qty?: string;
  item_uom_id: string;
  available_qty: number;
  new_qty: number;
  adjusted_qty: number;
  available_value: number;
  new_value: number;
  adjusted_value: number;
  discount_id?: number;
  promotion_id?: number;
  is_free?: boolean;
  is_item_poi?: boolean;
  return_reason_id?: number;
  item_id?: number;
  uom_info?: {
    "id": number;
    "name": string;
    "code": string;
  };
}

export function apiStockAdjustmentMapper(stockData: ApiStockAdjustModel): StockAdjustmentModel {
  const items: StockAdjustItemsPayload[] = stockData.stock_details.map(apiItem => {
    const newItem: StockAdjustItemsPayload = {
      item: {
        id: apiItem.item.id,
        name: apiItem.item.item_name
      },
      item_id: apiItem.item.id,
      item_qty: apiItem.item_qty,
      item_uom_id: apiItem.item_uom.id.toString(),
      uom_info: apiItem.item_uom,
      available_qty: apiItem.available_qty,
      new_qty: apiItem.new_qty,
      adjusted_qty: apiItem.adjusted_qty,
      available_value: apiItem.available_value,
      new_value: apiItem.new_value,
      adjusted_value: apiItem.adjusted_value
    };

    return newItem;
  });

  const newData: StockAdjustmentModel = {
    id: stockData.id,
    uuid: stockData.uuid,
    warehouse: {
      warehouse_id: stockData.warehouse.warehouse_id,
      warehouse_name: stockData.warehouse.warehouse_name
    },
    account: {
      account_id: stockData.account.account_id,
      account_name: stockData.account.account_name
    },
    reason: {
      reason_id: stockData.reason.reason_id,
      reason_name: stockData.reason.reason_name
    },
    adjustment_mode: stockData.adjustment_mode,
    status: stockData.status,
    current_stage: stockData.current_stage,
    current_stage_comment: stockData.current_stage_comment,
    approval_status: 0,
    description: stockData.description,
    stock_adjustment_date: stockData.stock_adjustment_date,
    reference_number: stockData.reference_number,
    delivery_date: stockData.delivery_date,
    due_date: stockData.due_date,
    items
  };

  return newData;
}
