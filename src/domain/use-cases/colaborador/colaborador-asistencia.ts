
import { Prisma } from "@prisma/client";
import { Bizneo } from "../../../infrastructure/datasource/bizneo";
import { ColaboradorService } from "../../../services/colaborador.service";
import { ColaboradorResult } from "../../interfaces/bizneo";
import { LoggedTimeElement } from "../../interfaces/bizneo/response-checadas.interface";


interface IColaboradorAsistencia extends ColaboradorResult {
    evento?: Prisma.EventoCreateInput;
    checada?: LoggedTimeElement;
    borrar: boolean;
}

interface ColaboradorAsistenciaUseCase {
    execute(idsBizneo: string[], inicio: Date, fin: Date): Promise<ColaboradorResult[]>;
}

export class ColaboradorAsistencia implements ColaboradorAsistenciaUseCase {
    constructor(private bizneoClient: Bizneo, private colaboradorService: ColaboradorService) { }

    async execute(idsBizneo: string[], inicio: Date, fin: Date): Promise<ColaboradorResult[]> {
        let listaPersonalAsistencia:IColaboradorAsistencia[]=[];
        for (const idBizneo of idsBizneo) {
           const asistencia = await this.obtenerPersonalAsistencia(idBizneo, inicio, fin);    

            listaPersonalAsistencia = [...listaPersonalAsistencia,...asistencia];
        }
        console.log(listaPersonalAsistencia);
        for (const evento of listaPersonalAsistencia.filter(p => p.se_procesa)) {            
            if (evento.borrar) {
                await this.colaboradorService.borrarEvento(evento.checada!.logged_time.id);
            }
            await this.colaboradorService.registrarEvento(this.createEventoDB(evento.checada!, evento.personal));
            evento.mensaje = evento.borrar? `Se registraron ${evento.checada?.logged_time.logged_hours.length} checadas ademas de las ya registradas` :
                `Se registraron ${evento.checada?.logged_time.logged_hours.length} checadas`;
        };
        return listaPersonalAsistencia.map(asistencia => {
            const { evento, checada, borrar, ...rest } = asistencia;
            return rest;
        });

    }






    private async obtenerPersonalAsistencia(idBizneo: string, inicio: Date, fin: Date): Promise<IColaboradorAsistencia[]> {
        let result: IColaboradorAsistencia[] = [];        
            const responseValidacion = await this.validarUsuario(idBizneo);
            const {se_procesa }= responseValidacion;
            
            if (!se_procesa) {
                result.push({ ...responseValidacion, se_procesa, borrar: false });                
                return result;
                
            }
            const numeroPersonal = responseValidacion.personal;
            const responseChecadas = await this.bizneoClient.obtenerChecadas(+idBizneo, inicio, fin);
           
            for (const checada of responseChecadas.checadas) {
                if (checada.logged_time.logged_hours.length == 0) {
                    continue;
                }
                const eventoDB = await this.colaboradorService.obtenerEvento(checada.logged_time.id);
                const totalChecadasBizneo = checada.logged_time.logged_hours.length;
                const totalChecadasDB = eventoDB ? eventoDB.Checada.length : 0;                
                if (totalChecadasBizneo === totalChecadasDB){
                    continue;
                }
                let borrar = false;
                if (eventoDB && totalChecadasDB < totalChecadasBizneo) {
                    borrar = true;
                    
                };                
                result.push({
                    personal: numeroPersonal,
                    id_bizneo: +idBizneo,
                    checada,
                    borrar,
                    mensaje: ``,
                    se_procesa,
                });
            }


        return result;
    }


    private createEventoDB(checada: LoggedTimeElement, numeroPersonal: string): Prisma.EventoCreateInput {
        const checadas = checada.logged_time.logged_hours.map((ch) => {
            const inicio = new Date(`${checada.logged_time.date}T${ch.start_at}.000Z`);
            let fin = new Date(`${checada.logged_time.date}T${ch.end_at}.000Z`);
            if (fin < inicio) {
                fin.setDate(inicio.getDate() + 1);
            }
            return {
                id_checada: Math.random().toString(36).substring(7),
                tipo: ch.kind,
                inicio,
                fin
            };
        });
        const registro: Prisma.EventoCreateInput = {
            id_evento: checada.logged_time.id,
            fecha_evento:new Date(`${checada.logged_time.date}T12:00:00.000Z`),
            personal: numeroPersonal,
            fecha_registro: new Date(),
            Checada: { create: checadas }
        };

        return registro;
    }


    private async validarUsuario(idBizneo: string): Promise<ColaboradorResult> {

        const personalBizneo = await this.bizneoClient.obtenerPersonalPorID(idBizneo!)
        const { user } = personalBizneo;

        if (user == null) {
            return {
                personal: '',
                id_bizneo: 0,
                mensaje: 'No existe en Bizneo',
                se_procesa:false

            };
        }
        const numeroPersonal = user!.external_id;
        const personalDBIntelisis = await this.colaboradorService.detalleIntelisis(numeroPersonal);
        if (personalDBIntelisis === null) {
            return {
                personal: numeroPersonal,
                id_bizneo: 0,
                mensaje: 'No existe en Intelisis',
                se_procesa: false

            };

        }
        if (personalDBIntelisis.Estatus.trim() != "ALTA") {
            return {
                personal: numeroPersonal,
                id_bizneo: 0,
                mensaje: 'Personal no activo en Intelisis',
                se_procesa: false

            }
        }

        return {
            personal: numeroPersonal,
            id_bizneo: +idBizneo,
            mensaje: 'OK',
            se_procesa: true

        };

    }

}
