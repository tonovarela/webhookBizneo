
import { Request, Response } from 'express'
import { Bizneo } from '../../infrastructure/datasource/bizneo'
import { ColaboradorService } from '../../services/colaborador.service'
import { AbstractController } from '../abstract/controller.abstact'
import { ColaboradorActualizar, ColaboradorAlta } from '../../domain/use-cases/colaborador'
import { ColaboradorAsistencia } from '../../domain/use-cases/colaborador/colaborador-asistencia'




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


    revisionAsistencias = async (_: Request, res: Response) => {
     const colaboradorChecadasUseCase = new ColaboradorAsistencia(this.bizneoClient, this.colaboradorService);
     const curr = new Date;
     const inicio = new Date(curr.setDate(curr.getDate() - curr.getDay()));
     const fin = new Date(curr.setDate(curr.getDate() - curr.getDay() + 6));
     const resp = await colaboradorChecadasUseCase.execute(["16164686","16161392"],inicio,fin);
     
     return res.json( {actualizados:resp})

    }

    
    
}
