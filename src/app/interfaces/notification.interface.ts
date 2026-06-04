export interface NotificationModel {
    reason: any;
    created_at: string;
    postTiming: string;
    id: number;
    message: string;
    status: number;
    type: string;
    url: string;
    user_id: number;
    uuid: string;
    is_read: number;
    other:any
    approval_status: string
    objectid?: string;
    expanded?: boolean;
    work_flow_obj_uuid: any;
    merchandiser_image_1?: any;
    customer_amount?: any;
    customer_name?: any;
    customer_code?: any;
    merchandiser_name?: any;
    customer_grv?: any;
}



export interface NotificationPagingRequestModel {
    page: number;
    page_size: number;
}

export interface NotificationPaginationModel {
    current_page?: number;
    status_count?: number;
    total_pages?: number;
    total_records?: number;
    unread_count?: number;
}