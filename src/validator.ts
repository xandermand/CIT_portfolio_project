import { User } from "./Model/users.js";

function passwordIsWeak(value: unknown): value is string{
    return typeof value !== "string" || value.length < 8;
}

function emailIsWrong(value: unknown): value is string{
    const emailREGEX = /^[^\s@]+@[^\s@]+\.(com|dk)$/;
    return typeof value !== "string" || !emailREGEX.test(value);
}

function nonEmpty(value: unknown): value is string{
    return typeof value === 'string' && value.trim() !== '';
}

export function validateNewUser(body: unknown): User | undefined{
    if (body === null || typeof body !== 'object'){
        return undefined;
    }
    const b = body as Record<string,unknown>;
    if (!nonEmpty(b.username)){
        return undefined
    }
    if  (passwordIsWeak(b.password)){
        return undefined
    }
    if (emailIsWrong(b.email)){
        return undefined
    }

    return {user_id: "", username: b.username, email:String(b.email), password: String(b.password)}

}