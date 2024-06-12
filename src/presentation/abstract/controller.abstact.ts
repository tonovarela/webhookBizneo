
import  {  Response } from 'express';
import { CustomError } from '../../domain/errors/error.custom';

export abstract  class AbstractController  { 

    protected handleError = (error: unknown, res: Response) => {
        if (error instanceof CustomError)
            return res.status(error.status).json({ error: error.mensaje });

        return res.status(500).json({ "error": "Internal server error" });
    }    

}