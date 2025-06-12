export interface Campaign {
  id: number;
  status: number;
  created_at: string;
  organisation_id: number;
  uuid: string;
  campaign_id: string;
  salesman_id: number;
  customer_id: number;
  feedback: string;
  customer: {
    id: number;
    firstname: string;
    lastname: string;
  };
  salesman: {
    id: number;
    firstname: string;
    lastname: string;
  };
  campaign_picture_image: [];
}
