export interface DepotExpairyItemsPayload {
  item: {
    id: number;
    name: string;
  };
  reason_id?:number
  qty: number;
  item_uom_id: string;
  item_id:number;
  reason:string;
  uom_info?: {
    "id": number;
    "name": string;
    "code": string;
  };
}
