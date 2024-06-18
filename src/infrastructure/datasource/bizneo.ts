
import { ApiBizneo } from "../../config/bizneo.api";
import { CreateUserRequest, Contrato, ResponseSalaries, ResponseUser, ResponseUserByFilter, User } from "../../domain/interfaces/bizneo";


export class Bizneo {
  constructor() { }

  /**
   * Retrieves personal information from the Bizneo API based on the provided external ID.
   * @param personal - The external ID of the personal to retrieve.
   * @returns A Promise that resolves to the retrieved personal data.
   */
  obtenerPersonal = async (personal: string) => {
    const { data } = await ApiBizneo.get<ResponseUserByFilter>(
      `/api/v1/users/?filters[external_id]=${personal}`
    );
    return data;
  };

  /**
   * Retrieves the salaries for a specific user.
   * @param id - The ID of the user.
   * @returns A Promise that resolves to an array of ResponseSalaries objects.
   */
  obtenerSalarios = async (id:number) => {
    const { data } = await ApiBizneo.get<ResponseSalaries[]>(`/api/v1/users/${id}/salaries`);
    return data;
  };

  inHabilitarSalario = async (id:number, idSalario:number) => {
    const { data } = await ApiBizneo.put(`/api/v1/users/${id}/salaries/${idSalario}`,{
      "end_at": new Date().toISOString().split('T')[0]      
    });
    return data;
  }

  registrarSalario = async (id:number, salario:number) => {
    const body = {
      amount: `${salario.toString().replace(".",",")} MXN`,
      frequency: "monthly",
      end_at:new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0],
      start_at: new Date().toISOString().split('T')[0]
    }       
    const { data } = await ApiBizneo.post(`/api/v1/users/${id}/salaries`,body);
    return data;
  }

  obtenerPersonalPorEmail = async (email: string) => {
    const { data } = await ApiBizneo.get<ResponseUserByFilter>(
      `/api/v1/users/?filters[email]=${email}`
    );
    return data;
  };

  obtenerPersonalPorID = async (id: string) => {
    try {
      const { data } = await ApiBizneo.get<ResponseUser>(`/api/v1/users/${id}`);
      return  data;
    } catch (error) {
      return { user: null };
    }
  };


  crearPersonal = async (
    request: CreateUserRequest
  ): Promise<{ user?: User | null; mensaje: string }> => {    
    try {
      const { data } = await ApiBizneo.post<ResponseUser>(`/api/v1/users`, request);
      return { user: data.user, mensaje: "Usuario creado correctamente" };
    } catch (error: any) {
      return { user: null, mensaje: error.response!.data };
    }
  };


  asociarDepartamento = async (id_personalBizneo: string, id_departamentoBizneo: number) => {
    try {
      const body = {
        start_at: new Date().getFullYear() + "-01-01",
        end_at: null,
        taxons: [id_departamentoBizneo]
      };
      await ApiBizneo.post(`/api/v1/users/${id_personalBizneo}/taxons`, body);
      return { procesado: true, mensaje: "Departamento actualizado correctamente" };
    }
    catch (error: any) {
      return { procesado: false, mensaje: error.response!.data }
    }
  }

  actualizarPerfil = async (id_personalBizneo: string, user: Partial<User>) => {
    try {
      await ApiBizneo.put(`/api/v1/users/${id_personalBizneo}`, { user });
      return { procesado: true, mensaje: "Perfil actualizado correctamente" };
    }
    catch (error: any) {
      return { procesado: false, mensaje: error.response!.data }
    }
  }

  listarContratos = async (id_personalBizneo: number) => {
    const  {data} = await ApiBizneo.get<Contrato[]>(`/api/v1/users/${id_personalBizneo}/work-contracts`);
    return data;
  }


  
  eliminarContrato = async (id_personalBizneo: number, id_contrato: number) => {
    try {
      await ApiBizneo.delete(`/api/v1/users/${id_personalBizneo}/work-contracts/${id_contrato}`);
      return { procesado: true, mensaje: "Contrato eliminado correctamente" };
    }
    catch (error: any) {
      return { procesado: false, mensaje: error.response!.data }
    }
  }


  registrarContrato = async (id_personalBizneo: number,fechaContratacion:Date) => {
    
    try {      
      await ApiBizneo.post(`/api/v1/users/${id_personalBizneo}/work-contracts`, {
          start_at: fechaContratacion.toISOString().split('T')[0],          
          end_at: null,
          accumulate_seniority:false,
          fte:1
      }
       );
      return { procesado: true, mensaje: "Contrato registrado correctamente" };
    }
    catch (error: any) {
      return { procesado: false, mensaje: error.response!.data }
    }
  }
}
