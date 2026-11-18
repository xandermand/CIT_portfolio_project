import { type Request, type Response, type NextFunction } from 'express';


export function errorHandler(err: Error & { status?: number }, req: Request, res: Response, next: NextFunction) {
    console.error(err.stack);
    const status = err.status ||500;
    if (res.headersSent) {
        return next(err);}
    res.status(status).json({ error: err.message ||'Internal server error' });
}

export function CreateError(message: string, status: number) {
    const err = new Error(message) as Error & { status?: number };
    err.status = status;
    return err;
}