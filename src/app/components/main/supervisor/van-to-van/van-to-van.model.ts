import { ItemAddTableHeader } from 'src/app/components/main/transaction/orders/order-models';



export interface VanToVanModel {
    id: number;
    code: string;
    uuid: string;
    order_type_info?: {
      id?: number;
      name?: string;
      description?: string;
    };
    from_van: {
      van_id: number;
      van_name: string;
    };
    to_van: {
      van_id: number;
      van_name: string;
    };
    sourceroute?:{
      id: number, route_name: string
    }
    destinationroute?: {id: number, route_name: string}
    approval_status: number;
    status: number;
    delivery_date: string;
    items?: any[];
};


export interface ApiVanToVanDetails {
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
    "item_name": string;
  };
  "item_uom": {
    "id": number;
    "name": string;
    "code": string;
  };
}

export const VanToVanData = [
  {
    id: 1,
    code: "BF534",
    uuid: "94fdc0a0-ae54-11ea-b2ef-b34fgfbc2c7",
    order_type_info: {
      id: 2,
      name: "Dress",
      description: "New Dress",
    },
    approval_status: 1,
    from_van: {
      van_id: 23,
      van_name: "MGNF67",
    },
    to_van: {
      van_id: 43,
      van_name: "JKKLF45",
    },
    status: 1,
    delivery_date: "2020-05-21",
  },
  {
    id: 2,
    code: "BRE65",
    uuid: "94fdc23d-adgf4-34ea-b2ef-b34fgfbrc7",
    order_type_info: {
      id: 5,
      name: "IPhone",
      description: "Latest Iphone",
    },
    approval_status: 0,
    from_van: {
      van_id: 34,
      van_name: "SEGF67",
    },
    to_van: {
      van_id: 22,
      van_name: "MDKLF65",
    },
    status: 0,
    delivery_date: "2020-03-01",
  }
];


export interface VanToVanItemsPayload {
  item: {
    id: number;
    name: string;
  };
  id?:number,
  item_qty: string;
  item_uom_id: string;
  item_code: string;
  discount_id?: number;
  promotion_id?: number;
  quantity?:number;
  is_free?: boolean;
  is_item_poi?: boolean;
  return_reason_id?: number;
  item_id?: number;
  uom_info?: {
    "id": number;
    "name": string;
    "code": string;
  };
};

export const ITEM_VANTOVAN_TABLE_HEADS: ItemAddTableHeader[] = [
  { id: 0, key: 'sequence', label: '#' },
  { id: 1, key: 'item', label: 'Item Name' },
  { id: 2, key: 'uom', label: 'UOM' },
  { id: 3, key: 'qty', label: 'Qty' }
];


export const VAN_LIST = {
  data: [
    {
      id: 1,
      name: "Silver Estate Storage"
    },
    {
      id: 2,
      name: "Global Ship Van"
    },
    {
      id: 3,
      name: "North-West Van"
    },
    {
      id: 4,
      name: "Frank's Van"
    },
    {
      id: 5,
      name: "Beacon's Van"
    },
    {
      id: 6,
      name: "Extra-Space Storage"
    }
  ]
};
