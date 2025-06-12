import { ItemAddTableHeader } from '../../transaction/orders/order-models';
import { FormGroup } from '@angular/forms';

export interface SalesTargetModel {
  id: number;
  uuid: string;
  Applyon: string;
  ApplyOn: string;
  TargetName: string;
  target_on: {
    target_name: string;
    target_id: number;
  };
  TargetType: string;
  TargetEntity: string;
  apply_type: string;
  sales_target_name: string;
  target_owner_id: number[];
  TargetOwnerId: number;
  status: number;
  StartDate: string;
  EndDate: string;
  TargetVariance: string;
  CommissionType: string;
  items_detail: SalesTargetItemDetail[];
  sales_item_target_detail: SalesTargetItemDetail[];
  headers: SalesTargetHeaderDetail[];
}

export interface SalesTargetItemDetail {
  item_code?: string;
  item_id: number;
  item_name: string;
  item_uom_id: number;
  targets: SalesTargetHeaderDetail[];
}

export interface SalesTargetHeaderDetail {
  fixed_qty: number;
  fixed_value: number;
  from_qty: number;
  to_qty: number;
  from_value: number;
  to_value: number;
  commission: number;
}

export interface SalesAchievedStats {
  month_name: string;
  year: string;
  month_target: number;
  today_sale: number;
  month_to_date_sale: number;
  btg: number;
  dates_stat: {
    date: number;
    total_sale: number;
  }[];
}


export const SALES_TARGET_ITEM_HEADER: ItemAddTableHeader[] = [
  { id: 1, key: 'name', label: 'Item Name' },
  { id: 2, key: 'uom', label: 'Item UOM' },
];

export const SALES_TARGET_HEAD_HEADER_QTY: ItemAddTableHeader[] = [
  { id: 1, key: 'from_qty', label: 'From Qty' },
  { id: 1, key: 'to_qty', label: 'To Qty' },
  { id: 1, key: 'commission', label: 'Commission' },
];

export const SALES_TARGET_HEAD_HEADER_VALUE: ItemAddTableHeader[] = [
  { id: 1, key: 'from_value', label: 'From Value' },
  { id: 1, key: 'to_value', label: 'To Value' },
  { id: 1, key: 'commission', label: 'Commission' },
];

export const SALES_TARGET_HEAD_HEADER_FIXED_QTY: ItemAddTableHeader[] = [
  { id: 1, key: 'fixed_qty', label: 'Fixed Qty' },
  { id: 1, key: 'commission', label: 'Commission' },
];

export const SALES_TARGET_HEAD_HEADER_FIXED_VALUE: ItemAddTableHeader[] = [
  { id: 1, key: 'fixed_value', label: 'Fixed Value' },
  { id: 1, key: 'commission', label: 'Commission' },
];

export enum TargetControl {
  ITEM_VALUE = 'ITEM_VALUE',
  ITEM_QTY = 'ITEM_QTY',
  ITEM_FIXED_VALUE = 'ITEM_FIXED_VALUE',
  ITEM_FIXED_QTY = 'ITEM_FIXED_QTY',
  HEAD_VALUE = 'HEAD_VALUE',
  HEAD_QTY = 'HEAD_QTY',
  HEAD_FIXED_VALUE = 'HEAD_FIXED_VALUE',
  HEAD_FIXED_QTY = 'HEAD_FIXED_QTY',
}

export interface SalesTargetItemModalData {
  itemDetail?: SalesTargetItemDetail;
  item?: FormGroup;
  itemIndex: number;
  targetControl: TargetControl;
  commissionType: string;
}
