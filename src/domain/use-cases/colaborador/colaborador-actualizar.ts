import { BitacoraPersonal } from "@prisma/client";
import { ColaboradorResult } from "../../interfaces/bizneo/colaborador-result";
import { ColaboradorService } from "../../../services/colaborador.service";
import { Bizneo } from "../../../infrastructure/datasource/bizneo";

interface ColaboradorActualizarUseCase {
    execute(colaboradores: BitacoraPersonal[]): Promise<ColaboradorResult[]>
}

export class ColaboradorActualizar implements ColaboradorActualizarUseCase {
    constructor(private readonly colaboradorService: ColaboradorService, private readonly bizneoClient: Bizneo) { }
    async execute(colaboradores: BitacoraPersonal[]): Promise<ColaboradorResult[]> {
        let result: ColaboradorResult[] = [];
        for (const colaborador of colaboradores) {
            const res = await this.actualizarColaborador(colaborador)            
            if (res.procesado){
                await this.colaboradorService.actualizarIDBizneo(res.usuario.id, colaborador.id_bitacora!);
            }
            result.push(res)
        }
        return result;
    }

    private async actualizarColaborador(colaborador: BitacoraPersonal): Promise<ColaboradorResult> {
        const { personal, id_bizneo } = colaborador
        const resp = await this.bizneoClient.obtenerPersonalPorID(id_bizneo!)
        const { user } = resp
        if (user === null) {
            return {
                personal,
                usuario: null,
                mensaje: 'No existe en Bizneo',
                procesado: false,
            }
        }
        const p = await this.colaboradorService.detalleIntelisis(personal);
        if (p === null) {
            return {
                personal,
                usuario: user,
                mensaje: 'No existe en Intelisis',
                procesado: false,
            }
        }
        const res = await this.bizneoClient.actualizarPerfil(id_bizneo!, {
            first_name: p.Nombre,
            last_name: `${p.ApellidoPaterno} ${p.ApellidoMaterno}`,
            external_id: p.Personal,
            pin: p.Personal, 
            numero_de_empleado: p.Personal, 
            email: p.eMail,
            "Codigo Postal": p.CodigoPostal,
            "Alcaldia o Municipio":p.Delegacion,
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
            usuario: user,
            procesado: res.procesado,
            mensaje: res.mensaje
        }




    }
}