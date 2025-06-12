export interface Complaint {
    id: number;
    status: number;
    created_at : string,
    organisation_id: number;
    uuid : string;
    complaint_id:string;
    title:string;
    description:string;
    salesman : { 
        id: number;
        firstname: string;
        lastname: string;
      }; 
      item: {
        id: number,
        item_name: string
      };
      route: {
        id: number,
        route_name: string
      };
      complaint_feedback_image : [];
  };