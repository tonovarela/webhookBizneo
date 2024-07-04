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
            const personalBizneo = await this.colaboradorService.obtenerIdPersonalBizneo(colaborador.personal.trim());
            if (personalBizneo != null) {
                const {id_bizneo} = personalBizneo;
                const res = await this.actualizarColaborador(id_bizneo)
                if (res.se_procesa) {
                    const idBizneo = Number(id_bizneo) ?? 0;
                    const salario = res.sueldo ?? 0;
                    const id_bitacora = colaborador.id_bitacora!;
                    await this.colaboradorService.procesarBitacora(id_bitacora);
                    await this.sincronizarSalario(idBizneo, salario);
                }
                result.push(res)
            }
        }
        return result;
    }
    private async actualizarColaborador(id_bizneo: string): Promise<ColaboradorResult> {        
        const personalBizneo = await this.bizneoClient.obtenerPersonalPorID(id_bizneo!)
        const { user } = personalBizneo;
        if (user === null) {
            return {
                personal: '',
                id_bizneo: undefined,
                sueldo: 0,
                mensaje: 'No existe en Bizneo',
                se_procesa: false
            }
        }
        const numeroPersonal = user.external_id;
        const personalDBIntelisis = await this.colaboradorService.detalleIntelisis(numeroPersonal);
        if (personalDBIntelisis === null) {
            return {
                personal: numeroPersonal,
                id_bizneo: undefined,
                sueldo: 0,
                mensaje: 'No existe en Intelisis',
                se_procesa: false,
            }
        }
        const access = personalDBIntelisis.Estatus.trim() == "ALTA" ? 'enabled' : 'revoked';        
        const id_bizneoNumber = Number(id_bizneo) ?? 0;
        await this.sincronizarEstatus(numeroPersonal, id_bizneoNumber, access);
        const res = await this.bizneoClient.actualizarPerfil(id_bizneo!, {
            first_name: personalDBIntelisis.Nombre,
            last_name: `${personalDBIntelisis.ApellidoPaterno} ${personalDBIntelisis.ApellidoMaterno}`,
            external_id: numeroPersonal,
            pin: personalDBIntelisis.Personal.trim(),
            numero_de_empleado: numeroPersonal,
            email: personalDBIntelisis.eMail,
            "Codigo Postal": personalDBIntelisis.CodigoPostal,
            "Alcaldia o Municipio": personalDBIntelisis.Delegacion,
            "Calle y No": personalDBIntelisis.Direccion,
            Colonia: personalDBIntelisis.Colonia,
            Ciudad: personalDBIntelisis.Poblacion,
            Estado: personalDBIntelisis.Estado,
            birthday: personalDBIntelisis.FechaNacimiento.toISOString().split('T')[0],
            curp: personalDBIntelisis.Registro,
            email_personal: personalDBIntelisis.eMail,
            gender: personalDBIntelisis.Sexo,
            access
        });
        return {
            personal: numeroPersonal,
            sueldo: personalDBIntelisis.SueldoDiario,
            id_bizneo: id_bizneoNumber,
            se_procesa: res.procesado,
            mensaje: access == 'enabled' ? `${res.mensaje}` : "Personal dado de baja en Bizneo"
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