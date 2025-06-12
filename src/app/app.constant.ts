import { name } from "@azure/msal-angular/packageMetadata";

export const APP = {
  ORGANIZATION: 1,
  MODULE: {
    COUNTRY: 1,
    REGION: 2,
    BRANCH_DEPOT: 3,
    VAN: 4,
    CUSTOMER: 5,
    ITEMS: 6,
    BANK: 7,
    WAREHOUSE: 8,
    ROUTE: 9,
    SALESMAN: 10,
    VENDOR: 11,
    CURRENCY: 12,
    ZONE: 13
  },
};
export const TEMPLATE_MODULE = [
  { name: 'invoice', title: 'Invoice' },
  {
    name: 'customer',
    title: 'Customer',
  },
  {
    name: 'delivery',
    title: 'Delivery',
  },
  {
    name: 'credit_note',
    title: 'Credit Note',
  },
];
export const PAGE_SIZE = 5;
export const PAGE_SIZE_10 = 10;
export const STATUS = [
  {
    id: 'Pending',
    name: 'Pending',
  },
  {
    id: 'Rejected',
    name: 'Rejected',
  },
  {
    id: 'Approved',
    name: 'Approved',
  },
];

export const ORDER_STATUS = [
  {
    id: 'Created',
    name: 'Created',
  },
  {
    id: 'Updated',
    name: 'Updated',
  },
  {
    id: 'In-Process',
    name: 'In-Process',
  },
  {
    id: 'Delivered',
    name: 'Delivered',
  },
  {
    id: 'Shipment',
    name: 'Shipment',
  },
  {
    id: 'Cancel',
    name: 'Cancel',
  },
  {
    id: 'Partial-Deliver',
    name: 'Partial Delivered',
  },
  {
    id: 'Completed',
    name: 'Completed',
  },
  {
    id: 'Picking Confirmed',
    name: 'Picking Confirmed',
  },
  {
    id: 'Picked',
    name: 'Picked',
  },
  {
    id: 'Truck Allocated',
    name: 'Truck Allocated',
  },

];
export const DELIVERY_STATUS = STATUS.concat([
  {
    id: 'Completed',
    name: 'Completed',
  },
]);
export const INVOICE_STATUS = STATUS.concat([
  {
    id: 'Completed',
    name: 'Completed',
  },
]);
export const PAYMENT_METHOD = [
  { id: 1, name: 'Check' },
  { id: 2, name: 'Cash' },
  { id: 3, name: 'Advance Payment' },
];
