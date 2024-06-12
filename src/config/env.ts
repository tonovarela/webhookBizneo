import 'dotenv/config';
import { get } from 'env-var';


export const envs = {
    PORT:get('PORT').required().asPortNumber(),
    TOKEN : get('TOKEN').required().asString(),
    BIZNEO_URL : get('BIZNEO_URL').required().asString(),
    DB_INTELISIS : get('DB_INTELISIS').required().asString(),

}