export interface ModelStock {
    id: number;
    distribution_id: number;
    created_at : string,
    organisation_id: number;
    uuid : string;
    customer_id:number;
    distribution_model_stock_details : [
      {
        id: number;
        distribution_id: number;
        distribution_model_stock_id: number;
        item_id: number;
        item_uom_id: number;
        capacity: string;
        item : {
          id: number;
          item_name : string;
        };
        item_uom : {
          id: number;
          name : string;
        };
      }
    ]; 
  };