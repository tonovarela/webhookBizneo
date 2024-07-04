export interface ResponseChecadas {
    logged_times: LoggedTimeElement[];
    pagination:   Pagination;
}

export interface LoggedTimeElement {
    logged_time: LoggedTimeLoggedTime;
}

export interface LoggedTimeLoggedTime {
    id:           number;
    date:         Date;
    user_id:      number;
    logged_hours: LoggedHour[];
    total_hours:  number;
}

export interface LoggedHour {
    date:     Date;
    kind:     string;
    start_at: string;
    end_at:   string;
    projects: any[];
}

export interface Pagination {
    page_number:   number;
    page_size:     number;
    total_entries: number;
    total_pages:   number;
}
