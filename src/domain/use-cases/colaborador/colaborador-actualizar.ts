import { BitacoraPersonal } from "@prisma/client";
import { ColaboradorResult } from "../../interfaces/bizneo/colaborador-result";
import { ColaboradorService } from "../../../services/colaborador.service";
import { Bizneo } from "../../../infrastructure/datasource/bizneo";
import { AbstractColaboradorUseCase } from "./AbstractColaborador";


export class ColaboradorActualizar extends AbstractColaboradorUseCase {

    constructor(readonly colaboradorService: ColaboradorService, readonly bizneoClient: Bizneo) { super(colaboradorService, bizneoClient); }


    async execute(colaboradores: BitacoraPersonal[]): Promise<ColaboradorResult[]> {
        let result: ColaboradorResult[] = [];
        for (const colaborador of colaboradores) {
            const res = await this.actualizarColaborador(colaborador)
            if (res.procesado) {
                const idBizneo = Number(colaborador.id_bizneo) ?? 0;
                const salario = res.sueldo ?? 0;
                const id_bitacora = colaborador.id_bitacora!;
                await this.colaboradorService.actualizarIDBizneo(idBizneo, id_bitacora);
                await this.sincronizarSalario(idBizneo, salario);
            }
            result.push(res)
        }
        return result;
    }

    private async actualizarColaborador(colaborador: BitacoraPersonal): Promise<ColaboradorResult> {
        const { personal, id_bizneo } = colaborador;
                
        const resp = await this.bizneoClient.obtenerPersonalPorID(id_bizneo!)        
        const { user } = resp
        if (user === null) {
            return {
                personal,
                id_bizneo: undefined,
                sueldo: 0,
                mensaje: 'No existe en Bizneo',
                procesado: false,

            }
        }
        const personalDB = await this.colaboradorService.detalleIntelisis(personal);
        if (personalDB === null) {
            return {
                personal,
                id_bizneo:undefined,
                sueldo: 0,
                mensaje: 'No existe en Intelisis',
                procesado: false,
            }
        }

       
       const access =personalDB.Estatus.trim()=="ALTA"?'enabled':'revoked';  
       const id_personal =personalDB.Personal.trim();
       const id_bizneoNumber =Number(id_bizneo) ?? 0;       
       await this.sincronizarEstatus(id_personal,id_bizneoNumber,access);

        const res = await this.bizneoClient.actualizarPerfil(id_bizneo!, {
            first_name: personalDB.Nombre,
            last_name: `${personalDB.ApellidoPaterno} ${personalDB.ApellidoMaterno}`,
            external_id: id_personal,
            pin: personalDB.Personal.trim(),
            numero_de_empleado:id_personal,
            email: personalDB.eMail,
            "Codigo Postal": personalDB.CodigoPostal,
            "Alcaldia o Municipio": personalDB.Delegacion,
            "Calle y No": personalDB.Direccion,
            Colonia: personalDB.Colonia,
            Ciudad: personalDB.Poblacion,
            Estado: personalDB.Estado,
            birthday: personalDB.FechaNacimiento.toISOString().split('T')[0],
            curp: personalDB.Registro,
            email_personal: personalDB.eMail,
            gender: personalDB.Sexo,
            access
                
        });
        return {
            personal,   
            sueldo: personalDB.SueldoDiario,                                 
            id_bizneo: id_bizneoNumber,
            procesado: res.procesado,
            mensaje: access=='enabled'?`${res.mensaje} con el estatus`:"Personal dado de baja en Bizneo"
        }
    }

    private async sincronizarSalario(idBizneo: number, sdi: number) {

        const salarios = await this.bizneoClient.obtenerSalarios(idBizneo);
        let newSDI = sdi * 30;
        if (salarios.length == 0) {
            await this.bizneoClient.registrarSalario(idBizneo, newSDI);
            return;
        }
        const salariosPorIdDesc = salarios.sort((a, b) => b.id - a.id);
        const { amount, id } = salariosPorIdDesc.at(0)!;
        const esIgual = (amount.amount) == newSDI.toString();
        if (!esIgual) {
            await this.bizneoClient.registrarSalario(idBizneo, newSDI);
            await this.bizneoClient.inHabilitarSalario(idBizneo, id);
        }




    }
}