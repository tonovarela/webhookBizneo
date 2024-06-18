export interface ResponseSalaries {
    id:               number;
    amount:           Amount;
    work_contract_id: null;
    end_at:           Date;
    frequency:        string;
    start_at:         Date;
}

export interface Amount {
    currency: string;
    amount:   string;
}
