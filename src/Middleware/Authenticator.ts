import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { CreateError } from './Errorhandler.js';

export function authenticator(req: Request, res: Response, next: NextFunction) {
        const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return next(CreateError('No token provided', 401));
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT!) as jwt.JwtPayload & { user_id: string };       
        res.locals.user_id = decoded.user_id;
        next();
    } catch (err) {
        return next(CreateError('Invalid token', 401));
    }
}
