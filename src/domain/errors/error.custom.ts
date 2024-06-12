export class CustomError extends Error {

    private constructor(public readonly status: number, public readonly mensaje: string) {
        super(mensaje);
        
    }

    static badRequest(mensaje: string): CustomError {            
        throw new CustomError(400, mensaje);
    }

    static unAuthorized(mensaje: string): CustomError {
        throw new CustomError(401, mensaje);
    }

    static forbidden(mensaje: string): CustomError {
        throw new CustomError(401, mensaje);
    }
    static notFound(mensaje: string): CustomError {
        throw new CustomError(404, mensaje);
    }

    static internalServerError(mensaje: string): CustomError {        
        throw new CustomError(500, mensaje);
    }
}