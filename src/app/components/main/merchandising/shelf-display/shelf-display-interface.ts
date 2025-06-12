export interface ShelfDisplay {
    id: number;
    status: number;
    created_at : string,
    organisation_id: number;
    uuid : string;
    customer_id:number;
    name:string;
    start_date:string;
    end_date:string;
    height:number;
    width:number;
    depth:number;
    distribution_customer : [
      {
        id: number;
        distribution_id: number;
        customer_id: number;
        customer: { 
          id: number;
          firstname: string;
          lastname: string;
        }
      }
    ]; 
  };