
import { PrismaClient, Prisma } from '@prisma/client';
import { ColaboradorIntelisis } from "../domain/interfaces/entities/colaborador-intelisis.entity";


export class ColaboradorService {

  private readonly dbIntelisis = process.env.DB_INTELISIS;
  constructor(private prismaClient: PrismaClient) {

  }

  ejecutarTransaction = async () => {


    return await this.prismaClient.$queryRawUnsafe(
      ` Begin tran
     use ${this.dbIntelisis};
     ;disable trigger trg_updateBizneoPersonal on Personal
     update Personal set Nombre ='MARCO ANTONIO'  where Personal=2801;
      ;enable trigger  trg_updateBizneoPersonal on Personal
     commit tran
   `
    );

  }

  detalleIntelisis = async (Personal: string) => {
    const [personal] = await this.prismaClient.$queryRawUnsafe<ColaboradorIntelisis[]>(`SELECT * FROM ${this.dbIntelisis}.dbo.Personal WHERE personal = ${Personal}`);
    return personal;
  };

  obtenerPorProcesar = async (action: string) => {

    const data = await this.prismaClient.bitacoraPersonal.findMany({ where: { procesado: false, action } });
    return data.map(p => { return { ...p, personal: p.personal.trim() } });
  }

  procesarBitacora = async (id_bitacora: number) => {

    return this.prismaClient.bitacoraPersonal.update({
      where: { id_bitacora },
      data: { procesado: true }
    });


  }

  insertOrCreateUserBizneo = async (id_bizneo: number, personal: string) => {

    return this.prismaClient.personalBizneo.upsert({
      create: { id_bizneo: id_bizneo.toString(), personal },
      update: { id_bizneo: id_bizneo.toString(), personal },
      where: { personal }

    });
  }


  obtenerIdPersonalBizneo = async (personal: string) => {
    return this.prismaClient.personalBizneo.findUnique({ where: { personal } });
  }

  obtenerDepartamento = async (nombre: string) => {
    const [deps] = await this.prismaClient.departamento.findMany({ where: { nombre } });
    return deps;
  }

  insertarBitacora = async (personal: string, action: string, id_bizneo?: string) => {
    return this.prismaClient.bitacoraPersonal.create({ data: { personal, action } });
  }


  registrarEvento = async (data: Prisma.EventoCreateInput) => {
    return this.prismaClient.evento.create({ data });
  }
  obtenerEvento = async (id_evento: number) => {
    return this.prismaClient.evento.findUnique({ where: { id_evento, }, include: { Checada: true } });
  }

  borrarEvento = async (id_evento: number) => {
    await this.prismaClient.evento.update({
      where: { id_evento },
      data: { Checada: { deleteMany: {} } },
      include: { Checada: true }
    });
    return this.prismaClient.evento.delete({ where: { id_evento } });
  }




}
