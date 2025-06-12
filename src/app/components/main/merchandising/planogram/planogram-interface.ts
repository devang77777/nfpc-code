export interface Planogram {
  id: number;
  status: number;
  organisation_id: number;
  uuid: string;
  name: string;
  start_date: string;
  end_date: string;
  customer_id: number;
  customer: {
    id: number;
    firstname: string;
    lastname: string;
  };
}
