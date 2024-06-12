export  interface CreateUserRequest {
    user:CreateUser
}

export  interface CreateUser {
    
        email:string;
        first_name:string;
        last_name:string;
        external_id?:string;
        
}