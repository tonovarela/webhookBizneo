import { Router } from "express";
import { ColaboradorContoller } from "./controller";
import { ColaboradorService } from "../../services/colaborador.service";
import { Bizneo } from "../../infrastructure/datasource/bizneo";

export class ColaboradorRoutes {

    static get routes(): Router {
        const router = Router();
        const colaboradorService= new ColaboradorService();
        const bizneoClient = new Bizneo();
        const controller = new ColaboradorContoller(colaboradorService,bizneoClient);
        router.get('/', controller.revisionAlta);
        router.get('/alta', controller.revisionAlta);
        router.get('/cambios', controller.actualizar);
        return router;
    }
}