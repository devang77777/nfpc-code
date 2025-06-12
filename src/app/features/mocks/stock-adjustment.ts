import { ApiStockAdjustModel } from 'src/app/components/main/inventory/stock-adjustment/stock-adjustment-model';
import { TempNameData } from 'src/app/components/main/inventory/stock-adjustment/sa-form/sa-form.component';


export const STOCK_ADJUSTMENT_LIST: { data: ApiStockAdjustModel[]; } = {
  data: [
    {
      "id": 6,
      "uuid": "94fdc0a0-ae54-11ea-b2ef-b34640fbc2c7",
      "organisation_id": 14,
      "customer_id": 6,
      "depot_id": null,
      "order_type_id": 4,
      reference_number: "CR11000001",
      stock_adjustment_date: "2020-06-14",
      "due_date": "2020-06-26",
      "delivery_date": "2020-06-17",
      "total_qty": "2.00",
      description: "stock adjustment testing",
      "current_stage": "Pending",
      "current_stage_comment": null,
      "sign_image": null,
      "source": 3,
      "status": 'Adjustment',
      "created_at": "2020-06-14T15: 34: 48.000000Z",
      "updated_at": "2020-06-14T15: 34: 48.000000Z",
      "deleted_at": null,
      adjustment_mode: 'quantity',
      warehouse: {
        warehouse_id: 1,
        warehouse_name: "Silver Estate Storage"
      },
      account: {
        account_id: 1,
        account_name: "Tax Accounts"
      },
      reason: {
        reason_id: 1,
        reason_name: "Damaged Item"
      },
      stock_details: [
        {
          "id": 10,
          "uuid": "950185d0-ae54-11ea-a365-dfd3294fce38",
          "order_id": 6,
          "item_id": 8,
          "item_uom_id": 5,
          "item_qty": "1.00",
          available_qty: 500,
          new_qty: 300,
          adjusted_qty: 200,
          available_value: 0,
          new_value: 0,
          adjusted_value: 0,
          "item_code": "IT0023",
          "created_at": "2020-06-14T15: 34: 48.000000Z",
          "updated_at": "2020-06-14T15: 34: 48.000000Z",
          "deleted_at": null,
          "item": {
            "id": 8,
            "item_name": "New Item added"
          },
          "item_uom": {
            "id": 5,
            "name": "Test item uom",
            "code": "IU001"
          }
        },
        {
          "id": 11,
          "uuid": "95026840-ae54-11ea-9b5a-41febd0843f7",
          "order_id": 6,
          "item_id": 11,
          "item_uom_id": 5,
          "item_qty": "156.00",
          available_qty: 1000,
          new_qty: 700,
          adjusted_qty: 300,
          available_value: 0,
          new_value: 0,
          adjusted_value: 0,
          "item_code": "IT0063",
          "created_at": "2020-06-14T15: 34: 48.000000Z",
          "updated_at": "2020-06-14T15: 34: 48.000000Z",
          "deleted_at": null,
          "item": {
            "id": 11,
            "item_name": "item2"
          },
          "item_uom": {
            "id": 5,
            "name": "Test item uom",
            "code": "IU001"
          }
        }
      ]
    },
    {
      "id": 10,
      "uuid": "94fdc0-a02wdwe-b2ef-b34640fbc2c7",
      "organisation_id": 14,
      "customer_id": 6,
      "depot_id": null,
      "order_type_id": 4,
      reference_number: "SAD002334",
      stock_adjustment_date: "2020-06-25",
      "due_date": "2020-06-26",
      "delivery_date": "2020-06-17",
      "total_qty": "2.00",
      description: "stock adjustment duplicate",
      "current_stage": "Pending",
      "current_stage_comment": null,
      "sign_image": null,
      "source": 3,
      "status": 'Adjustment',
      "created_at": "2020-06-14T15: 34: 48.000000Z",
      "updated_at": "2020-06-14T15: 34: 48.000000Z",
      "deleted_at": null,
      adjustment_mode: 'quantity',
      warehouse: {
        warehouse_id: 2,
        warehouse_name: "Global Ship Warehouse"
      },
      account: {
        account_id: 2,
        account_name: "Goods & Services"
      },
      reason: {
        reason_id: 1,
        reason_name: "Damaged Item"
      },
      stock_details: [
        {
          "id": 10,
          "uuid": "950185d0-ae54-11ea-a365-dfd3294fce38",
          "order_id": 6,
          "item_id": 8,
          "item_uom_id": 5,
          "item_qty": "1.00",
          available_qty: 800,
          new_qty: 300,
          adjusted_qty: 500,
          available_value: 0,
          new_value: 0,
          adjusted_value: 0,
          "item_code": "IT0023",
          "created_at": "2020-06-14T15: 34: 48.000000Z",
          "updated_at": "2020-06-14T15: 34: 48.000000Z",
          "deleted_at": null,
          "item": {
            "id": 8,
            "item_name": "New Item added"
          },
          "item_uom": {
            "id": 5,
            "name": "Test item uom",
            "code": "IU001"
          }
        },
        {
          "id": 11,
          "uuid": "95026840-ae54-11ea-9b5a-41febd0843f7",
          "order_id": 6,
          "item_id": 11,
          "item_uom_id": 5,
          "item_qty": "156.00",
          available_qty: 300,
          new_qty: 100,
          adjusted_qty: 200,
          available_value: 0,
          new_value: 0,
          adjusted_value: 0,
          "item_code": "IT0063",
          "created_at": "2020-06-14T15: 34: 48.000000Z",
          "updated_at": "2020-06-14T15: 34: 48.000000Z",
          "deleted_at": null,
          "item": {
            "id": 11,
            "item_name": "item2"
          },
          "item_uom": {
            "id": 5,
            "name": "Test item uom",
            "code": "IU001"
          }
        }
      ]
    }
  ]
};

export const ACCOUNTS_LIST: { data: TempNameData[]; } = {
  data: [
    {
      id: 1,
      name: "Tex Accounts"
    },
    {
      id: 2,
      name: "Goods & Services"
    }
  ]
};
