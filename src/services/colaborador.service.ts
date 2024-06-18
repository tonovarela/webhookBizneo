
import { PrismaClient } from "@prisma/client";
import { ColaboradorIntelisis } from "../domain/interfaces/entities/colaborador-intelisis.entity";


export class ColaboradorService {

  private readonly dbIntelisis = process.env.DB_INTELISIS;
  constructor(private prismaClient:PrismaClient) {
        
  }

  ejecutarTransaction = async () => {
return     await this.prismaClient.$queryRawUnsafe(
   ` Begin tran
     use ${this.dbIntelisis};
     ;disable trigger trg_updateBizneoPersonal on Personal
     update Personal set Nombre ='MARCO ANTONIO'  where Personal=2801;
      ;enable trigger  trg_updateBizneoPersonal on Personal
     commit tran
   `
    ) ;
  
  }

  detalleIntelisis = async (Personal: string) => {
    const [personal] = await this.prismaClient.$queryRawUnsafe<ColaboradorIntelisis[]>(`SELECT * FROM ${this.dbIntelisis}.dbo.Personal WHERE personal = ${Personal}`);
    return personal;
  };

  obtenerPorProcesar =async(action:string)=> {
    const data =  await  this.prismaClient.bitacoraPersonal.findMany({ where: { procesado: false,action  } });
    return data.map(p => { return{...p,personal:p.personal.trim() }});
  }

  actualizarIDBizneo = async (id_bizneo: number, id_bitacora: number) => {
    return this.prismaClient.bitacoraPersonal.update({
      where: { id_bitacora },
      data: { id_bizneo: `${id_bizneo}`, procesado: true }
    });


  }
  actualizarIDBizneoIntelisis = async (id_bizneo: number, personal: string) => {
    return this.prismaClient.$queryRawUnsafe(`UPDATE ${this.dbIntelisis}.dbo.Personal SET Usuario = ${id_bizneo} WHERE personal = ${personal}`);
  }

  obtenerDepartamento = async (nombre: string) => {
    const [deps]= await this.prismaClient.departamento.findMany({ where: { nombre } });
    return deps;
  }



}
