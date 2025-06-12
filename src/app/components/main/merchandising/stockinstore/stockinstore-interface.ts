export interface Stockinstore {
    id: number;
    status: number;
    activity_name:string;
    valid_from:string;
    valid_to:string;
    assign_inventory_customer : [
      {
        id: number;
        assign_inventory_id: number;
        customer_id: number;
        customer: { 
          id: number;
          firstname: string;
          lastname: string;
        }
  
      }
    ];
    assign_inventory_details: [
      {
        id: number;
        assign_inventory_id: number;
        item_id: number;
        item_uom_id: number;  
        item: {
          id: number,
          item_name: string
        },
        item_uom: {
          id: number,
          name: string
        }
      }
    ]
  };