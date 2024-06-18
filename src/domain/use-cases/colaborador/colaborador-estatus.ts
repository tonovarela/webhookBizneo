import { BitacoraPersonal } from "@prisma/client"
import { ColaboradorResult} from "../../interfaces/bizneo"
import { ColaboradorService } from "../../../services/colaborador.service";
import { Bizneo } from "../../../infrastructure/datasource/bizneo";
import { AbstractColaboradorUseCase } from "./AbstractColaborador";



export class ColaboradorEstatus extends AbstractColaboradorUseCase {
    
    constructor( readonly colaboradorService: ColaboradorService,  readonly bizneoClient: Bizneo) {
        super(colaboradorService, bizneoClient);
     }
    
    async execute(colaboradores: BitacoraPersonal[]): Promise<ColaboradorResult[]> {
        let result: ColaboradorResult[] = [];
        for (const colaborador of colaboradores) {
            const res = await this.sincronizarEstatus(colaborador);
            if (res.procesado) {
                const idBizneo = res.usuario.id;
                const id_bitacora = colaborador.id_bitacora!;
                await this.colaboradorService.actualizarIDBizneo(idBizneo,id_bitacora);
            }
            result.push(res);
        }
        return result;
    }

    



}