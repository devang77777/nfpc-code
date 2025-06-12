export interface AssetTrack {
    id: number;
    status: number;
    created_at: string,
    organisation_id: number;
    uuid: string;
    customer_id: number;
    title: string;
    description: string;
    model_name: string;
    barcode: string;
    category: string;
    location: string;
    lat: string;
    lng: string;
    area: string;
    end_date: string;
    parent_id: object;
    wroker: string;
    additional_wroker: string;
    team: string;
    vendors: string;
    purchase_date: string;
    placed_in_service: string;
    purchase_price: string;
    warranty_expiration: string;
    residual_price: string;
    additional_information: string;
    useful_life: string;
    image: string;
    customer: {
        id: number;
        firstname: string;
        lastname: string;
    }
};