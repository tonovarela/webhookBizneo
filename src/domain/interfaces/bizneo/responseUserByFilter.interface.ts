import { User } from "./responseUser.interface";

export interface ResponseUserByFilter {
    users:      User[];
    pagination: Pagination;
}

export interface Pagination {
    page_number:   number;
    page_size:     number;
    total_entries: number;
    total_pages:   number;
}


