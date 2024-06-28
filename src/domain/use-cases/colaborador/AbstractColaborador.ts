import { BitacoraPersonal } from "@prisma/client"
import { ColaboradorResult, Contrato } from "../../interfaces/bizneo"
import { ColaboradorService } from "../../../services/colaborador.service";
import { Bizneo } from "../../../infrastructure/datasource/bizneo";


export abstract class AbstractColaboradorUseCase {
    abstract execute(colaboradores: BitacoraPersonal[]): Promise<ColaboradorResult[]>
    constructor(readonly colaboradorService: ColaboradorService, readonly bizneoClient: Bizneo) {
    }


    private async eliminarContratos(bizneoID: number, contratos: Contrato[]): Promise<void> {
        for (const { id } of contratos) {
            await this.bizneoClient.eliminarContrato(bizneoID, id);
        }
    }



    protected async sincronizarEstatus(id_personal: string, id_bizneo:number, acceso: 'enabled' | 'revoked') {
        const contratos = await this.bizneoClient.listarContratos(+id_bizneo);
        if (acceso === "revoked") {
            await this.eliminarContratos(+id_bizneo, contratos);
        }
        
        if (acceso === "enabled") {
            const personalDB = await this.colaboradorService.detalleIntelisis(id_personal);            
            if (personalDB) {
                const { FechaAntiguedad } = personalDB;
                await this.eliminarContratos(+id_bizneo, contratos);
                await this.bizneoClient.registrarContrato(+id_bizneo, FechaAntiguedad);
            }

        }

    }

}