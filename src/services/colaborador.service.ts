import { PrismaClient } from '@prisma/client'
import { ColaboradorIntelisis } from "../domain/interfaces/entities/colaborador-intelisis.entity";


const prismaClient = new PrismaClient();
export class ColaboradorService {

  private readonly dbIntelisis = process.env.DB_INTELISIS;
  constructor() {

  }
  detalleIntelisis = async (Personal: string) => {
    const [personal] = await prismaClient.$queryRawUnsafe<ColaboradorIntelisis[]>(`SELECT * FROM ${this.dbIntelisis}.dbo.Personal WHERE personal = ${Personal}`);
    return personal;
  };

  obtenerPorProcesar() {
    return prismaClient.bitacoraPersonal.findMany({ where: { procesado: false } })
  }

  actualizarIDBizneo = async (id_bizneo: number, id_bitacora: number) => {
    return prismaClient.bitacoraPersonal.update({
      where: { id_bitacora },
      data: { id_bizneo: `${id_bizneo}`, procesado: true }
    });


  }
  actualizarIDBizneoIntelisis = async (id_bizneo: number, personal: string) => {
    return prismaClient.$queryRawUnsafe(`UPDATE ${this.dbIntelisis}.dbo.Personal SET Contrasena = ${id_bizneo} WHERE personal = ${personal}`);
  }

  obtenerDepartamento = async (nombre: string) => {
    const [deps]= await prismaClient.departamento.findMany({ where: { nombre } });
    return deps;
  }



}
