import { InfoModal } from 'src/app/components/main/transaction/collection/collection-models';

export const SALES_TARGET_LIST = {
  data: [
    {
      id: 1,
      uuid: '94fdc0a0-ae54-11ea-b2ef-b34640fbc2c7',
      target_on_id: 1,
      target_on: {
        target_name: 'Depot',
        target_id: 1,
      },
      target_type: 'quantity',
      apply_type: 'item',
      sales_target_name: 'June Depot Target',
      target_owner_id: [1, 2],
      target_owner: [
        {
          id: 1,
          name: 'Bruce Wayne',
        },
        {
          id: 2,
          name: 'Peter Parker',
        }
      ],
      status: 1,
      start_date: '2020-06-30',
      end_date: '2020-07-29',
      target_range_type: 'slab',
      commission_type: 'fixed',
      items_detail: [
        {
          item_code: 'Ite1005',
          item_id: 5,
          item_name: 'New item',
          item_uom_id: 3,
          targets: [
            {
              "fixed_qty": 0,
              "fixed_value": 0,
              "from_qty": 10,
              "to_qty": 50,
              "from_value": 0,
              "to_value": 0,
              "commission": 100
            },
            {
              "fixed_qty": 0,
              "fixed_value": 0,
              "from_qty": 50,
              "to_qty": 500,
              "from_value": 0,
              "to_value": 0,
              "commission": 1000
            }
          ]
        },
        {
          item_code: 'Ite1005',
          item_id: 5,
          item_name: 'New item',
          item_uom_id: 3,
          targets: [
            {
              "fixed_qty": 0,
              "fixed_value": 0,
              "from_qty": 0,
              "to_qty": 500,
              "from_value": 0,
              "to_value": 0,
              "commission": 500
            }
          ]
        },
      ],
      headers_detail: null,
    },
    {
      id: 2,
      uuid: '94fdc0a0-ae54-11ea-b2ef-b34640fbc2c7',
      target_on_id: 1,
      target_on: {
        target_name: 'Salesman',
        target_id: 2,
      },
      target_type: 'quantity',
      apply_type: 'item',
      sales_target_name: 'July Salesman Target',
      target_owner_id: [ 1 ],
      target_owner: [
        {
          id: 1,
          name: 'Bruce Wayne',
        }
      ],
      status: 0,
      start_date: '2020-06-30',
      end_date: '2020-07-29',
      target_range_type: 'fixed',
      commission_type: 'percentage',
      items_detail: [
        {
          item_code: 'Ite1005',
          item_id: 5,
          item_name: 'New item',
          item_uom_id: 3,
          targets: [
            {
              fixed_qty: 50,
              fixed_value: null,
              from_qty: null,
              to_qty: null,
              from_value: null,
              to_value: null,
              commission: 500
            }
          ]
        },
      ],
      headers_detail: null,
    },
    {
      id: 3,
      uuid: '94fdc0a0-ae54-11ea-b2ef-b34640fbc2c7',
      target_on_id: 1,
      target_on: {
        target_name: 'Salesman',
        target_id: 2,
      },
      target_type: 'quantity',
      apply_type: 'header',
      sales_target_name: 'July Temp Head Target',
      target_owner_id: [ 1 ],
      target_owner: [
        {
          id: 1,
          name: 'Bruce Wayne',
        },
        {
          id: 2,
          name: 'Peter Parker',
        }
      ],
      status: 0,
      start_date: '2020-06-30',
      end_date: '2020-07-29',
      target_range_type: 'fixed',
      commission_type: 'percentage',
      items_detail: null,
      headers_detail: [
        {
          fixed_qty: 50,
          fixed_value: null,
          from_qty: null,
          to_qty: null,
          from_value: null,
          to_value: null,
          commission: 15
        },
        {
          fixed_qty: 500,
          fixed_value: null,
          from_qty: null,
          to_qty: null,
          from_value: null,
          to_value: null,
          commission: 25
        }
      ],
    },
    {
      id: 4,
      uuid: '94fdc0a0-ae54-11ea-b2ef-b34640fbc2c7',
      target_on_id: 1,
      target_on: {
        target_name: 'Salesman',
        target_id: 2,
      },
      target_type: 'quantity',
      apply_type: 'header',
      sales_target_name: 'July Salesman Head Target',
      target_owner_id: [ 1 ],
      target_owner: [
        {
          id: 1,
          name: 'Bruce Wayne',
        },
        {
          id: 2,
          name: 'Peter Parker',
        }
      ],
      status: 1,
      start_date: '2020-06-30',
      end_date: '2020-07-29',
      target_range_type: 'slab',
      commission_type: 'fixed',
      items_detail: null,
      headers_detail: [
        {
          "fixed_qty": 0,
          "fixed_value": 0,
          "from_qty": 10,
          "to_qty": 50,
          "from_value": 0,
          "to_value": 0,
          "commission": 100
        },
        {
          "fixed_qty": 0,
          "fixed_value": 0,
          "from_qty": 50,
          "to_qty": 500,
          "from_value": 0,
          "to_value": 0,
          "commission": 1000
        }
      ],
    }
  ],
};

export const SalesTargetEntities: { data: InfoModal[] } = {
  data: [
    {
      id: 1,
      name: 'Depot',
    },
    {
      id: 2,
      name: 'Salesman',
    },
    {
      id: 3,
      name: 'Region',
    },
  ],
};

export const SALES_TARGET_ACHIEVED_DATA = {
  data: {
    month_name: 'june',
    year: '2020',
    month_target: 10000,
    today_sale: 0,
    month_to_date_sale: 0,
    btg: 0,
    dates_stat: [
      {
        "date": 1,
        "total_sale": 500
      },
      {
        "date": 2,
        "total_sale": 0
      },
      {
        "date": 3,
        "total_sale": 0
      },
      {
        "date": 4,
        "total_sale": 50
      },
      {
        "date": 5,
        "total_sale": 0
      },
      {
        "date": 6,
        "total_sale": 0
      },
      {
        "date": 7,
        "total_sale": 0
      },
      {
        "date": 8,
        "total_sale": 0
      },
      {
        "date": 9,
        "total_sale": 0
      },
      {
        "date": 10,
        "total_sale": 0
      },
      {
        "date": 11,
        "total_sale": 0
      },
      {
        "date": 12,
        "total_sale": 0
      },
      {
        "date": 13,
        "total_sale": 30
      },
      {
        "date": 14,
        "total_sale": 0
      },
      {
        "date": 15,
        "total_sale": 0
      },
      {
        "date": 16,
        "total_sale": 0
      },
      {
        "date": 17,
        "total_sale": 0
      },
      {
        "date": 18,
        "total_sale": 0
      },
      {
        "date": 19,
        "total_sale": 300
      },
      {
        "date": 20,
        "total_sale": 0
      },
      {
        "date": 21,
        "total_sale": 0
      },
      {
        "date": 22,
        "total_sale": 0
      },
      {
        "date": 23,
        "total_sale": 0
      },
      {
        "date": 24,
        "total_sale": 0
      },
      {
        "date": 25,
        "total_sale": 250
      },
      {
        "date": 26,
        "total_sale": 0
      },
      {
        "date": 27,
        "total_sale": 0
      },
      {
        "date": 28,
        "total_sale": 0
      },
      {
        "date": 29,
        "total_sale": 100
      },
      {
        "date": 30,
        "total_sale": 0
      }
    ]
  }
};
