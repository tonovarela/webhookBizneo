export interface ResponseUser {
    user: User;
}

export interface User {
    access:                 string;
    id:                     number;
    time_zone:              string;
    email:                  string;
    external_id:            string;
    locale:                 string;
    first_name:             string;
    last_name:              string;
    work_contracts:         WorkContract[];
    last_login_at:          Date;
    projects:               any[];
    taxons:                 Taxons;
    week_start:             number;
    "Alcaldia o Municipio": string;
    "Calle y No":           string;
    Ciudad:                 string;
    "Codigo Postal":        string;
    Colonia:                string;
    Estado:                 string;
    birthday:               string;
    curp:                   string;
    email_personal:         string;
    ext:                    string;
    gender:                 string;
    numero_de_empleado:     string;
    pin:                    string;
}





export interface Taxons {
    Litoprocess: Litoprocess[];
}

export interface Litoprocess {
    id:   number;
    name: string;
}

export interface WorkContract {
    end_at:   null;
    start_at: Date;
    fte:      number;
}
