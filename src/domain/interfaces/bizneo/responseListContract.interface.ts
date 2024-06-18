export interface Contrato {
    id:                   number;
    end_at:               Date | null;
    start_at:             Date;
    accumulate_seniority: boolean;
    fte:                  number;
}
