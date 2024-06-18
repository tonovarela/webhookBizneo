
import { Request, Response } from 'express'
import { Bizneo } from '../../infrastructure/datasource/bizneo'
import { ColaboradorService } from '../../services/colaborador.service'
import { AbstractController } from '../abstract/controller.abstact'
import { ColaboradorActualizar, ColaboradorAlta, ColaboradorEstatus } from '../../domain/use-cases/colaborador'




export class ColaboradorContoller extends AbstractController {
    constructor(private colaboradorService: ColaboradorService,private bizneoClient: Bizneo) {super()}

    revisionAlta = async (_: Request, res: Response) => {        
        const colaboradoresPendientes = await this.colaboradorService.obtenerPorProcesar("Nuevo");
        const colaboradorAltaUseCase = new ColaboradorAlta(this.colaboradorService, this.bizneoClient)
        const resp = await colaboradorAltaUseCase.execute(colaboradoresPendientes);
        return res.json({registrados: resp})
    }
    actualizar = async (_: Request, res: Response) => {
        const colaboradoresPendientes = await this.colaboradorService.obtenerPorProcesar("Actualizar");
        const colaboradorActualizarUseCase = new ColaboradorActualizar(this.colaboradorService, this.bizneoClient);
        const resp = await colaboradorActualizarUseCase.execute(colaboradoresPendientes);        
        return res.json( {actualizados:resp})
    }

    estatus = async (_: Request, res: Response) => {
        const colaboradoresPendientes = await this.colaboradorService.obtenerPorProcesar("Estatus");
        const colaboradorEstatusUseCase = new ColaboradorEstatus(this.colaboradorService, this.bizneoClient);
        const resp = await colaboradorEstatusUseCase.execute(colaboradoresPendientes);
        return res.json({estatusActualizados:resp})
    }

    
}
