export interface Cashier {
    id: number;
    organisation_id: number;
    date: string;
    cashier_reciept_number: string;
    code: string;
    firstname: string;
    lastname: string;
    email: string;
    company_name: string;
    mobile: string;
    status: number;
    collectionDetails?: CollectionDetails[];
    route: {
        id: number;
        route_name: string;
    };
    salesman: {
        firstname: string;
        lastname: string;
    };
    total_amount: string;
    actual_amount: string;
    variance: string;
    slip_number: string;
    slip_date: string;
    bank: string;
}
export interface CollectionDetails {
    collection_number: string;
    created_at: string;
    type: string;
    type_name: string;
    invoice_number: string;
    grand_total: string;
    amount: string;
    pending_amount: string
}
