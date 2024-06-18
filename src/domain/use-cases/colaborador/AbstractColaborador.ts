import { BitacoraPersonal } from "@prisma/client"
import { ColaboradorResult } from "../../interfaces/bizneo"
import { ColaboradorService } from "../../../services/colaborador.service";
import { Bizneo } from "../../../infrastructure/datasource/bizneo";

export abstract class AbstractColaboradorUseCase {
    abstract execute(colaboradores: BitacoraPersonal[]): Promise<ColaboradorResult[]>
     constructor( readonly colaboradorService: ColaboradorService,readonly bizneoClient: Bizneo){
     }

     
     protected async sincronizarEstatus(colaborador: BitacoraPersonal): Promise<ColaboradorResult> {
         const personalDB = await this.colaboradorService.detalleIntelisis(colaborador.personal);
         const personalBizneo = await this.bizneoClient.obtenerPersonal(colaborador.personal);                 
         if (personalDB === undefined|| personalBizneo === undefined) {
             return {
                 personal: colaborador.personal,
                 usuario: null,
                 mensaje: 'No se encuentra registrado en Intelisis',
                 procesado: false,
             };
         }
         const usuario =personalBizneo.users[0];        
         const bizneoID =usuario.id;        
         const { Estatus,FechaAntiguedad } = personalDB;
         const estatus = Estatus.trim();
         const contratos = await this.bizneoClient.listarContratos(bizneoID);                    
         if (estatus === "ALTA" && contratos.length === 0) {                     
             for (const {id} of contratos) {            
                 await this.bizneoClient.eliminarContrato(bizneoID, id);
             }            
             //Agregar contrato
          const { mensaje,procesado} =   await this.bizneoClient.registrarContrato(bizneoID,FechaAntiguedad);
             return {
                 personal: colaborador.personal,
                 usuario,
                 mensaje: mensaje,
                 procesado,
             };
         } 
         if (estatus === "BAJA") {
             //Eliminar todos los contratos            
              for (const {id} of contratos) {            
                  await this.bizneoClient.eliminarContrato(bizneoID, id);
              }
             return {
                 personal: colaborador.personal,
                 usuario,
                 mensaje: 'Personal dado de baja en Intelisis',
                 procesado: true,
             };
 
         }
         return {
             personal: colaborador.personal,
             usuario,
             mensaje: `Estatus ${personalDB.Estatus} no reconocido `,
             procesado: false,
         };
 
 
 
 
     }
 }