import axios from "axios";


 const ApiBizneo = axios.create({
    baseURL: process.env.BIZNEO_URL,    
});


ApiBizneo.interceptors.request.use( (config:any) =>{    
    config.params = {...config.params,token:process.env.TOKEN};
    return config
});

export {ApiBizneo}