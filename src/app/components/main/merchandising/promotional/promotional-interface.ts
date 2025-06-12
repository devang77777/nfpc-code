export interface Promotional {
    id: number;
    organisation_id: number;
    uuid: string;
    amount: string;
    start_date: string;
    end_date: string;
    item_id: number;
    item: {
        id: number;
        item_name: string;
    };

}