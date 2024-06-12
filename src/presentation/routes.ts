import { Router } from "express";
import { ColaboradorRoutes } from "./colaborador/routes";

export class AppRoutes {


    static get routes(): Router {

        const router = Router();
        router.use('/api/colaborador',ColaboradorRoutes.routes);
        return router;
    }
    
}