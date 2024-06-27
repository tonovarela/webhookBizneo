import { BitacoraPersonal } from "@prisma/client"
import { ColaboradorResult, Contrato, User } from "../../interfaces/bizneo"
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

    // protected async sincronizarEstatus(colaborador: BitacoraPersonal): Promise<ColaboradorResult> {
    //     const personalDB = await this.colaboradorService.detalleIntelisis(colaborador.personal);
    //     const personalBizneo = await this.bizneoClient.obtenerPersonal(colaborador.personal);
    //     if (personalDB === undefined || personalBizneo === undefined) {
    //         return {
    //             personal: colaborador.personal,
    //             id_bizneo: undefined,
    //             mensaje: 'No se encuentra registrado en Intelisis',
    //             procesado: false,
    //         };
    //     }
    //     const usuario = personalBizneo.users[0];

    //     const { Estatus, FechaAntiguedad } = personalDB;
    //     const estatus = Estatus.trim();
    //     const bizneoID = usuario.id;
    //     const contratos = await this.bizneoClient.listarContratos(bizneoID);
    //     if (estatus === "ALTA") {
    //         await this.eliminarContratos(bizneoID, contratos);
    //         await this.bizneoClient.actualizarPerfil(`${bizneoID}`, { ...usuario, access: 'enabled' });
    //         const { mensaje, procesado } = await this.bizneoClient.registrarContrato(bizneoID, FechaAntiguedad);
    //         return {
    //             personal: personalDB.Personal,
    //             id_bizneo: usuario.id,
    //             mensaje: mensaje,
    //             procesado,
    //         };

    //     }
    //     if (estatus === "BAJA") {
    //         await this.eliminarContratos(bizneoID, contratos);
    //         await this.bizneoClient.actualizarPerfil(`${usuario.id}`, { ...usuario, access: 'revoked' });
    //         return {
    //             personal: colaborador.personal,
    //             id_bizneo: usuario.id,
    //             mensaje: 'Personal dado de baja en Intelisis',
    //             procesado: true,
    //         };

    //     }
    //     return {
    //         personal: colaborador.personal,
    //         id_bizneo: usuario.id,
    //         mensaje: `Estatus ${personalDB.Estatus} no reconocido `,
    //         procesado: false,
    //     };
    // }


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