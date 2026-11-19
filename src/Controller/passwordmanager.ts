import crypto, {createHash} from "crypto"

export async function hashPassword(salt:string, password: string): Promise<string> {
    const hash = await createHash("sha256").update(salt+password).digest("hex");
    return hash;
}

export function generateSalt(): string{
    return crypto.randomBytes(8).toString("hex");
}

