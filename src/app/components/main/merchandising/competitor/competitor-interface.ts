export interface Competitor {
    id: number;
    status: number;
    created_at : string,
    organisation_id: number;
    uuid : string;
    company:string;
    brand:string;
    item:string;
    price:string;
    note:string;
    description:string;
    salesman : { 
        id: number;
        firstname: string;
        lastname: string;
      };
    competitor_info_image : [];
  };