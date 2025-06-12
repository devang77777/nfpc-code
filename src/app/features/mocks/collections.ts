import {INVOICE_LIST} from './invoice-mock';

export const COLLECTIONS_LIST = {
  data: [
    {
      id: 0,
      uuid: "2131-bjcdhcbj-2312-scdkcj",
      customer_id: 1,
      customer_info: {
        id: 1,
        name: "Frank Lee"
      },
      payment_date: '2020-06-20',
      payment_mode_id: 1,
      payment_mode: {
        id: 1,
        name: "Cash"
      },
      collection_number: "CSH00012",
      collection_amount: 25000,
      invoices: INVOICE_LIST.data
    },
    {
      id: 1,
      uuid: "bjcdhcbj-2131-sdckjsdncj-2312-scdkcj",
      customer_id: 2,
      customer_info: {
        id: 2,
        name: "Thomas Lee"
      },
      payment_date: '2020-06-22',
      payment_mode_id: 2,
      payment_mode: {
        id: 2,
        name: "Credit"
      },
      collection_number: "CSH00024",
      collection_amount: 15000,
      invoices: INVOICE_LIST.data
    }
  ]
};
