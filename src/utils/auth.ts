import bcrypt from "bcrypt"

/**
 * Funcion para encriptar la contraseña
 * @param password Contraseña a encriptar
 * @returns 
 */
export const hashPassword = async (password : string) => {
    const salt = await bcrypt.genSalt(10)
    return await bcrypt.hash(password, salt)
}

/**
 * Funcion para comparar la contraseña
 * @param enteredPassword Contraseña ingresada
 * @param storedHash Contraseña hasheada
 * @returns 
 */
export const checkPassword = async (enteredPassword : string, storedHash : string) => {
    return await bcrypt.compare(enteredPassword, storedHash)
}