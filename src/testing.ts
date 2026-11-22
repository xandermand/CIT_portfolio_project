import { generateSalt, hashPassword } from "./services/passwordmanager.js";

const salt = generateSalt();
const password = "11111111";

const hash = hashPassword(salt,password);

console.log(hash);

