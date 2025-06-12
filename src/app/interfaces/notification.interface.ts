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