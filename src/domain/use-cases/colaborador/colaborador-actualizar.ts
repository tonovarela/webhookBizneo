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
        let _id_bizneo = id_bizneo;
        
        
        const resp = await this.bizneoClient.obtenerPersonalPorID(_id_bizneo!)        
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
        const p = await this.colaboradorService.detalleIntelisis(personal);
        if (p === null) {
            return {
                personal,
                id_bizneo:undefined,
                sueldo: 0,
                mensaje: 'No existe en Intelisis',
                procesado: false,
            }
        }
        const res = await this.bizneoClient.actualizarPerfil(_id_bizneo!, {
            first_name: p.Nombre,
            last_name: `${p.ApellidoPaterno} ${p.ApellidoMaterno}`,
            external_id: p.Personal.trim(),
            pin: p.Personal.trim(),
            numero_de_empleado: p.Personal.trim(),
            email: p.eMail,
            "Codigo Postal": p.CodigoPostal,
            "Alcaldia o Municipio": p.Delegacion,
            "Calle y No": p.Direccion,
            Colonia: p.Colonia,
            Ciudad: p.Poblacion,
            Estado: p.Estado,
            birthday: p.FechaNacimiento.toISOString().split('T')[0],
            curp: p.Registro,
            email_personal: p.eMail,
            gender: p.Sexo,
        });
        return {
            personal,            
            sueldo: p.SueldoDiario,
            id_bizneo: +_id_bizneo!,
            procesado: res.procesado,
            mensaje: res.mensaje
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