import { BitacoraPersonal, Departamento } from '@prisma/client';
import { Bizneo } from "../../../infrastructure/datasource/bizneo"
import { ColaboradorService } from "../../../services/colaborador.service"
import { ColaboradorResult } from '../../interfaces/bizneo/colaborador-result';
import { AbstractColaboradorUseCase } from './AbstractColaborador';



export class ColaboradorAlta  extends AbstractColaboradorUseCase {
    constructor( readonly colaboradorService: ColaboradorService,  readonly bizneoClient: Bizneo) {
        super(colaboradorService, bizneoClient);
     }
    
    async execute(colaboradores: BitacoraPersonal[]): Promise<ColaboradorResult[]> {
        let resultado = []
        for (const colaborador of colaboradores) {
            const res = await this.procesarColaboradoresPendientes(colaborador)
            if (res.procesado) {
                const { id: idBizneo } = res.usuario
                await this.colaboradorService.actualizarIDBizneo(idBizneo, colaborador.id_bitacora)
                await this.colaboradorService.actualizarIDBizneoIntelisis(idBizneo, colaborador.personal)
                await this.asociarDepartamento(idBizneo, colaborador.personal);
                await this.sincronizarEstatus(colaborador);
                
            }
            resultado.push(res)

        }
        return resultado
    }


    private asociarDepartamento = async (id_personalBizneo: string, personal: string) => {
        const { Departamento } = await this.colaboradorService.detalleIntelisis(personal);
        if (Departamento != null) {
            const { id_departamento } = await this.colaboradorService.obtenerDepartamento(Departamento);
            await this.bizneoClient.asociarDepartamento(id_personalBizneo, id_departamento)            
        }
    }

    private async procesarColaboradoresPendientes(colaborador: BitacoraPersonal): Promise<ColaboradorResult> {
        const { personal } = colaborador
        const resp = await this.bizneoClient.obtenerPersonal(personal)        
        if (resp.pagination.total_entries != 0) {
            const [user] = resp.users
            
            return {
                personal,
                usuario: user,
                mensaje: 'Ya existe en Bizneo',
                procesado: true,
            };
        }
        const personalPendiente = await this.colaboradorService.detalleIntelisis(personal)
        if (personalPendiente == null) {
            return {
                personal,
                usuario: null,
                mensaje: 'No se encuentra registrado en Intelisis',
                procesado: false,

            };
        }
        const nuevoUsuario = {
            user: {
                email: personalPendiente!.eMail || '',
                first_name: personalPendiente!.Nombre ?? '',
                last_name: personalPendiente!.ApellidoPaterno || '',
            },
        }
        const { user, mensaje } = await this.bizneoClient.crearPersonal(nuevoUsuario)
        
        if (user == null) {
            return {
                personal,
                usuario: nuevoUsuario,
                mensaje: JSON.stringify(mensaje),
                procesado: false,
            }
        }
        return {
            personal,
            usuario: user,
            mensaje: 'Registrado en Bizneo',
            procesado: true,
        };
    }

}