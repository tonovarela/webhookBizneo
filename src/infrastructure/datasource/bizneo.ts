
import { ApiBizneo } from "../../config/bizneo.api";
import { CreateUserRequest } from "../../domain/interfaces/bizneo/createUser.interface";
import { ResponseUser, User } from '../../domain/interfaces/bizneo/responseUser.interface';
import { ResponseUserByFilter } from "../../domain/interfaces/bizneo/responseUserByFilter.interface";
export class Bizneo {
  constructor() { }

  obtenerPersonal = async (personal: string) => {
    const { data } = await ApiBizneo.get<ResponseUserByFilter>(
      `/api/v1/users/?filters[external_id]=${personal}`
    );
    return data;
  };

  obtenerPersonalPorEmail = async (email: string) => {
    const { data } = await ApiBizneo.get<ResponseUserByFilter>(
      `/api/v1/users/?filters[email]=${email}`
    );
    return data;
  };

  obtenerPersonalPorID = async (id: string) => {
    try {
      const { data } = await ApiBizneo.get<ResponseUser>(`/api/v1/users/${id}`);
      return data;
    } catch (error) {
      return { user: null };
    }
  };
  crearPersonal = async (
    request: CreateUserRequest
  ): Promise<{ user?: User | null; mensaje: string }> => {
    console.log(request);
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
}
