// export class LoadRequest {
//     id?: number;
// }


export interface SalesmanInfo {
    user_id?: number;
    salesman_code?: string;
}

export interface Salesman {
    id?: number;
    firstname?: string;
    lastname?: string;
    salesman_info?: SalesmanInfo;
}

export interface Depot {
    id?: number;
    depot_code?: string;
    depot_name?: string;
}

export interface Route {
    id?: number;
    route_name?: string;
    route_code?: string;
    depot_id?: number;
    depot?: Depot;
}

export interface Item {
    id?: number;
    item_name?: string;
    item_code?: string;
}

export interface ItemUom {
    id?: number;
    name?: string;
}

export interface LoadRequestDetail {
    id?: number;
    uuid?: string;
    load_request_id?: number;
    item_id?: number;
    requested_item_uom_id?: number;
    is_deleted?: number;
    item_uom_id?: number;
    qty?: string;
    requested_qty?: string;
    is_delete?: number;
    created_at?: Date;
    updated_at?: Date;
    deleted_at?: any;
    item?: Item;
    item_uom?: ItemUom;
}

export interface LoadRequest {
    id?: number;
    uuid?: string;
    organisation_id?: number;
    route_id?: number;
    salesman_id?: number;
    trip_id?: any;
    load_number?: string;
    load_type?: string;
    load_date?: string;
    status?: string;
    source?: number;
    current_stage?: string;
    current_stage_comment?: any;
    approval_status?: string;
    src_location?: any;
    created_at?: Date;
    updated_at?: Date;
    deleted_at?: any;
    oddo_post_id?: any;
    odoo_failed_response?: any;
    need_to_approve?: string;
    objectid?: string;
    salesman?: Salesman;
    route?: Route;
    load_request_detail?: LoadRequestDetail[];
    trip?: any;
}