import { AxiosError } from 'axios'
import { Bizneo } from '../../infrastructure/datasource/bizneo'
import { ColaboradorService } from '../../services/colaborador.service'
import { AbstractController } from '../abstract/controller.abstact'
import { Request, Response } from 'express'
import { ColaboradorAlta } from '../../domain/use-cases/colaborador/colabotador-alta';
import { ColaboradorActualizar } from '../../domain/use-cases/colaborador/colaborador-actualizar';

export class ColaboradorContoller extends AbstractController {
    constructor(
        private colaboradorService: ColaboradorService,
        private bizneoClient: Bizneo
    ) {
        super()
    }

    revisionAlta = async (_: Request, res: Response) => {
        const colaboradoresPendientes = (await this.colaboradorService.obtenerPorProcesar()).filter(c => c.action === 'Nuevo')
        const colaboradorAltaUseCase = new ColaboradorAlta(this.colaboradorService, this.bizneoClient)
        const resp = await colaboradorAltaUseCase.execute(colaboradoresPendientes);
        return res.json(resp)
    }
    actualizar = async (req: Request, res: Response) => {
        const colaboradoresPendientes = (await this.colaboradorService.obtenerPorProcesar()).filter(c => c.action === 'Actualizar')
        const colaboradorActualizarUseCase = new ColaboradorActualizar(this.colaboradorService, this.bizneoClient)
        const resp = await colaboradorActualizarUseCase.execute(colaboradoresPendientes);        
        return res.json(resp)
    }
}
